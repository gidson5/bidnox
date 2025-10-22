/**
 * Hook to place a sealed bid
 */

import { useScaffoldContract } from "~~/hooks/scaffold-stark/useScaffoldContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { storeBidSecret } from "~~/utils/auction/bidHashing";

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

            // Compute bid hash using contract function
            const bidHash = await contract.call("compute_bid_hash", [
                amount,
                secret,
            ]);

            if (!bidHash) {
                throw new Error("Failed to compute bid hash");
            }

            // Store secret locally for later reveal
            storeBidSecret(
                auctionId.toString(),
                userAddress,
                secret,
                amount.toString()
            );

            // Place bid with hash
            await sendAsync({
                args: [auctionId, bidHash],
            });

            return { success: true };
        } catch (error) {
            console.error("Error placing bid:", error);
            return { success: false, error };
        }
    };

    return {
        placeBid,
        isPending,
    };
};
