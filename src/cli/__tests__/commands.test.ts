/**
 * Tests for CLI entry point and command functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { CLIOptions } from "../types.js";

// Mock the runSpeedtest function to prevent actual execution
const mockRunSpeedtest = vi.fn();
vi.mock("../commands.js", () => ({
  runSpeedtest: mockRunSpeedtest,
}));

// Mock getVersion to return a consistent version
vi.mock("../utils.js", () => ({
  getVersion: vi.fn().mockResolvedValue("2.0.0"),
  makeSpinner: vi.fn().mockReturnValue("|"),
  speedText: vi.fn().mockReturnValue("100.00 Mbps"),
  centerText: vi.fn().mockImplementation((text: string) => text),
  c: vi.fn().mockImplementation((_color: string, text: string) => text),
}));

describe("CLI Entry Point", () => {
  let originalArgv: string[];
  let originalExit: typeof process.exit;

  beforeEach(() => {
    // Store original argv and exit, reset mocks
    originalArgv = process.argv;
    originalExit = process.exit;
    mockRunSpeedtest.mockClear();
    vi.clearAllMocks();

    // Mock process.exit to prevent actual exits during tests
    process.exit = vi.fn() as any;
  });

  afterEach(() => {
    // Restore original argv and exit
    process.argv = originalArgv;
    process.exit = originalExit;
  });

  describe("main function", () => {
    it("should be importable", async () => {
      const { main } = await import("../entry.js");
      expect(typeof main).toBe("function");
    });

    it("should create Commander program without errors", async () => {
      const { main } = await import("../entry.js");

      // Mock process.argv to run without arguments (should call runSpeedtest with defaults)
      process.argv = ["node", "cli.js"];

      try {
        await main();
      } catch (error) {
        // Ignore any errors from mocked functions
      }

      // Should have called runSpeedtest with default (undefined) options
      expect(mockRunSpeedtest).toHaveBeenCalled();
    });
  });

  describe("CLI Options", () => {
    it("should accept --accept-license option", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "--accept-license"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          acceptLicense: true,
        })
      );
    });

    it("should accept --accept-gdpr option", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "--accept-gdpr"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          acceptGdpr: true,
        })
      );
    });

    it("should accept --server-id option with value", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "--server-id", "12345"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          serverId: "12345",
        })
      );
    });

    it("should accept -s shorthand for server-id", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "-s", "67890"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          serverId: "67890",
        })
      );
    });

    it("should accept --source-ip option with value", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "--source-ip", "192.168.1.100"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceIp: "192.168.1.100",
        })
      );
    });

    it("should accept -i shorthand for source-ip", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "-i", "10.0.0.50"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceIp: "10.0.0.50",
        })
      );
    });

    it("should accept --host option with value", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "--host", "speedtest.example.com"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          host: "speedtest.example.com",
        })
      );
    });

    it("should accept -o shorthand for host", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "-o", "test.speedtest.net"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          host: "test.speedtest.net",
        })
      );
    });

    it("should accept --verbose option and increment verbosity", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "--verbose"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          verbosity: 1,
        })
      );
    });

    it("should accept -v shorthand for verbose", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "-v"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          verbosity: 1,
        })
      );
    });

    it("should accept multiple -v flags to increase verbosity", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "-vvv"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          verbosity: 3,
        })
      );
    });

    it("should accept --progress option", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "--progress"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          progress: true,
        })
      );
    });

    it("should accept -p shorthand for progress", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "-p"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          progress: true,
        })
      );
    });

    it("should accept --non-interactive option", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "--non-interactive"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          nonInteractive: true,
        })
      );
    });

    it("should accept --json option", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "--json"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          json: true,
        })
      );
    });
  });

  describe("Combined Options", () => {
    it("should accept multiple options together", async () => {
      const { main } = await import("../entry.js");

      process.argv = [
        "node",
        "cli.js",
        "--accept-license",
        "--accept-gdpr",
        "--server-id",
        "12345",
        "--verbose",
        "--progress",
        "--json",
      ];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith({
        acceptLicense: true,
        acceptGdpr: true,
        serverId: "12345",
        sourceIp: undefined,
        host: undefined,
        verbosity: 1,
        progress: true,
        nonInteractive: undefined,
        json: true,
      });
    });

    it("should accept all options with short flags", async () => {
      const { main } = await import("../entry.js");

      process.argv = [
        "node",
        "cli.js",
        "-s",
        "54321",
        "-i",
        "172.16.0.1",
        "-o",
        "custom.speedtest.net",
        "-vv",
        "-p",
      ];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith({
        acceptLicense: undefined,
        acceptGdpr: undefined,
        serverId: "54321",
        sourceIp: "172.16.0.1",
        host: "custom.speedtest.net",
        verbosity: 2,
        progress: true,
        nonInteractive: undefined,
        json: undefined,
      });
    });

    it("should handle conflicting --json and --non-interactive options", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "--json", "--non-interactive"];

      try {
        await main();
      } catch (error) {
        // Ignore process.exit() calls
      }

      expect(mockRunSpeedtest).toHaveBeenCalledWith(
        expect.objectContaining({
          json: true,
          nonInteractive: true,
        })
      );
    });
  });

  describe("CLIOptions Type Validation", () => {
    it("should support all CLI option types", () => {
      const options: CLIOptions = {
        acceptLicense: true,
        acceptGdpr: false,
        serverId: "12345",
        sourceIp: "192.168.1.1",
        host: "speedtest.example.com",
        verbosity: 2,
        progress: true,
        nonInteractive: false,
        json: true,
      };

      expect(options).toBeDefined();
      expect(typeof options.acceptLicense).toBe("boolean");
      expect(typeof options.serverId).toBe("string");
      expect(typeof options.verbosity).toBe("number");
    });

    it("should support optional fields", () => {
      const minimalOptions: CLIOptions = {};
      const partialOptions: CLIOptions = {
        acceptLicense: true,
        verbosity: 1,
      };

      expect(minimalOptions).toBeDefined();
      expect(partialOptions).toBeDefined();
      expect(partialOptions.acceptLicense).toBe(true);
      expect(partialOptions.verbosity).toBe(1);
    });
  });

  describe("Error Handling", () => {
    it("should handle runSpeedtest errors gracefully", async () => {
      const { main } = await import("../entry.js");

      // Mock runSpeedtest to throw an error
      mockRunSpeedtest.mockRejectedValueOnce(new Error("Test error"));

      process.argv = ["node", "cli.js", "--accept-license"];

      // Should propagate the error from runSpeedtest
      await expect(main()).rejects.toThrow("Test error");
    });
  });

  describe("Version and Help", () => {
    it("should handle version flag", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "--version"];

      try {
        await main();
      } catch (error) {
        // Version command calls process.exit(0)
      }

      // Should call process.exit when showing version
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it("should handle -V version shorthand", async () => {
      const { main } = await import("../entry.js");

      process.argv = ["node", "cli.js", "-V"];

      try {
        await main();
      } catch (error) {
        // Version command calls process.exit(0)
      }

      // Should call process.exit when showing version
      expect(process.exit).toHaveBeenCalledWith(0);
    });
  });
});
