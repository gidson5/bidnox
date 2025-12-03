"use client";

import { useEffect } from "react";

/**
 * Error handler component that filters out Chrome extension errors
 * to prevent them from breaking the app
 */
export const ErrorHandler = () => {
  useEffect(() => {
    // Store original error handlers
    const originalError = console.error;
    const originalWarn = console.warn;

    // Check if error originates from Chrome extension
    const isChromeExtensionError = (error: any): boolean => {
      if (!error) return false;

      const errorString = String(error);
      const stack = error?.stack || "";

      // Check for Chrome extension URLs in error stack
      return (
        stack.includes("chrome-extension://") ||
        errorString.includes("chrome-extension://") ||
        // Check for common extension-related patterns
        stack.includes("moz-extension://") ||
        errorString.includes("moz-extension://") ||
        stack.includes("safari-extension://") ||
        errorString.includes("safari-extension://")
      );
    };

    // Override console.error to filter extension errors
    console.error = (...args: any[]) => {
      // Convert all arguments to string to check for extension patterns
      const argsString = args
        .map((arg) => {
          if (arg instanceof Error) {
            return `${arg.message} ${arg.stack || ""}`;
          }
          return String(arg);
        })
        .join(" ");

      const hasExtensionError =
        argsString.includes("chrome-extension://") ||
        argsString.includes("moz-extension://") ||
        argsString.includes("safari-extension://") ||
        args.some((arg) => {
          if (arg instanceof Error) {
            return isChromeExtensionError(arg);
          }
          return false;
        });

      if (!hasExtensionError) {
        originalError.apply(console, args);
      }
      // Silently ignore extension errors
    };

    // Override console.warn to filter extension warnings
    console.warn = (...args: any[]) => {
      const hasExtensionWarning = args.some((arg) => {
        if (typeof arg === "string") {
          return (
            arg.includes("chrome-extension://") ||
            arg.includes("moz-extension://") ||
            arg.includes("safari-extension://")
          );
        }
        return false;
      });

      if (!hasExtensionWarning) {
        originalWarn.apply(console, args);
      }
    };

    // Global error handler for unhandled errors
    const handleError = (event: ErrorEvent) => {
      const error = event.error || event.message || "";
      const stack = event.error?.stack || event.filename || "";
      const errorString = String(error);

      // Check if error is from Chrome extension (check filename, stack, and message)
      const isExtensionError =
        stack.includes("chrome-extension://") ||
        stack.includes("moz-extension://") ||
        stack.includes("safari-extension://") ||
        errorString.includes("chrome-extension://") ||
        errorString.includes("moz-extension://") ||
        event.filename?.includes("chrome-extension://") ||
        event.filename?.includes("moz-extension://");

      if (isExtensionError) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }

      // Allow other errors to propagate normally
      return true;
    };

    // Global unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const stack = reason?.stack || "";
      const message = String(reason || "");

      // Check if rejection is from Chrome extension
      if (
        stack.includes("chrome-extension://") ||
        stack.includes("moz-extension://") ||
        stack.includes("safari-extension://") ||
        message.includes("chrome-extension://")
      ) {
        event.preventDefault();
        return;
      }
    };

    // Add event listeners
    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Cleanup on unmount
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
};

