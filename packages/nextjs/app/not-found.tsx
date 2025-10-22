"use client";

import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-6">
                    <Image
                        src="/logo-app.png"
                        alt="Bidnox Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-white mb-4">
                    Page Not Found
                </h2>
                <p className="text-gray-400 mb-8">
                    The page you&apos;re looking for doesn&apos;t exist.
                </p>
                <Link
                    href="/"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
