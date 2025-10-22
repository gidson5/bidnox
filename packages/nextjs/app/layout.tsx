import type { Metadata } from "next";
import { ScaffoldStarkAppWithProviders } from "~~/components/ScaffoldStarkAppWithProviders";
import "~~/styles/globals.css";
import { ThemeProvider } from "~~/components/ThemeProvider";

// Force dynamic rendering for the entire app
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Bidnox - Decentralized Auction Platform",
    description: "Create and participate in sealed-bid auctions on Starknet",
    icons: "/logo-app.png",
};

const ScaffoldStarkApp = ({ children }: { children: React.ReactNode }) => {
    return (
        <html suppressHydrationWarning>
            <body suppressHydrationWarning>
                <ThemeProvider enableSystem>
                    <ScaffoldStarkAppWithProviders>
                        {children}
                    </ScaffoldStarkAppWithProviders>
                </ThemeProvider>
            </body>
        </html>
    );
};

export default ScaffoldStarkApp;
