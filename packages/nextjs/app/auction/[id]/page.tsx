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
    validateBidForm,
} from "~~/utils/auction";
import { generateBidSecret } from "~~/utils/auction/bidHashing";

export default function AuctionDetailPage() {
    const params = useParams();
    const auctionIdString = params.id as string;
    const auctionId = BigInt(auctionIdString);
    const [bidAmount, setBidAmount] = useState("");
    const [bidError, setBidError] = useState<string | null>(null);
    const { address: userAddress } = useAccount();

    const {
        auction: auctionData,
        userBid: userBidData,
        isLoading,
        refetch,
    } = useAuctionDetails(auctionId);

    const { placeBid, isPending: isPlacingBid } = usePlaceBid(auctionId);

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

    // Debug: Log auction data to understand the structure
    if (auction && process.env.NODE_ENV === "development") {
        console.log("[AuctionDetailPage] Auction data:", {
            end_time: auction.end_time,
            end_time_type: typeof auction.end_time,
            finalized: auction.finalized,
            cancelled: auction.cancelled,
            current_time: Math.floor(Date.now() / 1000),
        });
    }

    const status = getAuctionStatus(
        auction?.end_time,
        auction?.finalized,
        auction?.cancelled
    );
    const isActive = status === "active";
    const canBid = isActive && !userBid;
    
    // Debug logging
    if (process.env.NODE_ENV === "development") {
        console.log("[AuctionDetailPage] Bid conditions:", {
            status,
            isActive,
            hasUserBid: !!userBid,
            userBid,
            canBid,
            userAddress,
        });
    }

    const handlePlaceBid = async () => {
        setBidError(null);

        // Validate inputs
        if (!bidAmount || parseFloat(bidAmount) <= 0) {
            setBidError("Please enter a valid bid amount");
            return;
        }

        if (!userAddress) {
            setBidError("Please connect your wallet to place a bid");
            return;
        }

        if (!auction) {
            setBidError("Auction data not available");
            return;
        }

        // Validate bid amount against starting price
        const startingPrice = auction.starting_price
            ? (typeof auction.starting_price === "bigint"
                  ? auction.starting_price
                  : BigInt(auction.starting_price))
            : 0n;

        const bidValidation = validateBidForm(
            bidAmount,
            startingPrice,
            "dummy" // Secret validation not needed here, we generate it
        );

        if (!bidValidation.valid) {
            setBidError(bidValidation.errors[0] || "Invalid bid amount");
            return;
        }

        try {
            // Convert STRK amount to wei (BigInt)
            const bidAmountInWei = parseStrkAmount(bidAmount);

            // Generate a random secret for the sealed bid
            const secret = generateBidSecret();

            console.log("[AuctionDetailPage] Placing bid:", {
                auctionId: auctionId.toString(),
                bidAmount: bidAmount,
                bidAmountInWei: bidAmountInWei.toString(),
                userAddress,
            });

            // Place the bid
            const result = await placeBid(
                bidAmountInWei,
                secret,
                userAddress
            );

            if (result.success) {
                console.log("[AuctionDetailPage] Bid placed successfully!");
                // Clear the form
                setBidAmount("");
                setBidError(null);
                // Refresh auction data to show the new bid
                await refetch();
                alert("✅ Bid placed successfully! Remember to reveal your bid after the auction ends.");
            } else {
                console.error("[AuctionDetailPage] Failed to place bid:", result.error);
                setBidError(
                    result.error?.message ||
                        "Failed to place bid. Please try again."
                );
            }
        } catch (error: any) {
            console.error("[AuctionDetailPage] Error placing bid:", error);
            setBidError(
                error?.message || "An error occurred. Please try again."
            );
        }
    };

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
                                    Auction #{auction?.auction_id?.toString() || "N/A"}
                                </h1>
                                <AuctionStatusBadge status={status} />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-400 text-sm">
                                        Asset ID
                                    </label>
                                    <p className="text-white font-mono text-lg">
                                        {auction?.asset_id?.toString() || "N/A"}
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
                                            auction?.starting_price
                                        )}{" "}
                                        STRK
                                    </p>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-sm">
                                        Current Highest Bid
                                    </label>
                                    <p className="text-orange-400 text-2xl font-bold">
                                        {formatStrkAmount(auction?.highest_bid || 0n)}{" "}
                                        STRK
                                    </p>
                                </div>

                                <div className="border-t border-gray-700 pt-4">
                                    {auction?.end_time ? (
                                        <AuctionTimer endTime={auction.end_time} />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            End time not available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bid History */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">
                                Bid History
                            </h3>
                            <div className="space-y-3">
                                {/* Note: bid_count is not available in the Auction struct */}
                                {/* Would need a separate contract function to get bid count */}
                                {userBid && (
                                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                                        <span className="text-gray-400">
                                            Bids
                                        </span>
                                        <span className="text-white font-semibold">
                                            At least 1
                                        </span>
                                    </div>
                                )}
                                {userBid && (
                                    <div className="flex justify-between items-center p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                                        <span className="text-blue-400">
                                            Your Bid
                                        </span>
                                        <span className="text-blue-400 font-semibold">
                                            {formatStrkAmount(userBid.amount)}{" "}
                                            STRK
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-6">
                        {/* Show bid form for active auctions */}
                        {isActive ? (
                            userBid ? (
                                // User already placed a bid
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
                                                {formatStrkAmount(userBid.actual_amount || userBid.amount || 0n)}{" "}
                                                STRK
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">
                                                Status
                                            </span>
                                            <span
                                                className={`font-semibold ${
                                                    userBid.revealed
                                                        ? "text-green-400"
                                                        : "text-yellow-400"
                                                }`}
                                            >
                                                {userBid.revealed
                                                    ? "Revealed"
                                                    : "Sealed (Not Revealed)"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-4">
                                            You have already placed a bid on this auction. 
                                            Remember to reveal your bid after the auction ends.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                // Show bid form
                                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                                    <h3 className="text-xl font-semibold text-white mb-4">
                                        Place Bid
                                    </h3>
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
                                            className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                                                bidError
                                                    ? "border-red-500 focus:ring-red-500"
                                                    : "border-gray-600 focus:ring-blue-500"
                                            }`}
                                            placeholder={
                                                auction?.starting_price
                                                    ? `Min: ${formatStrkAmount(auction.starting_price)} STRK`
                                                    : "0.001"
                                            }
                                        />
                                        {bidError && (
                                            <p className="mt-1 text-sm text-red-400">
                                                {bidError}
                                            </p>
                                        )}
                                        {auction?.starting_price && (
                                            <p className="mt-1 text-xs text-gray-500">
                                                Minimum bid:{" "}
                                                {formatStrkAmount(
                                                    auction.starting_price
                                                )}{" "}
                                                STRK
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={handlePlaceBid}
                                        disabled={
                                            isPlacingBid ||
                                            !bidAmount ||
                                            !userAddress
                                        }
                                        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                                            isPlacingBid ||
                                            !bidAmount ||
                                            !userAddress
                                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                                : "bg-green-600 hover:bg-green-700 text-white"
                                        }`}
                                    >
                                        {isPlacingBid
                                            ? "Placing Bid..."
                                            : !userAddress
                                            ? "Connect Wallet to Bid"
                                            : "Place Bid"}
                                    </button>
                                    {!userAddress && (
                                        <div className="text-center">
                                            <CustomConnectButton />
                                        </div>
                                    )}
                                    </div>
                                </div>
                            )
                        ) : (
                            // Auction is not active - show message
                            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                                <h3 className="text-xl font-semibold text-white mb-4">
                                    Bidding Closed
                                </h3>
                                <p className="text-gray-400">
                                    {status === "ended"
                                        ? "This auction has ended. Bids can no longer be placed."
                                        : status === "finalized"
                                        ? "This auction has been finalized."
                                        : status === "cancelled"
                                        ? "This auction has been cancelled."
                                        : "This auction is not currently accepting bids."}
                                </p>
                            </div>
                        )}

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
                                            {formatStrkAmount(userBid.amount)}{" "}
                                            STRK
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">
                                            Status
                                        </span>
                                        <span
                                            className={`font-semibold ${
                                                userBid.revealed
                                                    ? "text-green-400"
                                                    : "text-yellow-400"
                                            }`}
                                        >
                                            {userBid.revealed
                                                ? "Revealed"
                                                : "Not Revealed"}
                                        </span>
                                    </div>
                                    {!userBid.revealed && (
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
