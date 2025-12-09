"use client";

import { useEffect } from "react";

/**
 * Suppresses ethereum property redefinition errors from EVM wallet extensions.
 * This is safe to ignore since this is a Starknet app and doesn't use window.ethereum.
 */
export const SuppressEthereumError = () => {
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Wrap Object.defineProperty to catch ethereum redefinition errors
        const originalDefineProperty = Object.defineProperty;
        Object.defineProperty = function (obj, prop, descriptor) {
            if (prop === "ethereum" && obj === window) {
                try {
                    return originalDefineProperty.call(this, obj, prop, descriptor);
                } catch (e: any) {
                    // Silently ignore ethereum redefinition errors from extensions
                    if (
                        e?.message?.includes("Cannot redefine property: ethereum") ||
                        e?.message?.includes("Cannot redefine property")
                    ) {
                        return obj;
                    }
                    throw e;
                }
            }
            return originalDefineProperty.call(this, obj, prop, descriptor);
        };

        // Catch unhandled errors from extensions
        const errorHandler = (event: ErrorEvent) => {
            if (
                event.message?.includes("Cannot redefine property: ethereum") ||
                event.message?.includes("Cannot redefine property")
            ) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        window.addEventListener("error", errorHandler, true);

        return () => {
            // Restore original if component unmounts (though unlikely)
            Object.defineProperty = originalDefineProperty;
            window.removeEventListener("error", errorHandler, true);
        };
    }, []);

    return null;
};

