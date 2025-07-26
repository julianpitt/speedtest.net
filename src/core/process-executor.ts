import { spawn } from "child_process";
import { Readable } from "stream";
import kill from "tree-kill";

import type {
  SpeedtestOptions,
  SpeedtestResult,
  ProgressData,
} from "../types/interfaces.js";
import { BinaryManager } from "./binary-manager.js";
import { ProgressTracker } from "../utils/progress.js";
import { setupCancellation } from "./cancellation.js";
import { SpeedtestOptionsSchema } from "../types/interfaces.js";

/**
 * Creates a pending promise that can be resolved or rejected externally
 */
interface PendingPromise<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

const createPendingPromise = <T>(): PendingPromise<T> => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

/**
 * Process lines from a stream, calling onLine for each complete line
 * @param stream - Readable stream to process
 * @param onLine - Callback for each line
 */
const lineify = (stream: Readable, onLine: (line: string) => void): void => {
  let rest = "";
  stream.setEncoding("utf8");

  stream.on("data", (data: string) => {
    rest += data;
    let match: RegExpExecArray | null;

    // Process all complete lines
    while ((match = /(^.*?)(\r)?\n/.exec(rest))) {
      onLine(match[1]);
      rest = rest.slice(match[0].length);
    }
  });

  stream.on("end", () => {
    if (rest) {
      onLine(rest);
    }
  });
};

/**
 * Main speedtest executor class
 */
export class SpeedtestExecutor {
  private readonly binaryManager: BinaryManager;

  constructor(rootDir?: string) {
    this.binaryManager = new BinaryManager(rootDir);
  }

  /**
   * Execute speedtest with given options
   * @param options - Speedtest configuration options
   * @returns Promise that resolves to speedtest result
   */
  async execute(options: SpeedtestOptions = {}): Promise<SpeedtestResult> {
    // Extract cancel function separately to avoid Zod validation issues
    const { cancel = () => false, ...otherOptions } = options;

    // Validate other options
    const validatedOptions = SpeedtestOptionsSchema.parse(otherOptions);

    const {
      acceptLicense = false,
      acceptGdpr = false,
      progress,
      serverId,
      sourceIp,
      host,
      binaryVersion,
      verbosity = 0,
    } = validatedOptions;

    // Get binary path
    const binary =
      options.binary ||
      (await this.binaryManager.ensureBinary({ binaryVersion }));

    // Build CLI arguments
    const args = this.buildArguments({
      acceptLicense,
      acceptGdpr,
      serverId,
      sourceIp,
      host,
      verbosity,
      enableProgress: Boolean(progress),
    });

    // Start CLI process
    const cliProcess = spawn(binary, args, { windowsHide: true });
    const {
      promise,
      resolve,
      reject: rejectPromise,
    } = createPendingPromise<SpeedtestResult>();

    let aborted = false;
    const reject = (err: Error) => {
      aborted = true;
      rejectPromise(err);
    };

    // Set up cancellation
    if (
      setupCancellation(cancel, () => {
        aborted = true;
        process.nextTick(() => reject(new Error("Test aborted")));
      })
    ) {
      throw new Error("Test aborted");
    }

    // Set up line processing
    const progressTracker = new ProgressTracker();
    const errorLines: string[] = [];
    let result: SpeedtestResult | undefined;

    const handleLine = (isError: boolean, line: string) => {
      if (aborted) return;

      if (line.startsWith("{")) {
        const data = this.parseJsonLine(line);
        if (data) {
          this.processJsonData(
            data,
            progressTracker,
            progress,
            reject,
            (res) => {
              result = res;
            }
          );
          return;
        }
      }

      if (!line.trim()) return;

      if (isError && !this.isInfoOrWarning(line)) {
        errorLines.push(line);
      }
    };

    // Set up stream handlers
    lineify(cliProcess.stderr!, (line) => handleLine(true, line));
    lineify(cliProcess.stdout!, (line) => handleLine(false, line));

    // Set up process handlers
    cliProcess.on("exit", () => resolve(result!));
    cliProcess.on("error", (origError) => {
      reject(new Error(errorLines.concat(origError.message).join("\n")));
    });

    try {
      await promise;
    } finally {
      // Clean up process
      const pid = cliProcess.pid;
      if (pid) {
        cliProcess.kill();
        kill(pid);
      }
    }

    // Handle errors
    if (errorLines.length) {
      const errorMessage = this.processErrorLines(errorLines);
      if (errorMessage) {
        throw new Error(errorMessage);
      }
    }

    if (!result) {
      throw new Error("No result received from speedtest");
    }

    return result;
  }

  /**
   * Build CLI arguments from options
   */
  private buildArguments(options: {
    acceptLicense: boolean;
    acceptGdpr: boolean;
    serverId?: string;
    sourceIp?: string;
    host?: string;
    verbosity: number;
    enableProgress: boolean;
  }): string[] {
    const args = ["-f", "json", "-P", "8"];

    // Add verbosity flags
    for (let i = 0; i < options.verbosity; i++) {
      args.push("-v");
    }

    if (options.enableProgress) args.push("-p");
    if (options.acceptLicense) args.push("--accept-license");
    if (options.acceptGdpr) args.push("--accept-gdpr");
    if (options.serverId) args.push("-s", options.serverId);
    if (options.sourceIp) args.push("-i", options.sourceIp);
    if (options.host) args.push("-o", options.host);

    return args;
  }

  /**
   * Parse JSON line safely
   */
  private parseJsonLine(line: string): any {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }

  /**
   * Check if error line is just info or warning
   */
  private isInfoOrWarning(line: string): boolean {
    return /] \[(info|warning)]/.test(line);
  }

  /**
   * Process JSON data from CLI
   */
  private processJsonData(
    data: any,
    progressTracker: ProgressTracker,
    progressCallback?: (data: ProgressData) => void,
    reject?: (error: Error) => void,
    setResult?: (result: SpeedtestResult) => void
  ): void {
    // Handle timestamp conversion
    if (data.timestamp) {
      data.timestamp = new Date(data.timestamp);
    }

    // Handle errors
    if (data.error) {
      reject?.(new Error(data.error));
      return;
    }

    if (data.type === "log" && data.level === "error") {
      reject?.(new Error(data.message));
      return;
    }

    // Handle result
    if (data.type === "result") {
      delete data.progress;
      delete data.type;
      setResult?.(data as SpeedtestResult);
      return;
    }

    // Update progress and call callback
    const updatedData = progressTracker.updateProgress(data);
    progressCallback?.(updatedData);
  }

  /**
   * Process error lines and return cleaned error message
   */
  private processErrorLines(errorLines: string[]): string {
    const licenseAcceptedMessage = /License acceptance recorded. Continuing./;
    const acceptLicenseMessage =
      /To accept the message please run speedtest interactively or use the following:[\s\S]*speedtest --accept-license/;
    const acceptGdprMessage =
      /To accept the message please run speedtest interactively or use the following:[\s\S]*speedtest --accept-gdpr/;

    let error = errorLines.join("\n");

    if (licenseAcceptedMessage.test(error)) {
      return "";
    } else if (acceptLicenseMessage.test(error)) {
      error = error.replace(
        acceptLicenseMessage,
        "To accept the message, pass the acceptLicense: true option"
      );
    } else if (acceptGdprMessage.test(error)) {
      error = error.replace(
        acceptGdprMessage,
        "To accept the message, pass the acceptGdpr: true option"
      );
    } else {
      error = error.replace(/===*[\s\S]*about\/privacy\n?/, "");
    }

    return error.trim();
  }
}
