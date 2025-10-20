/**
 * Hook to finalize an auction
 */

import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";

export const useFinalize = (auctionId: bigint) => {
    const { sendAsync, isPending } = useScaffoldWriteContract({
        contractName: "AuctionPlatform",
        functionName: "finalize_auction",
        args: [auctionId],
    });

    const finalize = async () => {
        try {
            await sendAsync({
                args: [auctionId],
            });
            return { success: true };
        } catch (error) {
            console.error("Error finalizing auction:", error);
            return { success: false, error };
        }
    };

    return {
        finalize,
        isPending,
    };
};
