/**
 * Hook to reveal a sealed bid
 */

import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { clearBidSecret } from "~~/utils/auction/bidHashing";

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
            await sendAsync({
                args: [auctionId, amount, secret],
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
