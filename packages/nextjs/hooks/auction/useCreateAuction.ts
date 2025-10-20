/**
 * Hook to create a new auction
 */

import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";

export const useCreateAuction = () => {
    const { sendAsync, isPending } = useScaffoldWriteContract({
        contractName: "AuctionPlatform",
        functionName: "create_auction",
        args: [BigInt(0), BigInt(0), BigInt(0)], // Placeholder args
    });

    const createAuction = async (
        assetId: bigint,
        startingPrice: bigint,
        duration: number
    ) => {
        try {
            await sendAsync({
                args: [assetId, startingPrice, BigInt(duration)],
            });
            return { success: true };
        } catch (error) {
            console.error("Error creating auction:", error);
            return { success: false, error };
        }
    };

    return {
        createAuction,
        isPending,
    };
};
