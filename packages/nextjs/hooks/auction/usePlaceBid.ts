/**
 * Hook to place a sealed bid
 */

import { useScaffoldContract } from "~~/hooks/scaffold-stark/useScaffoldContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { storeBidSecret, validateFelt252 } from "~~/utils/auction/bidHashing";

export const usePlaceBid = (auctionId: bigint) => {
    const { sendAsync, isPending } = useScaffoldWriteContract({
        contractName: "AuctionPlatform",
        functionName: "place_bid",
        args: [BigInt(0), BigInt(0)], // Placeholder args
    });

    // Get contract instance to compute bid hash dynamically
    const { data: contract } = useScaffoldContract({
        contractName: "AuctionPlatform",
    });

    const placeBid = async (
        amount: bigint,
        secret: string,
        userAddress: string
    ) => {
        try {
            if (!contract) {
                throw new Error("Contract not loaded");
            }

            // Validate and normalize secret to ensure it's within felt252 range
            const validSecret = validateFelt252(secret);
            // Convert to hex string for storage, but use BigInt for contract calls
            const normalizedSecretHex = "0x" + validSecret.toString(16);

            console.log("Placing bid with normalized secret:", {
                original: secret,
                normalized: normalizedSecretHex,
                secretBigInt: validSecret.toString(),
            });

            // Compute bid hash using contract function
            // Pass secret as BigInt (Starknet.js expects BigInt for felt252 in contract calls)
            const bidHashResult = await contract.call("compute_bid_hash", [
                amount,
                validSecret, // Pass as BigInt, not hex string
            ]);

            // Extract the felt252 value from the result
            // contract.call() returns the value directly, but we need to ensure it's a BigInt
            let bidHash: bigint;
            if (typeof bidHashResult === "bigint") {
                bidHash = bidHashResult;
            } else if (typeof bidHashResult === "string") {
                bidHash = BigInt(bidHashResult);
            } else if (Array.isArray(bidHashResult) && bidHashResult.length > 0) {
                bidHash = BigInt(bidHashResult[0]);
            } else {
                throw new Error("Failed to compute bid hash: invalid result format");
            }

            console.log("Computed bid hash:", bidHash.toString());

            // Store secret locally for later reveal (store normalized secret as hex string)
            storeBidSecret(
                auctionId.toString(),
                userAddress,
                normalizedSecretHex,
                amount.toString()
            );

            // Place bid with hash (both auctionId and bidHash should be BigInt)
            await sendAsync({
                args: [auctionId, bidHash],
            });

            return { success: true };
        } catch (error) {
            console.error("Error placing bid:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMessage };
        }
    };

    return {
        placeBid,
        isPending,
    };
};
