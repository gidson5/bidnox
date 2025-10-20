/**
 * Hook to fetch list of all auctions
 */

import { useMemo } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { getAuctionStatus } from "~~/utils/auction";

export type AuctionFilter = "all" | "active" | "ended" | "finalized";

export const useAuctionList = (filter: AuctionFilter = "all") => {
    // Get total auction count
    const { data: auctionCount, isLoading: isLoadingCount } =
        useScaffoldReadContract({
            contractName: "AuctionPlatform",
            functionName: "get_auction_count",
        });

    // Generate array of auction IDs
    const auctionIds = useMemo(() => {
        if (!auctionCount) return [];
        const count = Number(auctionCount);
        return Array.from({ length: count }, (_, i) => BigInt(i + 1));
    }, [auctionCount]);

    // Fetch all auctions (this could be optimized with batch reading)
    const auctions = auctionIds.map((id) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { data: auction } = useScaffoldReadContract({
            contractName: "AuctionPlatform",
            functionName: "get_auction",
            args: [id],
        });
        return auction;
    });

    // Filter auctions based on filter type
    const filteredAuctions = useMemo(() => {
        if (!auctions || auctions.length === 0) return [];

        return auctions
            .filter((auctionData) => {
                if (!auctionData) return false;

                // Type assertion to help TypeScript
                const auction = auctionData as any;

                const status = getAuctionStatus(
                    auction.end_time,
                    auction.finalized,
                    auction.cancelled
                );

                if (filter === "all") return !auction.cancelled;
                return status === filter;
            })
            .sort((a, b) => {
                // Sort by end time (soonest first for active, latest first for ended)
                if (!a || !b) return 0;
                // Type assertions for sorting
                const aData = a as any;
                const bData = b as any;
                const aTime = Number(aData.end_time);
                const bTime = Number(bData.end_time);
                return bTime - aTime;
            });
    }, [auctions, filter]);

    return {
        auctions: filteredAuctions,
        isLoading: isLoadingCount,
        totalCount: auctionCount ? Number(auctionCount) : 0,
    };
};
