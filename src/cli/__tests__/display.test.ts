/**
 * Tests for CLI display functions
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHeader, renderStatus, updateLiveDisplay } from "../display.js";

describe("CLI Display", () => {
  let consoleLogSpy: any;

  beforeEach(() => {
    // Spy on console.log to prevent actual output during tests
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    // Also spy on console.clear to prevent clearing during tests
    vi.spyOn(console, "clear").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods after each test
    vi.restoreAllMocks();
  });

  describe("renderHeader", () => {
    it("should render header with statuses", () => {
      const statuses = {
        Ping: "35.2 ms",
        Download: "85.00 Mbps",
        Upload: "23.00 Mbps",
      };

      const result = renderHeader(statuses);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle empty statuses", () => {
      const statuses = {};
      const result = renderHeader(statuses);
      expect(typeof result).toBe("string");
    });
  });

  describe("renderStatus", () => {
    it("should render status with spinner", () => {
      const statuses = {
        Ping: "",
        Download: false,
        Upload: false,
      };

      const result = renderStatus(statuses, "Ping", "|");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should render status with completed values", () => {
      const statuses = {
        Ping: "35.2 ms",
        Download: "85.00 Mbps",
        Upload: false,
      };

      const result = renderStatus(statuses, "Upload", "-");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("updateLiveDisplay (Function)", () => {
    it("should work as a standalone function and log to console", () => {
      updateLiveDisplay(
        "header text",
        "speeds text",
        "server text",
        "isp text",
        "result text"
      );

      // Verify console.log was called multiple times (one for each line of the display)
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls.length).toBeGreaterThan(5); // Should be at least 6-7 lines
    });

    it("should handle optional parameters and still log", () => {
      updateLiveDisplay("header", "speeds");

      // Verify console.log was called even with minimal parameters
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls.length).toBeGreaterThan(5);
    });

    it("should handle all parameters and log correctly", () => {
      updateLiveDisplay(
        "Test Header",
        "Test Speeds",
        "Test Server",
        "Test ISP",
        "Test Result"
      );

      // Verify console.log was called the expected number of times
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls.length).toBeGreaterThan(5);

      // Verify some of the expected content is being logged
      const loggedContent = consoleLogSpy.mock.calls
        .map((call: any) => call[0])
        .join("");
      expect(loggedContent).toContain("Test Server");
      expect(loggedContent).toContain("Test ISP");
      expect(loggedContent).toContain("Test Result");
    });

    it("should display fallback text when optional params are missing", () => {
      updateLiveDisplay("header", "speeds");

      // Check that fallback text is used
      const loggedContent = consoleLogSpy.mock.calls
        .map((call: any) => call[0])
        .join("");
      expect(loggedContent).toContain("Detecting server...");
      expect(loggedContent).toContain("Detecting ISP...");
    });

    it("should verify console.log is actually called", () => {
      // Reset spy to start fresh
      consoleLogSpy.mockClear();

      updateLiveDisplay("test header", "test speeds");

      // Should call console.log for each line of the display:
      // 1. Top border, 2. Server line, 3. ISP line, 4. Separator, 5. Header, 6. Speeds, 7. Result, 8. Bottom border
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls.length).toBe(8);
    });

    it("should call console.clear exactly once", () => {
      const consoleClearSpy = vi
        .spyOn(console, "clear")
        .mockImplementation(() => {});

      updateLiveDisplay("header", "speeds");

      expect(consoleClearSpy).toHaveBeenCalledTimes(1);

      consoleClearSpy.mockRestore();
    });
  });
});
