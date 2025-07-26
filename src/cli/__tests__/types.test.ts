/**
 * Tests for CLI type definitions
 */

import { describe, it, expect } from "vitest";
import type { CLIOptions, SpeedTestProgress } from "../types.js";

describe("CLI Types", () => {
  describe("CLIOptions", () => {
    it("should allow all valid CLI options", () => {
      const validOptions: CLIOptions = {
        acceptLicense: true,
        acceptGdpr: true,
        serverId: "12345",
        sourceIp: "192.168.1.1",
        host: "speedtest.example.com",
        verbosity: 2,
        progress: true,
        nonInteractive: true,
        json: true,
      };

      expect(validOptions).toBeDefined();
      expect(validOptions.acceptLicense).toBe(true);
      expect(validOptions.acceptGdpr).toBe(true);
      expect(validOptions.serverId).toBe("12345");
      expect(validOptions.sourceIp).toBe("192.168.1.1");
      expect(validOptions.host).toBe("speedtest.example.com");
      expect(validOptions.verbosity).toBe(2);
      expect(validOptions.progress).toBe(true);
      expect(validOptions.nonInteractive).toBe(true);
      expect(validOptions.json).toBe(true);
    });

    it("should allow partial options", () => {
      const partialOptions: CLIOptions = {
        acceptLicense: true,
      };

      expect(partialOptions).toBeDefined();
      expect(partialOptions.acceptLicense).toBe(true);
      expect(partialOptions.acceptGdpr).toBeUndefined();
    });

    it("should allow empty options", () => {
      const emptyOptions: CLIOptions = {};

      expect(emptyOptions).toBeDefined();
      expect(Object.keys(emptyOptions)).toHaveLength(0);
    });
  });

  describe("SpeedTestProgress", () => {
    it("should allow progress events with type", () => {
      const pingProgress: SpeedTestProgress = {
        type: "ping",
        ping: { latency: 35.2 },
      };

      expect(pingProgress).toBeDefined();
      expect(pingProgress.type).toBe("ping");
      expect(pingProgress.ping?.latency).toBe(35.2);
    });

    it("should allow progress events with server info", () => {
      const serverProgress: SpeedTestProgress = {
        type: "download",
        server: { name: "Test Server", location: "Test City" },
        download: { bandwidth: 85000000 },
      };

      expect(serverProgress).toBeDefined();
      expect(serverProgress.server?.name).toBe("Test Server");
      expect(serverProgress.download?.bandwidth).toBe(85000000);
    });

    it("should allow progress events with ISP info", () => {
      const ispProgress: SpeedTestProgress = {
        type: "upload",
        isp: "Test ISP",
        upload: { bandwidth: 23000000 },
      };

      expect(ispProgress).toBeDefined();
      expect(ispProgress.isp).toBe("Test ISP");
      expect(ispProgress.upload?.bandwidth).toBe(23000000);
    });

    it("should allow arbitrary additional properties", () => {
      const customProgress: SpeedTestProgress = {
        type: "custom",
        customProperty: "custom value",
        nestedObject: { nested: true },
        arrayProperty: [1, 2, 3],
      };

      expect(customProgress).toBeDefined();
      expect(customProgress.customProperty).toBe("custom value");
      expect(customProgress.nestedObject).toEqual({ nested: true });
      expect(customProgress.arrayProperty).toEqual([1, 2, 3]);
    });

    it("should allow minimal progress events", () => {
      const minimalProgress: SpeedTestProgress = {};

      expect(minimalProgress).toBeDefined();
      expect(Object.keys(minimalProgress)).toHaveLength(0);
    });
  });

  describe("Type compatibility", () => {
    it("should work with real-world CLI option scenarios", () => {
      // Interactive mode with license acceptance
      const interactiveOptions: CLIOptions = {
        acceptLicense: true,
        verbosity: 1,
      };

      // Non-interactive CI/CD mode
      const ciOptions: CLIOptions = {
        acceptLicense: true,
        acceptGdpr: true,
        nonInteractive: true,
        serverId: "12345",
      };

      // JSON API mode
      const apiOptions: CLIOptions = {
        acceptLicense: true,
        json: true,
        sourceIp: "10.0.0.1",
      };

      expect(interactiveOptions).toBeDefined();
      expect(ciOptions).toBeDefined();
      expect(apiOptions).toBeDefined();
    });

    it("should work with real-world progress event scenarios", () => {
      // Initial ping measurement
      const pingEvent: SpeedTestProgress = {
        type: "ping",
        ping: { latency: 25.5 },
        server: { name: "Sydney Server", location: "Sydney" },
        isp: "Local ISP",
      };

      // Download progress
      const downloadEvent: SpeedTestProgress = {
        type: "download",
        download: { bandwidth: 95000000 },
      };

      // Upload completion
      const uploadEvent: SpeedTestProgress = {
        type: "upload",
        upload: { bandwidth: 45000000 },
      };

      expect(pingEvent).toBeDefined();
      expect(downloadEvent).toBeDefined();
      expect(uploadEvent).toBeDefined();
    });
  });
});
