import type { CancelFunction, CancelHandler } from "../types/interfaces.js";

/**
 * Symbol used for setting cancel handlers
 */
export const SET_CANCEL_HANDLER = Symbol("setCancelHandler");

/**
 * Creates a cancellation function that can be used to cancel speedtest operations
 * @returns Cancel function that can be passed to speedtest options
 */
export const makeCancel = (): CancelFunction => {
  let doCancel: CancelHandler | null = null;
  let isCanceled = false;

  return (setHandler?: symbol, newHandler?: CancelHandler): boolean | void => {
    // If called with the special symbol, set the cancel handler
    if (setHandler === SET_CANCEL_HANDLER) {
      doCancel = newHandler || null;
      return isCanceled;
    }

    // If already canceled, do nothing
    if (isCanceled) return;

    // Mark as canceled and call the handler if available
    isCanceled = true;
    if (doCancel) {
      doCancel();
    }
  };
};

/**
 * Check if a cancel function has been triggered
 * @param cancel - Cancel function to check
 * @returns True if canceled, false otherwise
 */
export const isCanceled = (cancel: CancelFunction): boolean => {
  return Boolean(cancel(SET_CANCEL_HANDLER));
};

/**
 * Set up cancellation for a promise
 * @param cancel - Cancel function
 * @param handler - Handler to call when canceled
 * @returns True if already canceled, false otherwise
 */
export const setupCancellation = (
  cancel: CancelFunction,
  handler: CancelHandler
): boolean => {
  return Boolean(cancel(SET_CANCEL_HANDLER, handler));
};
