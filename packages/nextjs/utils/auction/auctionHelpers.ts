/**
 * Helper functions for auction data formatting and validation
 */

export const formatStrkAmount = (amount: bigint): string => {
    const strk = Number(amount) / 1e18;
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

export const shortenAddress = (address: string): string => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
