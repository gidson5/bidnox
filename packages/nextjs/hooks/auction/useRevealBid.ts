/**
 * Hook to reveal a sealed bid
 */

import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { clearBidSecret, validateFelt252 } from "~~/utils/auction/bidHashing";

export const useRevealBid = (auctionId: bigint) => {
    const { sendAsync, isPending } = useScaffoldWriteContract({
        contractName: "AuctionPlatform",
        functionName: "reveal_bid",
        args: [BigInt(0), BigInt(0), ""], // Placeholder args
    });

    const revealBid = async (
        amount: bigint,
        secret: string,
        userAddress: string
    ) => {
        try {
            // Validate and normalize secret to ensure it's within felt252 range
            const validSecret = validateFelt252(secret);
            // Convert to hex string format for felt252 (Starknet.js expects hex strings for felt252)
            const normalizedSecret = "0x" + validSecret.toString(16);

            console.log("Revealing bid with normalized secret:", {
                original: secret,
                normalized: normalizedSecret,
                secretLength: normalizedSecret.length,
                secretBigInt: validSecret.toString(),
            });

            // Pass secret as hex string (felt252 format expected by Starknet.js)
            await sendAsync({
                args: [auctionId, amount, normalizedSecret], // Pass as hex string
            });

            // Clear stored secret after successful reveal
            clearBidSecret(auctionId.toString(), userAddress);

            return { success: true };
        } catch (error) {
            console.error("Error revealing bid:", error);
            return { success: false, error };
        }
    };

    return {
        revealBid,
        isPending,
    };
};
