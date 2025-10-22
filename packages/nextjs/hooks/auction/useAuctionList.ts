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
                        const rawAuction = await contract.call("get_auction", [
                            BigInt(i),
                        ]);
                        console.log(`  ✅ Auction #${i} (raw):`, rawAuction);

                        // Parse raw array response into structured object
                        // u256 fields are split into [low, high] pairs
                        // Array indices: [0-1: auction_id, 2: seller, 3-4: asset_id,
                        // 5-6: starting_price, 7: start_time, 8: duration, 9: end_time,
                        // 10-11: highest_bid, 12: highest_bidder, 13: finalized, 14: cancelled]
                        let parsedAuction;
                        if (
                            Array.isArray(rawAuction) &&
                            rawAuction.length === 15
                        ) {
                            parsedAuction = {
                                auction_id: {
                                    low: rawAuction[0],
                                    high: rawAuction[1],
                                },
                                seller: rawAuction[2],
                                asset_id: {
                                    low: rawAuction[3],
                                    high: rawAuction[4],
                                },
                                starting_price: {
                                    low: rawAuction[5],
                                    high: rawAuction[6],
                                },
                                start_time: BigInt(rawAuction[7]),
                                duration: BigInt(rawAuction[8]),
                                end_time: BigInt(rawAuction[9]),
                                highest_bid: {
                                    low: rawAuction[10],
                                    high: rawAuction[11],
                                },
                                highest_bidder: rawAuction[12],
                                finalized:
                                    rawAuction[13] !== "0x0" &&
                                    rawAuction[13] !== 0,
                                cancelled:
                                    rawAuction[14] !== "0x0" &&
                                    rawAuction[14] !== 0,
                            };
                        } else {
                            parsedAuction = rawAuction;
                        }

                        console.log(
                            `  ✅ Auction #${i} (parsed):`,
                            parsedAuction
                        );
                        fetchedAuctions.push(parsedAuction);
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
