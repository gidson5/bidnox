/**
 * Component to display countdown timer for auction
 */

"use client";

import { useState, useEffect } from "react";
import { formatTimeRemaining } from "~~/utils/auction";

interface AuctionTimerProps {
    endTime: bigint | Date | null | undefined;
}

export const AuctionTimer: React.FC<AuctionTimerProps> = ({ endTime }) => {
    const [remaining, setRemaining] = useState<string>("");

    useEffect(() => {
        if (!endTime) {
            setRemaining("N/A");
            return;
        }

        const updateTimer = () => {
            const now = Date.now();
            // Handle bigint (Unix timestamp in seconds) or Date object
            const endTimeMs = typeof endTime === "bigint" 
                ? Number(endTime) * 1000 
                : endTime instanceof Date 
                    ? endTime.getTime() 
                    : 0;
            
            const timeLeft = endTimeMs - now;

            if (timeLeft <= 0) {
                setRemaining("00:00:00:00");
                return;
            }

            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
                (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            setRemaining(
                `${days.toString().padStart(2, "0")}:${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
            );
        };

        // Initial update
        updateTimer();

        // Update every second
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    if (!endTime) {
        return (
            <div className="text-center">
                <div className="text-3xl font-mono font-bold text-white mb-2">
                    N/A
                </div>
                <div className="text-gray-400 text-sm">
                    No end time available
                </div>
            </div>
        );
    }

    const now = Date.now();
    const endTimeMs = typeof endTime === "bigint" 
        ? Number(endTime) * 1000 
        : endTime instanceof Date 
            ? endTime.getTime() 
            : 0;
    const isEnded = endTimeMs <= now;

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
