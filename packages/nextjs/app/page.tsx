"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
    SparklesIcon,
    ShieldCheckIcon,
    ClockIcon,
    CurrencyDollarIcon,
    LockClosedIcon,
    RocketLaunchIcon,
    BoltIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);

    useEffect(() => {
        setMounted(true);
        // Rotate active feature for subtle animation
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 6);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gray-900 min-h-screen flex items-center border-b border-gray-800">
                {/* Animated grid background */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)",
                            backgroundSize: "50px 50px",
                            animation: "grid-move 20s linear infinite",
                        }}
                    ></div>
                </div>

                {/* Floating elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-64 h-64 border border-blue-500/20 rounded-lg animate-float"></div>
                    <div className="absolute bottom-20 right-10 w-48 h-48 border border-orange-500/20 rounded-lg animate-float-delay"></div>
                    <div className="absolute top-1/2 left-1/4 w-32 h-32 border border-blue-400/10 rounded-lg animate-spin-slow"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        {/* Logo with pulse effect */}
                        <div
                            className={`flex justify-center mb-8 transition-all duration-1000 ${
                                mounted
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 -translate-y-10"
                            }`}
                        >
                            <div className="relative w-32 h-32 animate-pulse-slow">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                                <Image
                                    src="/logo-app.png"
                                    alt="BidNox Logo"
                                    fill
                                    className="object-contain drop-shadow-2xl relative z-10"
                                />
                            </div>
                        </div>

                        {/* Headline */}
                        <h1
                            className={`text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 transition-all duration-1000 delay-200 ${
                                mounted
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-10"
                            }`}
                        >
                            Welcome to{" "}
                            <span className="relative inline-block">
                                <span className="text-blue-500 animate-pulse-slow">
                                    BidNox
                                </span>
                                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-orange-500 rounded-full"></div>
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p
                            className={`text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto transition-all duration-1000 delay-400 ${
                                mounted
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-10"
                            }`}
                        >
                            The Future of{" "}
                            <span className="text-blue-400 font-semibold">
                                Decentralized
                            </span>{" "}
                            Sealed-Bid Auctions on Starknet
                        </p>

                        <p
                            className={`text-lg text-gray-400 mb-12 max-w-2xl mx-auto transition-all duration-1000 delay-600 ${
                                mounted
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-10"
                            }`}
                        >
                            Create, participate, and win in transparent, secure,
                            and trustless auctions powered by blockchain
                            technology. Experience the next generation of
                            digital asset trading.
                        </p>

                        {/* CTA Buttons */}
                        <div
                            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-800 ${
                                mounted
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-10"
                            }`}
                        >
                            <Link href="/auction">
                                <button className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg shadow-blue-500/50 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/70 transition-all duration-300">
                                    <span className="relative z-10 flex items-center gap-2 justify-center">
                                        <RocketLaunchIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                        Launch App
                                    </span>
                                    <div className="absolute inset-0 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                                </button>
                            </Link>
                            <a href="#features">
                                <button className="border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 px-8 py-4 rounded-lg font-semibold transform hover:scale-105 transition-all duration-300">
                                    Learn More
                                </button>
                            </a>
                        </div>

                        {/* Stats with animated counters */}
                        <div
                            className={`mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto transition-all duration-1000 delay-1000 ${
                                mounted
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-10"
                            }`}
                        >
                            <div className="text-center group cursor-pointer">
                                <div className="text-4xl font-bold text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                                    100%
                                </div>
                                <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Decentralized
                                </div>
                            </div>
                            <div className="text-center group cursor-pointer">
                                <div className="text-4xl font-bold text-orange-400 mb-2 group-hover:scale-110 transition-transform">
                                    <LockClosedIcon className="w-12 h-12 inline" />
                                </div>
                                <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Sealed Bid Privacy
                                </div>
                            </div>
                            <div className="text-center group cursor-pointer">
                                <div className="text-4xl font-bold text-green-400 mb-2 group-hover:scale-110 transition-transform">
                                    0 Fees
                                </div>
                                <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Platform Charges
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <a
                        href="#features"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                        </svg>
                    </a>
                </div>

                <style jsx>{`
                    @keyframes grid-move {
                        0% {
                            transform: translateY(0);
                        }
                        100% {
                            transform: translateY(50px);
                        }
                    }
                    @keyframes float {
                        0%,
                        100% {
                            transform: translateY(0px);
                        }
                        50% {
                            transform: translateY(-20px);
                        }
                    }
                    @keyframes float-delay {
                        0%,
                        100% {
                            transform: translateY(0px);
                        }
                        50% {
                            transform: translateY(-30px);
                        }
                    }
                    .animate-float {
                        animation: float 6s ease-in-out infinite;
                    }
                    .animate-float-delay {
                        animation: float-delay 8s ease-in-out infinite;
                    }
                    .animate-spin-slow {
                        animation: spin 20s linear infinite;
                    }
                    .animate-pulse-slow {
                        animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1)
                            infinite;
                    }
                `}</style>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Why Choose BidNox?
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Experience the most advanced sealed-bid auction
                            platform built on Starknet
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div
                            className={`bg-gray-900 border-2 border-gray-700 rounded-lg p-8 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-500/20 ${
                                activeFeature === 0 ? "border-blue-500" : ""
                            }`}
                        >
                            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                                <LockClosedIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Sealed-Bid Privacy
                            </h3>
                            <p className="text-gray-400">
                                Your bids remain completely private until the
                                reveal phase, ensuring fair competition and
                                preventing bid sniping.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div
                            className={`bg-gray-900 border-2 border-gray-700 rounded-lg p-8 hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg hover:shadow-orange-500/20 ${
                                activeFeature === 1 ? "border-orange-500" : ""
                            }`}
                        >
                            <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                                <ShieldCheckIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Blockchain Security
                            </h3>
                            <p className="text-gray-400">
                                Built on Starknet for maximum security,
                                transparency, and trustless execution of all
                                auction operations.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div
                            className={`bg-gray-900 border-2 border-gray-700 rounded-lg p-8 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-500/20 ${
                                activeFeature === 2 ? "border-blue-500" : ""
                            }`}
                        >
                            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                                <ClockIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Time-Based Phases
                            </h3>
                            <p className="text-gray-400">
                                Structured auction phases with bidding, reveal,
                                and finalization stages for organized and fair
                                outcomes.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div
                            className={`bg-gray-900 border-2 border-gray-700 rounded-lg p-8 hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg hover:shadow-orange-500/20 ${
                                activeFeature === 3 ? "border-orange-500" : ""
                            }`}
                        >
                            <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                                <SparklesIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Any Digital Asset
                            </h3>
                            <p className="text-gray-400">
                                Auction NFTs, gaming items, domain names, and
                                any digital assets with full flexibility and
                                control.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div
                            className={`bg-gray-900 border-2 border-gray-700 rounded-lg p-8 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-500/20 ${
                                activeFeature === 4 ? "border-blue-500" : ""
                            }`}
                        >
                            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                                <CurrencyDollarIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Zero Platform Fees
                            </h3>
                            <p className="text-gray-400">
                                No hidden charges or platform fees. Only pay
                                minimal gas fees for blockchain transactions.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div
                            className={`bg-gray-900 border-2 border-gray-700 rounded-lg p-8 hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg hover:shadow-orange-500/20 ${
                                activeFeature === 5 ? "border-orange-500" : ""
                            }`}
                        >
                            <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                                <BoltIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Easy to Use
                            </h3>
                            <p className="text-gray-400">
                                Intuitive interface makes creating and
                                participating in auctions simple for everyone.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            How BidNox Works
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Three simple phases for fair and transparent
                            auctions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="relative">
                            <div className="bg-gray-800 border-2 border-blue-500 rounded-lg p-8 hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                                <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4 animate-pulse">
                                    1
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Bidding Phase
                                </h3>
                                <p className="text-gray-400">
                                    Place your sealed bid with a commitment
                                    hash. Your bid amount remains completely
                                    private and secure on the blockchain.
                                </p>
                            </div>
                            {/* Arrow for desktop */}
                            <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-4xl text-blue-500">
                                →
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative">
                            <div className="bg-gray-800 border-2 border-orange-500 rounded-lg p-8 hover:shadow-lg hover:shadow-orange-500/30 transition-all">
                                <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4 animate-pulse">
                                    2
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Reveal Phase
                                </h3>
                                <p className="text-gray-400">
                                    After bidding closes, reveal your actual bid
                                    amount. The smart contract verifies it
                                    matches your commitment.
                                </p>
                            </div>
                            {/* Arrow for desktop */}
                            <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-4xl text-orange-500">
                                →
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-gray-800 border-2 border-green-500 rounded-lg p-8 hover:shadow-lg hover:shadow-green-500/30 transition-all">
                            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4 animate-pulse">
                                3
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Finalization
                            </h3>
                            <p className="text-gray-400">
                                The highest bidder wins! The smart contract
                                automatically transfers the asset and funds
                                securely.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gray-800 border-t border-gray-700">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                        Ready to Start Bidding?
                    </h2>
                    <p className="text-xl text-gray-400 mb-12">
                        Join BidNox today and experience the future of
                        decentralized auctions
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auction">
                            <button className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg shadow-blue-500/50 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/70 transition-all duration-300">
                                <span className="relative z-10 flex items-center gap-2 justify-center">
                                    <RocketLaunchIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                    Launch App Now
                                </span>
                            </button>
                        </Link>
                        <Link href="/auction/create">
                            <button className="border-2 border-orange-500 text-orange-400 hover:bg-orange-500/10 px-8 py-4 rounded-lg font-semibold transform hover:scale-105 transition-all duration-300">
                                Create Your First Auction
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/logo-app.png"
                                    alt="BidNox Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold text-white">
                                BidNox
                            </span>
                        </div>
                        <div className="text-gray-400 text-center md:text-right">
                            <p>
                                Built on Starknet • Powered by Blockchain
                                Technology
                            </p>
                            <p className="text-sm mt-2">
                                © 2025 BidNox. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
