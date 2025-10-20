"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { CustomConnectButton } from "~~/components/scaffold-stark";
import { useAuctionDetails } from "~~/hooks/auction";
import { AuctionTimer, AuctionStatusBadge } from "~~/components/auction";
import {
    formatStrkAmount,
    getAuctionStatus,
    shortenAddress,
} from "~~/utils/auction";

export default function AuctionDetailPage() {
    const params = useParams();
    const auctionIdString = params.id as string;
    const auctionId = BigInt(auctionIdString);
    const [bidAmount, setBidAmount] = useState("");
    const [isPlacingBid, setIsPlacingBid] = useState(false);

    const {
        auction: auctionData,
        userBid: userBidData,
        isLoading,
    } = useAuctionDetails(auctionId);

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
                {/* Header */}
                <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Link
                                href="/"
                                className="flex items-center space-x-2"
                            >
                                <div className="relative w-8 h-8">
                                    <Image
                                        src="/logo-app.png"
                                        alt="Bidnox Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-white text-xl font-semibold">
                                    Bidnox
                                </span>
                            </Link>
                        </div>
                        <CustomConnectButton />
                    </div>
                </header>

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

    const status = getAuctionStatus(
        auction.end_time,
        auction.finalized,
        auction.cancelled
    );
    const isActive = status === "active";
    const canBid = isActive && !userBid;

    const handlePlaceBid = async () => {
        if (!bidAmount || parseFloat(bidAmount) <= 0) return;

        setIsPlacingBid(true);
        try {
            // TODO: Implement bid placement logic
            console.log("Placing bid:", bidAmount);
        } catch (error) {
            console.error("Failed to place bid:", error);
        } finally {
            setIsPlacingBid(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-red-500 rounded-sm flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    /
                                </span>
                            </div>
                            <span className="text-white text-xl font-semibold">
                                Bidnox
                            </span>
                        </Link>
                    </div>
                    <CustomConnectButton />
                </div>
            </header>

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
                                    Auction #{auction.auction_id.toString()}
                                </h1>
                                <AuctionStatusBadge status={status} />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-400 text-sm">
                                        Asset ID
                                    </label>
                                    <p className="text-white font-mono text-lg">
                                        {auction.asset_id.toString()}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-sm">
                                        Seller
                                    </label>
                                    <p className="text-white font-mono">
                                        {shortenAddress(auction.seller)}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-sm">
                                        Starting Price
                                    </label>
                                    <p className="text-white text-xl font-semibold">
                                        {formatStrkAmount(
                                            auction.starting_price
                                        )}{" "}
                                        STRK
                                    </p>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-sm">
                                        Current Highest Bid
                                    </label>
                                    <p className="text-orange-400 text-2xl font-bold">
                                        {formatStrkAmount(auction.highest_bid)}{" "}
                                        STRK
                                    </p>
                                </div>

                                <div className="border-t border-gray-700 pt-4">
                                    <AuctionTimer endTime={auction.end_time} />
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
                                        {auction.bid_count.toString()}
                                    </span>
                                </div>
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
                        {canBid && (
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
                                            onChange={(e) =>
                                                setBidAmount(e.target.value)
                                            }
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.001"
                                        />
                                    </div>
                                    <button
                                        onClick={handlePlaceBid}
                                        disabled={isPlacingBid || !bidAmount}
                                        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                                            isPlacingBid || !bidAmount
                                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                                : "bg-green-600 hover:bg-green-700 text-white"
                                        }`}
                                    >
                                        {isPlacingBid
                                            ? "Placing Bid..."
                                            : "Place Bid"}
                                    </button>
                                </div>
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
                            {status === "ended" && !auction.finalized && (
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
