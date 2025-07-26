import type { Platform, ProgressPhases } from "../types/interfaces.js";

/**
 * Default binary version for speedtest CLI
 */
export const DEFAULT_BINARY_VERSION = "1.0.0";

/**
 * Supported platforms and their binary configurations
 */
export const PLATFORMS: Platform[] = [
  {
    platform: "darwin",
    arch: "x64",
    pkg: "macosx.tgz",
    bin: "macosx",
    sha: "8d0af8a81e668fbf04b7676f173016976131877e9fbdcd0a396d4e6b70a5e8f4",
  },
  {
    platform: "win32",
    arch: "x64",
    pkg: "win64.zip",
    bin: "win-x64.exe",
    sha: "64054a021dd7d49e618799a35ddbc618dcfc7b3990e28e513a420741717ac1ad",
  },
  {
    platform: "linux",
    arch: "ia32",
    pkg: "i386-linux.tgz",
    bin: "linux-ia32",
    sha: "828362e559e53d80b3579df032fe756a0993cf33934416fa72e9d69c8025321b",
  },
  {
    platform: "linux",
    arch: "x64",
    pkg: "x86_64-linux.tgz",
    bin: "linux-x64",
    sha: "5fe2028f0d4427e4f4231d9f9cf70e6691bb890a70636d75232fe4d970633168",
  },
  {
    platform: "linux",
    arch: "arm",
    pkg: "arm-linux.tgz",
    bin: "linux-arm",
    sha: "0fa7b3237d0fe4fa15bc1e7cb27ccac63b02a2679b71c2879d59dd75d3c9235d",
  },
  {
    platform: "linux",
    arch: "armhf",
    pkg: "armhf-linux.tgz",
    bin: "linux-armhf",
    sha: "04b54991cfb9492ea8b2a3500340e7eeb78065a00ad25a032be7763f1415decb",
  },
  {
    platform: "linux",
    arch: "arm64",
    pkg: "aarch64-linux.tgz",
    bin: "linux-arm64",
    sha: "073684dc3490508ca01b04c5855e04cfd797fed33f6ea6a6edc26dfbc6f6aa9e",
  },
  {
    platform: "freebsd",
    arch: "x64",
    pkg: "freebsd.pkg",
    bin: "freebsd-x64",
    sha: "f95647ed1ff251b5a39eda80ea447c9b2367f7cfb4155454c23a2f02b94dd844",
  },
];

/**
 * Progress phases with relative timing
 */
export const PROGRESS_PHASES: ProgressPhases = {
  ping: 2,
  download: 15,
  upload: 6,
};

/**
 * Calculate normalized progress phases
 */
export const getNormalizedProgressPhases = (): ProgressPhases => {
  const total = Object.values(PROGRESS_PHASES).reduce(
    (sum, value) => sum + value,
    0
  );

  return {
    ping: PROGRESS_PHASES.ping / total,
    download: PROGRESS_PHASES.download / total,
    upload: PROGRESS_PHASES.upload / total,
  };
};

/**
 * Binary download URL template
 */
export const BINARY_LOCATION =
  "https://install.speedtest.net/app/cli/ookla-speedtest-$v-$p";

/**
 * Find platform configuration for current or specified platform
 */
export const findPlatform = (
  platform: string = process.platform,
  arch: string = process.arch
): Platform | undefined => {
  return PLATFORMS.find((p) => p.platform === platform && p.arch === arch);
};

/**
 * Get binary download URL for a specific platform and version
 */
export const getBinaryUrl = (platform: Platform, version: string): string => {
  return BINARY_LOCATION.replace("$v", version).replace("$p", platform.pkg);
};
