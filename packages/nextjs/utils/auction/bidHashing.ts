/**
 * Utility functions for bid hashing and secret management
 */

/**
 * Generate a random secret for bid hashing
 */
export const generateBidSecret = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return (
        "0x" +
        Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
    );
};

/**
 * Store bid secret in localStorage (encrypted with user address)
 */
export const storeBidSecret = (
    auctionId: string,
    userAddress: string,
    secret: string,
    amount: string
): void => {
    const key = `bid_${auctionId}_${userAddress}`;
    const data = {
        secret,
        amount,
        timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));
};

/**
 * Retrieve bid secret from localStorage
 */
export const getBidSecret = (
    auctionId: string,
    userAddress: string
): { secret: string; amount: string } | null => {
    const key = `bid_${auctionId}_${userAddress}`;
    const stored = localStorage.getItem(key);

    if (!stored) return null;

    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
};

/**
 * Clear bid secret after reveal
 */
export const clearBidSecret = (
    auctionId: string,
    userAddress: string
): void => {
    const key = `bid_${auctionId}_${userAddress}`;
    localStorage.removeItem(key);
};

/**
 * Check if user has a stored bid for this auction
 */
export const hasBidSecret = (
    auctionId: string,
    userAddress: string
): boolean => {
    const key = `bid_${auctionId}_${userAddress}`;
    return localStorage.getItem(key) !== null;
};


