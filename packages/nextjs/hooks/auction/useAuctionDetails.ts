/**
 * Hook to fetch detailed information about a single auction
 */

import { useAccount } from "@starknet-react/core";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";

export const useAuctionDetails = (auctionId: bigint) => {
    const { address } = useAccount();

    // Fetch auction details
    const {
        data: auction,
        isLoading: isLoadingAuction,
        refetch: refetchAuction,
    } = useScaffoldReadContract({
        contractName: "AuctionPlatform",
        functionName: "get_auction",
        args: [auctionId],
    });

    // Fetch user's bid if connected
    const {
        data: userBid,
        isLoading: isLoadingBid,
        refetch: refetchBid,
    } = useScaffoldReadContract({
        contractName: "AuctionPlatform",
        functionName: "get_bid",
        args: [auctionId, address || "0x0"],
        enabled: !!address,
    });

    // Check if auction is active
    const { data: isActive } = useScaffoldReadContract({
        contractName: "AuctionPlatform",
        functionName: "is_auction_active",
        args: [auctionId],
    });

    // Check if auction has ended
    const { data: isEnded } = useScaffoldReadContract({
        contractName: "AuctionPlatform",
        functionName: "is_auction_ended",
        args: [auctionId],
    });

    const refetch = () => {
        refetchAuction();
        refetchBid();
    };

    return {
        auction,
        userBid,
        isActive,
        isEnded,
        isLoading: isLoadingAuction || isLoadingBid,
        refetch,
    };
};
