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
        console.log("\n  [HOOK] useCreateAuction.createAuction called");
        console.log("    → Received assetId:", assetId.toString());
        console.log("    → Received startingPrice:", startingPrice.toString());
        console.log("    → Received duration:", duration);

        try {
            const args = [assetId, startingPrice, BigInt(duration)];
            console.log(
                "    → Prepared args:",
                args.map((a) => a.toString())
            );

            console.log("    → Calling sendAsync...");
            const txResult = await sendAsync({
                args: args,
            });

            console.log("    ✅ sendAsync returned:", txResult);
            return { success: true, txResult };
        } catch (error: any) {
            console.error("    ❌ Error in createAuction:");
            console.error("      → Error type:", typeof error);
            console.error("      → Error:", error);
            console.error("      → Error message:", error?.message);
            console.error("      → Error code:", error?.code);
            return { success: false, error };
        }
    };

    return {
        createAuction,
        isPending,
    };
};
