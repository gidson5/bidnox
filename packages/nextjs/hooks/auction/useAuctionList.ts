/**
 * Hook to fetch list of all auctions
 * Uses useScaffoldContract to properly handle ABI parsing
 */

import { useEffect, useState } from "react";
import { useScaffoldContract } from "~~/hooks/scaffold-stark/useScaffoldContract";
import { getAuctionStatus } from "~~/utils/auction";

export type AuctionFilter = "all" | "active" | "ended" | "finalized";

export const useAuctionList = (filter: AuctionFilter = "all") => {
    const [auctions, setAuctions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Use useScaffoldContract which handles ABI properly
    const { data: contract, isLoading: contractLoading } = useScaffoldContract({
        contractName: "AuctionPlatform",
    });

    console.log("[useAuctionList] Hook called with filter:", filter);
    console.log("[useAuctionList] Contract loading:", contractLoading);
    console.log("[useAuctionList] Contract ready:", !!contract);

    // Fetch all auctions when contract is ready
    useEffect(() => {
        let isMounted = true;

        async function fetchAllAuctions() {
            if (contractLoading) {
                console.log("[useAuctionList] Contract still loading...");
                return;
            }

            if (!contract) {
                console.log("[useAuctionList] Contract not available");
                if (isMounted) {
                    setAuctions([]);
                    setTotalCount(0);
                    setIsLoading(false);
                }
                return;
            }

            console.log(
                "[useAuctionList] Contract ready, fetching auctions..."
            );
            if (isMounted) setIsLoading(true);

            try {
                // Step 1: Get total auction count
                console.log(
                    "[useAuctionList] Step 1: Getting auction count..."
                );
                const count = await contract.call("get_auction_count");
                const countNumber = Number(count);

                if (isMounted) {
                    setTotalCount(countNumber);
                }

                console.log(`[useAuctionList] Total auctions: ${countNumber}`);

                if (countNumber === 0) {
                    console.log("[useAuctionList] No auctions found");
                    if (isMounted) {
                        setAuctions([]);
                        setIsLoading(false);
                    }
                    return;
                }

                // Step 2: Fetch each auction
                console.log(
                    `[useAuctionList] Step 2: Fetching ${countNumber} auctions...`
                );
                const fetchedAuctions = [];

                for (let i = 1; i <= countNumber; i++) {
                    try {
                        console.log(`  → Fetching auction #${i}...`);
                        const auction = await contract.call("get_auction", [
                            BigInt(i),
                        ]);
                        console.log(`  ✅ Auction #${i}:`, auction);
                        fetchedAuctions.push(auction);
                    } catch (error) {
                        console.error(
                            `  ❌ Failed to fetch auction #${i}:`,
                            error
                        );
                    }
                }

                console.log(
                    `[useAuctionList] Successfully fetched ${fetchedAuctions.length}/${countNumber} auctions`
                );

                if (isMounted) {
                    setAuctions(fetchedAuctions);
                }
            } catch (error) {
                console.error(
                    "[useAuctionList] Error fetching auctions:",
                    error
                );
                if (isMounted) {
                    setAuctions([]);
                    setTotalCount(0);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchAllAuctions();

        // Cleanup function
        return () => {
            isMounted = false;
            console.log(
                "[useAuctionList] Component unmounted, cancelling fetch"
            );
        };
    }, [contract, contractLoading]); // Depend on contract instance

    // Filter and sort auctions
    const filteredAuctions = auctions
        .filter((auctionData) => {
            if (!auctionData) return false;

            // Type assertion to help TypeScript
            const auction = auctionData as any;

            try {
                const status = getAuctionStatus(
                    auction.end_time,
                    auction.finalized,
                    auction.cancelled
                );

                if (filter === "all") return !auction.cancelled;
                return status === filter;
            } catch (error) {
                console.error(
                    "[useAuctionList] Error filtering auction:",
                    error
                );
                return false;
            }
        })
        .sort((a, b) => {
            // Sort by end time (latest first)
            if (!a || !b) return 0;
            try {
                const aData = a as any;
                const bData = b as any;
                const aTime = Number(aData.end_time);
                const bTime = Number(bData.end_time);
                return bTime - aTime;
            } catch (error) {
                console.error(
                    "[useAuctionList] Error sorting auctions:",
                    error
                );
                return 0;
            }
        });

    console.log(
        `[useAuctionList] Filtered auctions (${filter}): ${filteredAuctions.length}/${auctions.length}`
    );

    return {
        auctions: filteredAuctions,
        isLoading: isLoading || contractLoading,
        totalCount,
    };
};
