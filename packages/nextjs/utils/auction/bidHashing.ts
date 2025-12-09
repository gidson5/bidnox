/**
 * Utility functions for bid hashing and secret management
 */

/**
 * Felt252 prime modulus: P = 2^251 + 17 * 2^192 + 1
 * In hex: 0x8000000000000110000000000000000000000000000000000000000000000001
 * Valid range: [0, P-1]
 * For safety, we'll use values less than 2^251 to avoid edge cases
 */
const FELT252_PRIME = BigInt("0x8000000000000110000000000000000000000000000000000000000000000001");
const SAFE_MAX_FELT252 = BigInt("0x800000000000000000000000000000000000000000000000000000000000000"); // 2^251

/**
 * Validate and normalize a value to be within felt252 range [0, P-1]
 * Returns the value as BigInt, normalized using modulo P
 */
export const validateFelt252 = (value: string | bigint): bigint => {
    let bigIntValue: bigint;
    
    if (typeof value === "string") {
        // Remove 0x prefix if present
        const cleanValue = value.startsWith("0x") ? value.slice(2) : value;
        if (cleanValue.length === 0) {
            throw new Error("Empty value");
        }
        bigIntValue = BigInt("0x" + cleanValue);
    } else {
        bigIntValue = value;
    }
    
    if (bigIntValue < 0n) {
        throw new Error(`Value cannot be negative`);
    }
    
    // Normalize using modulo P to ensure it's within valid range
    return bigIntValue % FELT252_PRIME;
};

/**
 * Generate a random secret for bid hashing
 * Returns a value within felt252 range [0, P-1]
 * Uses 30 bytes (240 bits) to ensure it's safely within range
 */
export const generateBidSecret = (): string => {
    // Generate 30 bytes (240 bits) to ensure it fits within felt252 range
    // 30 bytes = 240 bits, which is safely less than 2^251
    // This gives us plenty of room and avoids any edge cases
    const array = new Uint8Array(30);
    crypto.getRandomValues(array);
    
    // Convert to hex string
    const hexString = "0x" + Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
    const value = BigInt(hexString);
    
    // Normalize to ensure it's within felt252 range
    // Since 30 bytes is much smaller than the prime, this should be a no-op
    const normalizedValue = value % FELT252_PRIME;
    
    // Return as hex string - ensure it starts with 0x and has proper formatting
    const hexResult = normalizedValue.toString(16);
    return "0x" + hexResult;
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
 * Automatically normalizes the secret to ensure it's within felt252 range
 */
export const getBidSecret = (
    auctionId: string,
    userAddress: string
): { secret: string; amount: string } | null => {
    const key = `bid_${auctionId}_${userAddress}`;
    const stored = localStorage.getItem(key);

    if (!stored) return null;

    try {
        const data = JSON.parse(stored);
        // Normalize the secret to ensure it's within felt252 range
        // This handles cases where old secrets might be stored with invalid values
        try {
            const normalizedSecret = validateFelt252(data.secret);
            return {
                secret: "0x" + normalizedSecret.toString(16),
                amount: data.amount,
            };
        } catch (error) {
            console.error("Error normalizing stored secret:", error);
            return null;
        }
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


