/**
 * Main auction contract hook - wrapper for contract interactions
 */

import { useScaffoldContract } from "~~/hooks/scaffold-stark/useScaffoldContract";

export const useAuctionContract = () => {
    const { data: contract, isLoading } = useScaffoldContract({
        contractName: "AuctionPlatform",
    });

    return {
        contract,
        isLoading,
    };
};


