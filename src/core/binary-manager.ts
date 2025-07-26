import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import download from "download";
import decompress from "decompress";
import decompressTar from "decompress-tar";
import decompressTarbz2 from "decompress-tarbz2";
import decompressTargz from "decompress-targz";
import decompressUnzip from "decompress-unzip";
import decompressTarXz from "decompress-tarxz";
import { createHash } from "crypto";

import type { BinaryOptions, Platform } from "../types/interfaces.js";
import {
  findPlatform,
  getBinaryUrl,
  DEFAULT_BINARY_VERSION,
} from "./platforms.js";
import {
  fileExists,
  chMod,
  appendFileName,
  ensureDir,
} from "../utils/file-utils.js";

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Calculate SHA256 hash of a file using Node.js built-in crypto
 * @param filePath - Path to file
 * @returns Promise that resolves to hex hash string
 */
async function calculateSHA256(filePath: string): Promise<string> {
  const data = await fs.readFile(filePath);
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Find project root by looking for package.json using Node.js built-in APIs
 * @param startDir - Directory to start searching from
 * @returns Project root directory path
 */
async function findProjectRoot(startDir: string = __dirname): Promise<string> {
  let currentDir = startDir;

  while (currentDir !== dirname(currentDir)) {
    // Stop at filesystem root
    try {
      await fs.access(join(currentDir, "package.json"));
      return currentDir;
    } catch {
      currentDir = dirname(currentDir);
    }
  }

  // Fallback: assume we're in dist/ and go up one level
  return join(startDir, "..");
}

/**
 * Binary manager for handling speedtest CLI binary downloads and management
 */
export class BinaryManager {
  private readonly rootDir: string;

  constructor(rootDir?: string) {
    this.rootDir = rootDir || __dirname; // Will be resolved async when needed
  }

  /**
   * Get the resolved project root directory
   */
  private async getProjectRoot(): Promise<string> {
    if (this.rootDir === __dirname) {
      return await findProjectRoot(__dirname);
    }
    return this.rootDir;
  }

  /**
   * Ensure the speedtest binary is available and return its path
   * @param options - Binary configuration options
   * @returns Promise that resolves to the binary path
   */
  async ensureBinary(options: BinaryOptions = {}): Promise<string> {
    const {
      platform = process.platform,
      arch = process.arch,
      binaryVersion = DEFAULT_BINARY_VERSION,
    } = options;

    const platformConfig = findPlatform(platform, arch);
    if (!platformConfig) {
      throw new Error(`Platform ${platform} on ${arch} is not supported`);
    }

    const projectRoot = await this.getProjectRoot();
    const binDir = join(projectRoot, "binaries");
    await ensureDir(binDir);

    const binFileName = appendFileName(platformConfig.bin, `-${binaryVersion}`);
    const binPath = join(binDir, binFileName);

    // Check if binary already exists
    if (await fileExists(binPath)) {
      return binPath;
    }

    // Download and extract binary
    await this.downloadBinary(
      platformConfig,
      binaryVersion,
      binPath,
      projectRoot
    );
    return binPath;
  }

  /**
   * Download and extract binary for a specific platform
   * @param platform - Platform configuration
   * @param version - Binary version
   * @param binPath - Target binary path
   * @param projectRoot - Project root directory
   */
  private async downloadBinary(
    platform: Platform,
    version: string,
    binPath: string,
    projectRoot: string
  ): Promise<void> {
    const pkgDir = join(projectRoot, "pkg");
    await ensureDir(pkgDir);

    const pkgFileName = appendFileName(platform.pkg, `-${version}`);
    const pkgPath = join(pkgDir, pkgFileName);

    // Download package if it doesn't exist
    if (!(await fileExists(pkgPath))) {
      const url = getBinaryUrl(platform, version);
      try {
        const data = await download(url);
        await fs.writeFile(pkgPath, data);
      } catch (error: any) {
        throw new Error(
          `Error downloading speedtest CLI executable from ${url}: ${error.message}`
        );
      }
    }

    // Verify checksum for default version using built-in crypto
    if (version === DEFAULT_BINARY_VERSION) {
      const fileSha = await calculateSHA256(pkgPath);
      if (fileSha !== platform.sha) {
        throw new Error(
          `SHA mismatch ${pkgFileName}, found "${fileSha}", expected "${platform.sha}"`
        );
      }
    }

    // Extract binary
    const binFileName = appendFileName(platform.bin, `-${version}`);
    await this.extractBinary(pkgPath, binPath, binFileName);

    // Set executable permissions using Node.js built-in
    await chMod(binPath, 0o755);
  }

  /**
   * Extract binary from compressed package
   * @param pkgPath - Path to compressed package
   * @param binPath - Target binary path
   * @param binFileName - Binary file name
   */
  private async extractBinary(
    pkgPath: string,
    binPath: string,
    binFileName: string
  ): Promise<void> {
    const binDir = dirname(binPath);

    try {
      await decompress(pkgPath, binDir, {
        plugins: [
          decompressTar(),
          decompressTarbz2(),
          decompressTargz(),
          decompressUnzip(),
          decompressTarXz(),
        ],
        filter: (file) => {
          return /(^|\/)speedtest(.exe)?$/.test(file.path);
        },
        map: (file) => {
          file.path = binFileName;
          return file;
        },
      });
    } catch (error: any) {
      throw new Error(
        `Error decompressing package "${pkgPath}": ${error.message}`
      );
    }

    if (!(await fileExists(binPath))) {
      throw new Error(
        `Error decompressing package "${pkgPath}": Binary not found after extraction`
      );
    }
  }

  /**
   * Get the default binary path for current platform
   * @param binaryVersion - Version to use
   * @returns Promise that resolves to binary path
   */
  async getDefaultBinaryPath(
    binaryVersion: string = DEFAULT_BINARY_VERSION
  ): Promise<string> {
    return this.ensureBinary({ binaryVersion });
  }
}
