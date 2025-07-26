import { promises as fs } from "fs";
import { parse, format } from "path";

/**
 * Check if a file exists
 * @param file - File path to check
 * @returns Promise that resolves to true if file exists, false otherwise
 */
export const fileExists = async (file: string): Promise<boolean> => {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
};

/**
 * Change file permissions (direct wrapper around fs.chmod)
 * @param file - File path
 * @param mode - Permission mode (e.g., 0o755)
 * @returns Promise that resolves when permissions are changed
 */
export const chMod = (file: string, mode: number): Promise<void> => {
  return fs.chmod(file, mode);
};

/**
 * Append a trailer to a filename before the extension using Node.js path utilities
 * @param fileName - Original filename
 * @param trailer - String to append
 * @returns Modified filename with trailer
 *
 * @example
 * appendFileName('speedtest.exe', '-1.0.0') // Returns 'speedtest-1.0.0.exe'
 * appendFileName('binary', '-v2') // Returns 'binary-v2'
 */
export const appendFileName = (fileName: string, trailer: string): string => {
  const parsed = parse(fileName);
  return format({
    ...parsed,
    name: parsed.name + trailer,
    base: undefined, // Let format() rebuild the base from name + ext
  });
};

/**
 * Ensure a directory exists using Node.js built-in recursive mkdir
 * @param dirPath - Directory path to ensure exists
 * @returns Promise that resolves when directory exists
 */
export const ensureDir = (dirPath: string): Promise<void> => {
  return fs.mkdir(dirPath, { recursive: true }).then(() => {});
};
