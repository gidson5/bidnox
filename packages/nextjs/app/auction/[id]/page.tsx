"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAccount } from "@starknet-react/core";
import { CustomConnectButton } from "~~/components/scaffold-stark";
import { useAuctionDetails, usePlaceBid } from "~~/hooks/auction";
import { AuctionTimer, AuctionStatusBadge } from "~~/components/auction";
import {
    formatStrkAmount,
    getAuctionStatus,
    shortenAddress,
    parseStrkAmount,
} from "~~/utils/auction";
import { generateBidSecret } from "~~/utils/auction/bidHashing";

export default function AuctionDetailPage() {
    const params = useParams();
    const auctionIdString = params.id as string;
    const [bidAmount, setBidAmount] = useState("");
    const [bidError, setBidError] = useState<string | null>(null);

    // All hooks must be called at the top level, before any conditional returns
    const { address } = useAccount();
    
    // Validate auction ID - use 0n as default if invalid (hooks will handle it)
    let auctionId: bigint = 0n;
    let isInvalidAuctionId = false;
    try {
        if (!auctionIdString || auctionIdString.trim() === "") {
            isInvalidAuctionId = true;
        } else {
            auctionId = BigInt(auctionIdString);
        }
    } catch (error) {
        isInvalidAuctionId = true;
    }

    // Call hooks with auctionId (will be 0n if invalid, hooks should handle gracefully)
    const {
        auction: auctionData,
        userBid: userBidData,
        isLoading,
    } = useAuctionDetails(auctionId);
    const { placeBid, isPending: isPlacingBidHook } = usePlaceBid(auctionId);

    // Show error UI if auction ID is invalid (after hooks are called)
    if (isInvalidAuctionId) {
        return (
            <div className="min-h-screen bg-gray-900">
                <div className="container mx-auto px-6 py-8 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Invalid Auction ID
                    </h1>
                    <p className="text-gray-400 mb-6">
                        The auction ID you provided is invalid.
                    </p>
                    <Link href="/auction">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                            Back to Auctions
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!auctionData) {
        return (
            <div className="min-h-screen bg-gray-900">
                <div className="container mx-auto px-6 py-8 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Auction Not Found
                    </h1>
                    <p className="text-gray-400 mb-6">
                        The auction you&apos;re looking for doesn&apos;t exist
                        or has been removed.
                    </p>
                    <Link href="/auction">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                            Back to Auctions
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    // Type assertions to help TypeScript understand the correct types
    const auction = auctionData as any;
    const userBid = userBidData as any;

    // Safe access to auction properties with defaults
    const status = getAuctionStatus(
        auction?.end_time,
        auction?.finalized ?? false,
        auction?.cancelled ?? false
    );
    const isActive = status === "active";
    // Check if user has a bid (bid_hash will be 0 if no bid exists)
    const hasUserBid = userBid && (
        (typeof userBid.bid_hash === "bigint" && userBid.bid_hash !== 0n) ||
        (typeof userBid.bid_hash === "string" && userBid.bid_hash !== "0" && userBid.bid_hash !== "0x0") ||
        (typeof userBid.bid_hash === "number" && userBid.bid_hash !== 0)
    );
    const canBid = isActive && !hasUserBid;

    // Debug info (remove in production)
    console.log("Auction Status:", {
        status,
        isActive,
        hasUserBid,
        canBid,
        userBid,
        bidHash: userBid?.bid_hash,
        endTime: auction?.end_time,
        finalized: auction?.finalized,
        cancelled: auction?.cancelled,
    });

    const handlePlaceBid = async () => {
        if (!bidAmount || parseFloat(bidAmount) <= 0) {
            setBidError("Please enter a valid bid amount");
            return;
        }

        if (!address) {
            setBidError("Please connect your wallet");
            return;
        }

        setBidError(null);

        try {
            // Convert bid amount to wei (u256)
            const bidAmountWei = parseStrkAmount(bidAmount);
            
            // Validate bid is at least starting price
            const startingPrice = auction?.starting_price 
                ? (typeof auction.starting_price === "bigint" 
                    ? auction.starting_price 
                    : BigInt(auction.starting_price.toString()))
                : 0n;
            
            if (bidAmountWei < startingPrice) {
                setBidError(
                    `Bid must be at least ${formatStrkAmount(startingPrice)} STRK`
                );
                return;
            }

            // Generate secret for bid hashing
            const secret = generateBidSecret();

            // Place bid (hook handles hash computation and transaction)
            const result = await placeBid(bidAmountWei, secret, address);

            if (result.success) {
                // Clear bid amount on success
                setBidAmount("");
                // Optionally show success message or refresh data
                console.log("Bid placed successfully!");
            } else {
                setBidError(result.error || "Failed to place bid");
            }
        } catch (error: any) {
            console.error("Failed to place bid:", error);
            setBidError(error?.message || "An unexpected error occurred");
        }
    };

    const isPlacingBid = isPlacingBidHook;

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-6 py-8 max-w-4xl">
                {/* Back Button */}
                <Link
                    href="/auction"
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6"
                >
                    ← Back to Auctions
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Auction Details */}
                    <div className="space-y-6">
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-3xl font-bold text-white">
                                    Auction #{auction?.auction_id?.toString() ?? "N/A"}
                                </h1>
                                <AuctionStatusBadge status={status} />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-400 text-sm">
                                        Asset ID
                                    </label>
                                    <p className="text-white font-mono text-lg">
                                        {auction?.asset_id?.toString() ?? "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-sm">
                                        Seller
                                    </label>
                                    <p className="text-white font-mono">
                                        {shortenAddress(auction?.seller)}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-sm">
                                        Starting Price
                                    </label>
                                    <p className="text-white text-xl font-semibold">
                                        {formatStrkAmount(
                                            auction?.starting_price ?? 0n
                                        )}{" "}
                                        STRK
                                    </p>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-sm">
                                        Current Highest Bid
                                    </label>
                                    <p className="text-orange-400 text-2xl font-bold">
                                        {formatStrkAmount(auction?.highest_bid ?? 0n)}{" "}
                                        STRK
                                    </p>
                                </div>

                                <div className="border-t border-gray-700 pt-4">
                                    <AuctionTimer endTime={auction?.end_time} />
                                </div>
                            </div>
                        </div>

                        {/* Bid History */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">
                                Bid History
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                                    <span className="text-gray-400">
                                        Total Bids
                                    </span>
                                    <span className="text-white font-semibold">
                                        {auction?.bid_count?.toString() ?? "0"}
                                    </span>
                                </div>
                                {userBid && (
                                    <div className="flex justify-between items-center p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                                        <span className="text-blue-400">
                                            Your Bid
                                        </span>
                                        <span className="text-blue-400 font-semibold">
                                            {formatStrkAmount(userBid?.amount ?? 0n)}{" "}
                                            STRK
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-6">
                        {/* Place Bid Form - Always visible with status message */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">
                                Place Bid
                            </h3>
                            
                            {/* Status Messages */}
                            {!isActive && (
                                <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                                    <p className="text-yellow-400 text-sm">
                                        {status === "ended" && "This auction has ended. You can reveal your bid if you placed one."}
                                        {status === "finalized" && "This auction has been finalized."}
                                        {status === "cancelled" && "This auction has been cancelled."}
                                        {!status && "Auction status unknown."}
                                    </p>
                                </div>
                            )}
                            
                            {hasUserBid && (
                                <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                                    <p className="text-blue-400 text-sm">
                                        You have already placed a bid on this auction.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">
                                        Bid Amount (STRK)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        value={bidAmount}
                                        onChange={(e) => {
                                            setBidAmount(e.target.value);
                                            setBidError(null);
                                        }}
                                        disabled={!canBid}
                                        className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            !canBid ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                        placeholder="0.001"
                                    />
                                    {bidError && (
                                        <p className="text-red-400 text-sm mt-2">
                                            {bidError}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={handlePlaceBid}
                                    disabled={!canBid || isPlacingBid || !bidAmount || !address}
                                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                                        !canBid || isPlacingBid || !bidAmount || !address
                                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                            : "bg-green-600 hover:bg-green-700 text-white"
                                    }`}
                                >
                                    {isPlacingBid
                                        ? "Placing Bid..."
                                        : canBid
                                        ? "Place Bid"
                                        : "Cannot Place Bid"}
                                </button>
                                {!address && (
                                    <p className="text-yellow-400 text-sm text-center">
                                        Please connect your wallet to place a bid
                                    </p>
                                )}
                                {!canBid && address && (
                                    <p className="text-gray-400 text-sm text-center">
                                        {!isActive && "Auction is not active. "}
                                        {hasUserBid && "You have already placed a bid. "}
                                    </p>
                                )}
                            </div>
                        </div>

                        {userBid && !isActive && (
                            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                                <h3 className="text-xl font-semibold text-white mb-4">
                                    Your Bid
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">
                                            Amount
                                        </span>
                                        <span className="text-white font-semibold">
                                            {formatStrkAmount(userBid?.amount ?? 0n)}{" "}
                                            STRK
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">
                                            Status
                                        </span>
                                        <span
                                            className={`font-semibold ${
                                                userBid?.revealed
                                                    ? "text-green-400"
                                                    : "text-yellow-400"
                                            }`}
                                        >
                                            {userBid?.revealed
                                                ? "Revealed"
                                                : "Not Revealed"}
                                        </span>
                                    </div>
                                    {!userBid?.revealed && (
                                        <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-medium transition-colors">
                                            Reveal Bid
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {status === "ended" && !auction?.finalized && (
                                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors">
                                    Finalize Auction
                                </button>
                            )}

                            <Link href="/auction" className="block">
                                <button className="w-full bg-transparent border border-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors">
                                    Back to All Auctions
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
