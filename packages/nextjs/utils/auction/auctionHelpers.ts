/**
 * Helper functions for auction data formatting and validation
 */

import { getChecksumAddress } from "starknet";

// Convert u256 {low, high} to BigInt
export const u256ToBigInt = (u256: any): bigint => {
    if (typeof u256 === "bigint") return u256;
    if (typeof u256 === "string") return BigInt(u256);
    if (typeof u256 === "number") return BigInt(u256);
    if (u256 && typeof u256 === "object" && "low" in u256) {
        const low = BigInt(u256.low || 0);
        const high = BigInt(u256.high || 0);
        return (high << 128n) + low;
    }
    return 0n;
};

export const formatStrkAmount = (amount: any): string => {
    const bigIntAmount = u256ToBigInt(amount);
    const strk = Number(bigIntAmount) / 1e18;
    return strk.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
    });
};

export const parseStrkAmount = (amount: string): bigint => {
    const num = parseFloat(amount);
    if (isNaN(num)) return 0n;
    return BigInt(Math.floor(num * 1e18));
};

export const validateAuctionForm = (formData: {
    assetId: string;
    startingPrice: string;
    duration: string;
}): Partial<typeof formData> => {
    const errors: Partial<typeof formData> = {};

    // Validate Asset ID is a number
    if (!formData.assetId || formData.assetId.trim() === "") {
        errors.assetId = "Asset ID is required";
    } else {
        const assetIdNum = parseFloat(formData.assetId);
        if (
            isNaN(assetIdNum) ||
            !Number.isInteger(assetIdNum) ||
            assetIdNum < 0
        ) {
            errors.assetId = "Asset ID must be a positive whole number";
        }
    }

    const price = parseFloat(formData.startingPrice);
    if (!formData.startingPrice || isNaN(price) || price <= 0) {
        errors.startingPrice = "Starting price must be greater than 0";
    }

    const duration = parseInt(formData.duration);
    if (!duration || duration <= 0) {
        errors.duration = "Duration must be selected";
    }

    return errors;
};

export const validateBidForm = (
    bidAmount: string,
    startingPrice: bigint,
    secret: string
): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
        errors.push("Bid amount must be greater than 0");
    }

    const bidWei = parseStrkAmount(bidAmount);
    if (bidWei < startingPrice) {
        errors.push(
            `Bid must be at least ${formatStrkAmount(startingPrice)} STRK`
        );
    }

    if (!secret || secret.trim() === "") {
        errors.push("Secret is required");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

export const shortenAddress = (address: string | bigint | number | undefined | null): string => {
    if (address === null || address === undefined) return "";
    
    let addressStr: string;
    
    // Convert to string if it's not already
    if (typeof address === "string") {
        addressStr = address;
    } else if (typeof address === "bigint") {
        // Convert BigInt to hex string (Starknet addresses are 64 hex chars = 256 bits)
        const hexStr = address.toString(16).padStart(64, "0");
        addressStr = `0x${hexStr}`;
        // Use getChecksumAddress for proper formatting
        try {
            addressStr = getChecksumAddress(addressStr);
        } catch {
            // If checksum fails, use the hex string as-is
        }
    } else {
        addressStr = String(address);
    }
    
    // Ensure it has 0x prefix
    if (!addressStr.startsWith("0x")) {
        addressStr = `0x${addressStr}`;
    }
    
    // Remove 0x prefix for processing
    const cleanAddress = addressStr.slice(2);
    
    // Ensure we have enough characters to shorten (at least 10 chars)
    if (cleanAddress.length <= 10) {
        return addressStr;
    }
    
    // Format as 0x + first 6 chars + ... + last 4 chars (standard format)
    return `0x${cleanAddress.slice(0, 6)}...${cleanAddress.slice(-4)}`;
};

export const getStatusColor = (
    status: "active" | "ended" | "finalized" | "cancelled"
): string => {
    switch (status) {
        case "active":
            return "bg-green-500";
        case "ended":
            return "bg-yellow-500";
        case "finalized":
            return "bg-blue-500";
        case "cancelled":
            return "bg-red-500";
        default:
            return "bg-gray-500";
    }
};

export const getStatusText = (
    status: "active" | "ended" | "finalized" | "cancelled"
): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
};
