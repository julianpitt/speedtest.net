/**
 * Live display management for the CLI dashboard
 */

import { centerText, c } from "./utils.js";

export function renderHeader(
  statuses: Record<string, boolean | string>
): string {
  const width = 24;
  let txt = "";

  for (const k of Object.keys(statuses)) {
    const status = statuses[k];

    let col = centerText(k, width);
    if (status === false) {
      col = c("dim", col);
    } else {
      col = c("bright", c("white", col));
    }
    txt += col;
  }

  return txt;
}

export function renderStatus(
  statuses: Record<string, boolean | string>,
  step: string,
  spinner: string
): string {
  const width = 24;
  let txt = "";

  for (const k of Object.keys(statuses)) {
    let status = statuses[k];
    status = String(status === Boolean(status) ? "" : status);

    if (!status) {
      status = spinner + " ";
    }

    status = centerText(status, width);
    status = status.replace(/([KMGT]bps|ms)/gi, (match) => c("dim", match));
    if (step === k) {
      status = c("yellow", status);
    } else {
      status = c("blue", status);
    }

    txt += status;
  }
  return txt;
}

/**
 * Functional approach for updating the live display
 * @param headerText - The header text to display
 * @param speedsText - The speeds text to display
 * @param serverText - Optional server text
 * @param ispText - Optional ISP text
 * @param resultText - Optional result text
 */
export function updateLiveDisplay(
  headerText: string,
  speedsText: string,
  serverText?: string,
  ispText?: string,
  resultText?: string
): void {
  // Clear screen and redraw everything to avoid cursor issues
  console.clear();

  const width = 24;

  // Top border
  console.log("┌" + "─".repeat(width * 3) + "┐");

  // Server line
  if (serverText) {
    console.log("│" + serverText + "│");
  } else {
    console.log("│" + centerText("Detecting server...", 72) + "│");
  }

  // ISP line
  if (ispText) {
    console.log("│" + ispText + "│");
  } else {
    console.log("│" + centerText("Detecting ISP...", 72) + "│");
  }

  // Separator line
  console.log("│" + " ".repeat(72) + "│");

  // Header line
  console.log("│" + headerText + "│");

  // Speeds line
  console.log("│" + speedsText + "│");

  // Result line
  if (resultText) {
    console.log("│" + resultText + "│");
  } else {
    console.log("│" + " ".repeat(72) + "│");
  }

  // Bottom border
  console.log("└" + "─".repeat(width * 3) + "┘");
}
