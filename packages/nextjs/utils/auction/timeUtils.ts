/**
 * Utility functions for time handling in auctions
 */

export const formatTimeRemaining = (endTime: bigint | null | undefined): string => {
    if (!endTime) return "N/A";
    
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
    endTime: bigint | null | undefined,
    finalized: boolean | null | undefined,
    cancelled: boolean | null | undefined
): "active" | "ended" | "finalized" | "cancelled" => {
    if (cancelled) return "cancelled";
    if (finalized) return "finalized";
    if (!endTime) return "ended";

    const now = Math.floor(Date.now() / 1000);
    const end = Number(endTime);

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


