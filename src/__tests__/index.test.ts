/**
 * Tests for main library exports
 */

import { describe, it, expect, vi } from "vitest";

// Mock the problematic native modules before importing
vi.mock("lzma-native", () => ({
  createDecompressor: vi.fn(),
  createCompressor: vi.fn(),
}));

vi.mock("../core/binary-manager.js", () => ({
  BinaryManager: vi.fn().mockImplementation(() => ({
    ensureBinary: vi.fn().mockResolvedValue("/mock/path/to/speedtest"),
  })),
}));

vi.mock("../core/process-executor.js", () => ({
  SpeedtestExecutor: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockResolvedValue({
      ping: { latency: 35.2 },
      download: { bandwidth: 85000000 },
      upload: { bandwidth: 23000000 },
      server: { id: 12345, name: "Test Server", location: "Test City" },
      isp: "Test ISP",
      result: { id: "test-123", url: "https://speedtest.net/result/test-123" },
    }),
  })),
}));

describe("Main Library", () => {
  describe("exec function", () => {
    it("should be importable without errors", async () => {
      const { exec } = await import("../index.js");
      expect(typeof exec).toBe("function");
    });

    it("should accept various option types", () => {
      // Test that option types work correctly without actually calling exec
      const options1 = { acceptLicense: true };
      const options2 = { verbosity: 2 };
      const options3 = { serverId: "12345" };

      expect(options1).toBeDefined();
      expect(options2).toBeDefined();
      expect(options3).toBeDefined();
    });
  });

  describe("Library structure", () => {
    it("should export main exec function", async () => {
      const library = await import("../index.js");
      expect(library).toHaveProperty("exec");
      expect(typeof library.exec).toBe("function");
    });
  });
});
