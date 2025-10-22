"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAccount } from "@starknet-react/core";
import { CustomConnectButton } from "~~/components/scaffold-stark";
import { useCreateAuction } from "~~/hooks/auction";
import { validateAuctionForm } from "~~/utils/auction";
import { useDeployedContractInfo } from "~~/hooks/scaffold-stark";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";
import { notification } from "~~/utils/scaffold-stark";

interface AuctionFormData {
    assetId: string;
    startingPrice: string;
    duration: string;
}

export default function CreateAuctionPage() {
    const [formData, setFormData] = useState<AuctionFormData>({
        assetId: "",
        startingPrice: "",
        duration: "",
    });
    const [errors, setErrors] = useState<Partial<AuctionFormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { address: connectedAddress, status } = useAccount();
    const { createAuction } = useCreateAuction();
    const { data: deployedContract } = useDeployedContractInfo({
        contractName: "AuctionPlatform",
    });
    const { targetNetwork } = useTargetNetwork();

    const handleInputChange = (field: keyof AuctionFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        console.log("\n" + "=".repeat(60));
        console.log("🚀 AUCTION CREATION FLOW STARTED");
        console.log("=".repeat(60));

        e.preventDefault();

        console.log("\n[STEP 1] Form Data Received:");
        console.log("  → Asset ID:", formData.assetId);
        console.log("  → Starting Price:", formData.startingPrice);
        console.log("  → Duration:", formData.duration);

        // Validate form
        console.log("\n[STEP 2] Running Form Validation...");
        const validationErrors = validateAuctionForm(formData);
        console.log("  → Validation errors:", validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            console.error("  ❌ Validation failed!");
            setErrors(validationErrors);
            return;
        }
        console.log("  ✅ Form validation passed");

        // Check if wallet is connected
        console.log("\n[STEP 3] Checking Wallet Connection:");
        console.log("  → Wallet status:", status);
        console.log("  → Connected address:", connectedAddress);

        if (status !== "connected" || !connectedAddress) {
            console.error("  ❌ Wallet not connected!");
            alert("Please connect your wallet first!");
            return;
        }
        console.log("  ✅ Wallet connected");

        setIsSubmitting(true);
        console.log("\n[STEP 4] Setting submitting state to TRUE");

        try {
            // Parse and validate inputs
            let assetIdBigInt: bigint;
            let startingPriceInWei: bigint;
            let durationNumber: number;

            console.log("\n[STEP 5] Parsing Asset ID...");
            try {
                assetIdBigInt = BigInt(formData.assetId);
                console.log("  ✅ Asset ID parsed:", assetIdBigInt.toString());
            } catch (e) {
                console.error("  ❌ Failed to parse Asset ID:", e);
                alert("Invalid Asset ID. Please enter a valid number.");
                setIsSubmitting(false);
                return;
            }

            console.log("\n[STEP 6] Parsing Starting Price...");
            if (!formData.startingPrice) {
                console.error("  ❌ Starting price is empty");
                alert("Please enter a starting price");
                setIsSubmitting(false);
                return;
            }

            const priceFloat = parseFloat(formData.startingPrice);
            console.log("  → Price as float:", priceFloat);

            if (isNaN(priceFloat) || priceFloat <= 0) {
                console.error("  ❌ Invalid price value");
                alert("Starting price must be a positive number");
                setIsSubmitting(false);
                return;
            }

            // Convert STRK to wei (multiply by 10^18)
            startingPriceInWei = BigInt(Math.floor(priceFloat * 10 ** 18));
            console.log(
                "  ✅ Price converted to wei:",
                startingPriceInWei.toString()
            );
            console.log(
                "     (",
                priceFloat,
                "STRK =",
                startingPriceInWei.toString(),
                "wei )"
            );

            console.log("\n[STEP 7] Parsing Duration...");
            try {
                durationNumber = Number(formData.duration);
                console.log("  → Duration as number:", durationNumber);

                if (isNaN(durationNumber) || durationNumber <= 0) {
                    throw new Error("Invalid duration value");
                }
                console.log("  ✅ Duration parsed:", durationNumber, "seconds");
            } catch (e) {
                console.error("  ❌ Failed to parse duration:", e);
                alert("Invalid duration. Please select a valid option.");
                setIsSubmitting(false);
                return;
            }

            console.log("\n[STEP 8] Prepared Transaction Parameters:");
            console.log("  → Asset ID (bigint):", assetIdBigInt.toString());
            console.log(
                "  → Starting Price (wei):",
                startingPriceInWei.toString()
            );
            console.log("  → Duration (seconds):", durationNumber);

            console.log("\n[STEP 9] Calling createAuction hook...");
            const result = await createAuction(
                assetIdBigInt,
                startingPriceInWei,
                durationNumber
            );

            console.log("\n[STEP 10] createAuction Result:");
            console.log("  → Success:", result.success);
            console.log("  → Full result:", result);

            if (result.success) {
                console.log("  ✅✅✅ AUCTION CREATED SUCCESSFULLY!");
                alert("✅ Auction created successfully!");

                // Reset form on success
                setFormData({
                    assetId: "",
                    startingPrice: "",
                    duration: "",
                });
                console.log("  → Form reset complete");
            } else {
                console.error("  ❌ Transaction failed");
                console.error("  → Error details:", result.error);
                alert("❌ Transaction failed. Please try again.");
            }
        } catch (error: any) {
            console.error("\n❌❌❌ EXCEPTION CAUGHT in handleSubmit:");
            console.error("  → Error type:", typeof error);
            console.error("  → Error:", error);
            console.error("  → Error message:", error?.message);
            console.error("  → Error stack:", error?.stack);
            alert("❌ Error creating auction. Check console for details.");
        } finally {
            setIsSubmitting(false);
            console.log("\n[FINAL] Setting submitting state to FALSE");
            console.log("=".repeat(60));
            console.log("🏁 AUCTION CREATION FLOW ENDED");
            console.log("=".repeat(60) + "\n");
        }
    };

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
                    <CustomConnectButton />
                </div>
            </header>

            <div className="container mx-auto px-6 py-8 max-w-2xl">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Create Auction
                    </h1>
                    <p className="text-gray-400">
                        Set up a new sealed-bid auction for your digital asset
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
                                    {targetNetwork.name} • Make sure your wallet
                                    is connected to Sepolia testnet
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Asset ID */}
                        <div>
                            <label
                                htmlFor="assetId"
                                className="block text-sm font-medium text-white mb-2"
                            >
                                Asset ID *
                            </label>
                            <input
                                type="number"
                                id="assetId"
                                min="0"
                                step="1"
                                value={formData.assetId}
                                onChange={(e) =>
                                    handleInputChange("assetId", e.target.value)
                                }
                                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.assetId
                                        ? "border-red-500"
                                        : "border-gray-600"
                                }`}
                                placeholder="123"
                            />
                            {errors.assetId && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.assetId}
                                </p>
                            )}
                        </div>

                        {/* Starting Price */}
                        <div>
                            <label
                                htmlFor="startingPrice"
                                className="block text-sm font-medium text-white mb-2"
                            >
                                Starting Price (STRK) *
                            </label>
                            <input
                                type="number"
                                id="startingPrice"
                                step="0.001"
                                min="0"
                                value={formData.startingPrice}
                                onChange={(e) =>
                                    handleInputChange(
                                        "startingPrice",
                                        e.target.value
                                    )
                                }
                                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.startingPrice
                                        ? "border-red-500"
                                        : "border-gray-600"
                                }`}
                                placeholder="0.001"
                            />
                            {errors.startingPrice && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.startingPrice}
                                </p>
                            )}
                        </div>

                        {/* Duration */}
                        <div>
                            <label
                                htmlFor="duration"
                                className="block text-sm font-medium text-white mb-2"
                            >
                                Duration (Hours) *
                            </label>
                            <select
                                id="duration"
                                value={formData.duration}
                                onChange={(e) =>
                                    handleInputChange(
                                        "duration",
                                        e.target.value
                                    )
                                }
                                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.duration
                                        ? "border-red-500"
                                        : "border-gray-600"
                                }`}
                            >
                                <option value="">Select duration</option>
                                <option value="1">1 Hour</option>
                                <option value="6">6 Hours</option>
                                <option value="12">12 Hours</option>
                                <option value="24">24 Hours</option>
                                <option value="72">3 Days</option>
                                <option value="168">1 Week</option>
                            </select>
                            {errors.duration && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.duration}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                                    isSubmitting
                                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                            >
                                {isSubmitting
                                    ? "Creating Auction..."
                                    : "Create Auction"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Text */}
                <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                        How it works:
                    </h3>
                    <ul className="space-y-2 text-gray-400">
                        <li>• Set your asset ID and minimum starting price</li>
                        <li>• Choose how long the auction should run</li>
                        <li>
                            • Bidders will place sealed bids during the auction
                            period
                        </li>
                        <li>
                            • After the auction ends, bidders reveal their bids
                        </li>
                        <li>
                            • The highest bidder wins and receives the asset
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
