/**
 * Speedtest.net client library
 * Modernized TypeScript version with dual ESM/CJS exports
 */

// Import everything we need first
import { SpeedtestExecutor } from "./core/process-executor.js";
import { DEFAULT_BINARY_VERSION } from "./core/platforms.js";
import { makeCancel } from "./core/cancellation.js";
import type { SpeedtestOptions } from "./types/interfaces.js";

// Types and interfaces
export type {
  Platform,
  ProgressPhases,
  ProgressData,
  Server,
  Interface,
  SpeedtestResult,
  SpeedtestOptions,
  BinaryOptions,
  CancelFunction,
  CancelHandler,
} from "./types/interfaces.js";

export {
  SpeedtestOptionsSchema,
  BinaryOptionsSchema,
  isSpeedtestResult,
  isProgressData,
} from "./types/interfaces.js";

// Platform and configuration
export {
  PLATFORMS,
  DEFAULT_BINARY_VERSION,
  PROGRESS_PHASES,
  findPlatform,
  getBinaryUrl,
  getNormalizedProgressPhases,
} from "./core/platforms.js";

// Utilities
export { ProgressTracker } from "./utils/progress.js";
export {
  makeCancel,
  setupCancellation,
  isCanceled,
} from "./core/cancellation.js";
export {
  fileExists,
  chMod,
  appendFileName,
  ensureDir,
} from "./utils/file-utils.js";

// Core functionality
export { SpeedtestExecutor } from "./core/process-executor.js";
export { BinaryManager } from "./core/binary-manager.js";

// Main execution function for backward compatibility
const defaultExecutor = new SpeedtestExecutor();

/**
 * Execute a speedtest with the given options
 * This is the main function that maintains backward compatibility with the original API
 *
 * @param options - Speedtest configuration options
 * @returns Promise that resolves to speedtest result
 *
 * @example
 * ```typescript
 * import speedtest from '@julianpitt/speedtest-net';
 *
 * const result = await speedtest({
 *   acceptLicense: true,
 *   progress: (data) => console.log('Progress:', data.progress)
 * });
 *
 * console.log('Download:', result.download.bandwidth);
 * console.log('Upload:', result.upload.bandwidth);
 * ```
 */
export const exec = (options?: SpeedtestOptions) =>
  defaultExecutor.execute(options);

// Export default for backward compatibility
export default exec;

// Additional properties for backward compatibility
exec.defaultBinaryVersion = DEFAULT_BINARY_VERSION;
exec.makeCancel = makeCancel;
