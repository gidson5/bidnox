/**
 * Utility functions for time handling in auctions
 */

export const formatTimeRemaining = (endTime: bigint): string => {
    const now = Math.floor(Date.now() / 1000);
    const end = Number(endTime);
    const remaining = end - now;

    if (remaining <= 0) {
        return "Ended";
    }

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
};

export const getAuctionStatus = (
    endTime: bigint | number | undefined | null,
    finalized: boolean | undefined | null,
    cancelled: boolean | undefined | null
): "active" | "ended" | "finalized" | "cancelled" => {
    // Handle null/undefined values
    if (cancelled === true) return "cancelled";
    if (finalized === true) return "finalized";

    // If endTime is missing or invalid, default to ended
    if (!endTime || endTime === 0n || endTime === 0) {
        if (process.env.NODE_ENV === "development") {
            console.warn("[getAuctionStatus] Invalid endTime:", endTime);
        }
        return "ended";
    }

    const now = Math.floor(Date.now() / 1000);
    // Convert endTime to number (handles both bigint and number)
    const end = typeof endTime === "bigint" ? Number(endTime) : endTime;

    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
        console.log("[getAuctionStatus] Time comparison:", {
            now,
            end,
            nowType: typeof now,
            endType: typeof end,
            endTimeOriginal: endTime,
            endTimeOriginalType: typeof endTime,
            isActive: now < end,
            difference: end - now,
            differenceInHours: (end - now) / 3600,
        });
    }

    // Check if end time is in the future (auction is active)
    return now < end ? "active" : "ended";
};

export const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

export const durationToSeconds = (
    value: number,
    unit: "minutes" | "hours" | "days"
): number => {
    switch (unit) {
        case "minutes":
            return value * 60;
        case "hours":
            return value * 3600;
        case "days":
            return value * 86400;
        default:
            return value;
    }
};


