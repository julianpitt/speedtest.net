/**
 * CLI utility functions
 */

import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Simple ANSI color utilities
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

export const c = (color: keyof typeof colors, text: string): string => {
  return `${colors[color]}${text}${colors.reset}`;
};

/**
 * Find package.json and get version using Node.js built-in APIs
 */
export async function getVersion(): Promise<string> {
  const currentFile = fileURLToPath(import.meta.url);
  let currentDir = dirname(currentFile);

  for (let i = 0; i < 10; i++) {
    try {
      const packageJsonPath = join(currentDir, "package.json");
      const packageContent = await fs.readFile(packageJsonPath, "utf8");
      const packageJson = JSON.parse(packageContent);
      return packageJson.version || "2.0.0";
    } catch {
      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) break;
      currentDir = parentDir;
    }
  }
  return "2.0.0";
}

export function speedText(speed: number): string {
  let bits = speed * 8;
  const units = ["", "K", "M", "G", "T"];
  const places = [0, 1, 2, 3, 3];
  let unit = 0;
  while (bits >= 2000 && unit < 4) {
    unit++;
    bits /= 1000;
  }
  return `${bits.toFixed(places[unit])} ${units[unit]}bps`;
}

export function centerText(text: string, n: number, length?: number): string {
  // Account for text length first
  n -= length || text.length;

  // Pad to be even
  if (n % 2 === 1) {
    text = " " + text;
  }

  // Round n to lowest number
  n = Math.floor(n / 2);

  // Make spacer
  const spacer = " ".repeat(n);

  // Fill in text
  return spacer + text + spacer;
}

const frames = ["+---", "-+--", "--+-", "---+", "--+-", "-+--"];
let lastChange = 0;
export function makeSpinner(): string {
  if (Date.now() > lastChange + 30) {
    frames.unshift(frames.pop()!);
    lastChange = Date.now();
  }
  return frames[0];
}
