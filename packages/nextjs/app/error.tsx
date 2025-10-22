"use client";

import Link from "next/link";
import Image from "next/image";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
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
                <h1 className="text-6xl font-bold text-white mb-4">Oops!</h1>
                <h2 className="text-2xl font-semibold text-white mb-4">
                    Something went wrong
                </h2>
                <p className="text-gray-400 mb-8">
                    An unexpected error occurred. Please try again.
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
