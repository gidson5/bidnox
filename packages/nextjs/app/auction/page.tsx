"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CustomConnectButton } from "~~/components/scaffold-stark";
import { useAuctionList } from "~~/hooks/auction";
import {
    formatStrkAmount,
    getAuctionStatus,
    u256ToBigInt,
} from "~~/utils/auction";
import { AuctionTimer, AuctionStatusBadge } from "~~/components/auction";
import { useDeployedContractInfo } from "~~/hooks/scaffold-stark";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";

// Force dynamic rendering
export const dynamic = "force-dynamic";

type AuctionFilter = "all" | "active" | "ended";

export default function AuctionPage() {
    const [filter, setFilter] = useState<AuctionFilter>("all");
    const { auctions, isLoading } = useAuctionList(filter);
    const { data: deployedContract } =
        useDeployedContractInfo("AuctionPlatform");
    const { targetNetwork } = useTargetNetwork();

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Link href="/" className="flex items-center space-x-2">
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
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/auction/create"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Create Auction
                        </Link>
                        <CustomConnectButton />
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Bidnox Auctions
                    </h1>
                    <p className="text-gray-400">
                        Browse and bid on sealed-bid auctions
                    </p>
                </div>

                {/* Network Info */}
                {!deployedContract?.address && (
                    <div className="bg-blue-900/20 border-2 border-blue-500/50 rounded-lg p-4 mb-8">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">ℹ️</div>
                            <div className="flex-1">
                                <p className="text-blue-300 text-sm">
                                    <strong>Network:</strong>{" "}
                                    {targetNetwork.name} • Contract:
                                    AuctionPlatform
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg w-fit">
                    <button
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            filter === "all"
                                ? "bg-gray-700 text-white"
                                : "text-gray-400 hover:text-white"
                        }`}
                        onClick={() => setFilter("all")}
                    >
                        All Auctions
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            filter === "active"
                                ? "bg-gray-700 text-white"
                                : "text-gray-400 hover:text-white"
                        }`}
                        onClick={() => setFilter("active")}
                    >
                        Active
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            filter === "ended"
                                ? "bg-gray-700 text-white"
                                : "text-gray-400 hover:text-white"
                        }`}
                        onClick={() => setFilter("ended")}
                    >
                        Ended
                    </button>
                </div>

                {/* Auctions Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                ) : (
                    <>
                        {!auctions || auctions.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🎨</div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    No auctions found
                                </h2>
                                <p className="text-gray-400 mb-6">
                                    {filter === "all"
                                        ? "Be the first to create an auction!"
                                        : `No ${filter} auctions at the moment`}
                                </p>
                                <Link href="/auction/create">
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                                        Create First Auction
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {auctions
                                    .filter((auctionData) => {
                                        // Filter out any null/undefined auction data
                                        if (!auctionData) return false;
                                        const auction = auctionData as any;
                                        return (
                                            auction &&
                                            auction.auction_id !== undefined &&
                                            auction.auction_id !== null
                                        );
                                    })
                                    .map((auctionData, index) => {
                                        const auction = auctionData as any;

                                        const status = getAuctionStatus(
                                            auction.end_time,
                                            auction.finalized,
                                            auction.cancelled
                                        );

                                        const auctionId = u256ToBigInt(
                                            auction.auction_id
                                        ).toString();
                                        const assetId = u256ToBigInt(
                                            auction.asset_id
                                        ).toString();

                                        return (
                                            <div
                                                key={auctionId}
                                                className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                                            >
                                                <div className="p-6">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h2 className="text-xl font-semibold text-white">
                                                            Auction #{auctionId}
                                                        </h2>
                                                        <AuctionStatusBadge
                                                            status={status}
                                                        />
                                                    </div>

                                                    <div className="space-y-3 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-400">
                                                                Asset ID:
                                                            </span>
                                                            <span className="text-white font-medium">
                                                                {assetId}
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between">
                                                            <span className="text-gray-400">
                                                                Starting Price:
                                                            </span>
                                                            <span className="text-white font-medium">
                                                                {formatStrkAmount(
                                                                    auction.starting_price
                                                                )}{" "}
                                                                STRK
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-between">
                                                            <span className="text-gray-400">
                                                                Highest Bid:
                                                            </span>
                                                            <span className="text-orange-400 font-semibold">
                                                                {formatStrkAmount(
                                                                    auction.highest_bid
                                                                )}{" "}
                                                                STRK
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="border-t border-gray-700 my-4"></div>

                                                    <AuctionTimer
                                                        endTime={
                                                            new Date(
                                                                Number(
                                                                    auction.end_time
                                                                ) * 1000
                                                            )
                                                        }
                                                    />

                                                    <div className="mt-4">
                                                        <Link
                                                            href={`/auction/${auctionId}`}
                                                        >
                                                            <button className="w-full bg-transparent border border-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                                                                View Details →
                                                            </button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
