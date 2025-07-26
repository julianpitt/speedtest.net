import type { ProgressData, ProgressPhases } from "../types/interfaces.js";
import { getNormalizedProgressPhases } from "../core/platforms.js";

/**
 * Progress tracker for managing speedtest progress across phases
 */
export class ProgressTracker {
  private priorProgress = 0;
  private lastProgress = 0;
  private currentPhase: string | undefined;
  private readonly progressPhases: ProgressPhases;

  constructor() {
    this.progressPhases = getNormalizedProgressPhases();
  }

  /**
   * Reset the progress tracker
   */
  reset(): void {
    this.priorProgress = 0;
    this.lastProgress = 0;
    this.currentPhase = undefined;
  }

  /**
   * Update progress for a given phase
   * @param data - Progress data from speedtest CLI
   * @returns Updated progress data with calculated progress percentage
   */
  updateProgress(data: ProgressData): ProgressData {
    const updatedData = { ...data };

    // Handle phase changes
    if (
      data.type &&
      this.currentPhase !== data.type &&
      this.progressPhases[data.type as keyof ProgressPhases]
    ) {
      this.priorProgress +=
        this.progressPhases[this.currentPhase as keyof ProgressPhases] || 0;
      this.currentPhase = data.type;
    }

    // Calculate progress for current phase
    if (data.type && data[data.type as keyof ProgressData]) {
      const phaseData = data[data.type as keyof ProgressData] as any;
      if (
        typeof phaseData?.progress === "number" &&
        this.progressPhases[data.type as keyof ProgressPhases]
      ) {
        updatedData.progress =
          this.priorProgress +
          this.progressPhases[data.type as keyof ProgressPhases] *
            phaseData.progress;
      }
    }

    // Handle config type (initial state)
    if (
      (!data.type && (data as any).suite) ||
      (data as any).app ||
      (data as any).servers
    ) {
      updatedData.type = "config";
    }

    // Set progress to prior progress if not calculated
    updatedData.progress ??= this.priorProgress;

    // Ensure progress never goes backwards
    this.lastProgress = updatedData.progress = Math.max(
      updatedData.progress,
      this.lastProgress
    );

    return updatedData;
  }

  /**
   * Get current progress percentage (0-1)
   */
  getCurrentProgress(): number {
    return this.lastProgress;
  }

  /**
   * Get current phase name
   */
  getCurrentPhase(): string | undefined {
    return this.currentPhase;
  }
}
