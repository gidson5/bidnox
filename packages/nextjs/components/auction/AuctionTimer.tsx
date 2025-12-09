/**
 * Component to display countdown timer for auction
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { formatTimeRemaining } from "~~/utils/auction";

interface AuctionTimerProps {
    endTime: Date | bigint | number;
}

export const AuctionTimer: React.FC<AuctionTimerProps> = ({ endTime }) => {
    const [remaining, setRemaining] = useState<string>("");

    // Convert endTime to Date object if it's a timestamp (bigint or number)
    const endTimeDate = useMemo(() => {
        if (endTime instanceof Date) {
            return endTime;
        }
        // Handle BigInt or number (Unix timestamp in seconds)
        const timestamp = typeof endTime === "bigint" ? Number(endTime) : endTime;
        // Check for invalid timestamp (0 or negative)
        if (!timestamp || timestamp <= 0) {
            return new Date(0); // Return epoch date as fallback
        }
        // Convert seconds to milliseconds for Date constructor
        return new Date(timestamp * 1000);
    }, [endTime]);

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const timeLeft = endTimeDate.getTime() - now.getTime();

            if (timeLeft <= 0) {
                setRemaining("00:00:00");
                return;
            }

            const totalSeconds = Math.floor(timeLeft / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            // Format as DD:HH:MM:SS (always consistent format)
            if (days > 0) {
                setRemaining(
                    `${days.toString().padStart(2, "0")}:${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
                );
            } else {
                // Show HH:MM:SS when less than a day
                setRemaining(
                    `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
                );
            }
        };

        // Initial update
        updateTimer();

        // Update every second
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [endTimeDate]);

    const now = new Date();
    const isEnded = endTimeDate.getTime() <= now.getTime();

    return (
        <div className="text-center">
            <div className="text-3xl font-mono font-bold text-white mb-2">
                {remaining}
            </div>
            <div className="text-gray-400 text-sm">
                {isEnded ? "Auction Ended" : "Time Remaining"}
            </div>
        </div>
    );
};
