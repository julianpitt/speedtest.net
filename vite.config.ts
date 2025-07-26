/// <reference types="vitest" />
import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      outDir: "dist/types",
      exclude: ["**/*.test.ts", "**/*.spec.ts"],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        cli: resolve(__dirname, "src/cli.ts"),
      },
      name: "SpeedtestNet",
    },
    rollupOptions: {
      external: [
        "child_process",
        "commander",
        "crypto",
        "fs",
        "fs/promises",
        "path",
        "url",
        "util",
        "stream",
        "decompress",
        "decompress-tar",
        "decompress-tarbz2",
        "decompress-targz",
        "decompress-tarxz",
        "decompress-unzip",
        "download",
        "mkdirp",
        "tree-kill",
        "zod",
        "chalk",
        "cli-progress",
        "ora",
        "boxen",
      ],
      output: [
        {
          format: "cjs",
          dir: "dist/cjs",
          entryFileNames: "[name].js",
          exports: "named",
        },
        {
          format: "es",
          dir: "dist/esm",
          entryFileNames: "[name].js",
          exports: "named",
        },
      ],
    },
    target: "node16",
  },
  test: {
    globals: true,
    environment: "node",
  },
});
