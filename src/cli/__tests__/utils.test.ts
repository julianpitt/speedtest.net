/**
 * Tests for CLI utility functions
 */

import { describe, it, expect, vi } from "vitest";
import { c, speedText, centerText, makeSpinner, getVersion } from "../utils.js";

describe("CLI Utils", () => {
  describe("c (color function)", () => {
    it("should return a string with color codes", () => {
      const result = c("red", "hello");
      expect(typeof result).toBe("string");
      expect(result).toContain("hello");
    });

    it("should handle unknown colors", () => {
      const result = c("unknown" as any, "text");
      expect(typeof result).toBe("string");
      expect(result).toContain("text");
    });
  });

  describe("speedText", () => {
    it("should format speeds with appropriate units", () => {
      expect(speedText(1000000)).toContain("bps");
      expect(speedText(85000000)).toContain("bps");
      expect(speedText(0)).toContain("bps");
    });

    it("should return string format", () => {
      expect(typeof speedText(1000000)).toBe("string");
      expect(speedText(1000000).length).toBeGreaterThan(0);
    });
  });

  describe("centerText", () => {
    it("should return text of specified length", () => {
      const result = centerText("hello", 10);
      expect(result.length).toBe(10);
      expect(result).toContain("hello");
    });

    it("should handle exact width", () => {
      const result = centerText("exact", 5);
      expect(result).toBe("exact");
    });

    it("should handle empty text", () => {
      const result = centerText("", 10);
      expect(result.length).toBe(10);
    });
  });

  describe("makeSpinner", () => {
    it("should return a spinner string", () => {
      const spinner = makeSpinner();
      expect(typeof spinner).toBe("string");
      expect(spinner.length).toBeGreaterThan(0);
    });
  });

  describe("getVersion", () => {
    it("should return a version string", async () => {
      const version = await getVersion();
      expect(typeof version).toBe("string");
      expect(version.length).toBeGreaterThan(0);
    });
  });
});
