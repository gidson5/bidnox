"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CustomConnectButton } from "~~/components/scaffold-stark";
import { useCreateAuction } from "~~/hooks/auction";
import { validateAuctionForm } from "~~/utils/auction";

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

    const { createAuction } = useCreateAuction();

    const handleInputChange = (field: keyof AuctionFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        const validationErrors = validateAuctionForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await createAuction(
                BigInt(formData.assetId),
                BigInt(formData.startingPrice),
                Number(formData.duration)
            );

            // Reset form on success
            setFormData({
                assetId: "",
                startingPrice: "",
                duration: "",
            });

            // You could redirect or show success message here
        } catch (error) {
            console.error("Failed to create auction:", error);
        } finally {
            setIsSubmitting(false);
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
                                type="text"
                                id="assetId"
                                value={formData.assetId}
                                onChange={(e) =>
                                    handleInputChange("assetId", e.target.value)
                                }
                                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.assetId
                                        ? "border-red-500"
                                        : "border-gray-600"
                                }`}
                                placeholder="Enter the asset identifier (e.g., NFT token ID)"
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
