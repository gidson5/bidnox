"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import { StarknetConfig, starkscan } from "@starknet-react/core";

import { Header } from "~~/components/Header";
import { WalletGate } from "~~/components/WalletGate";
import { appChains, connectors } from "~~/services/web3/connectors";
import provider from "~~/services/web3/provider";

const Footer = dynamic(
    () => import("~~/components/Footer").then((mod) => mod.Footer),
    {
        ssr: false,
    }
);

const ScaffoldStarkApp = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <div className="min-h-screen flex flex-col bg-gray-900">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
            </div>
            <Toaster />
        </>
    );
};

export const ScaffoldStarkAppWithProviders = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <StarknetConfig
            chains={appChains}
            provider={provider}
            connectors={connectors}
            explorer={starkscan}
        >
            <ScaffoldStarkApp>
                <WalletGate>{children}</WalletGate>
            </ScaffoldStarkApp>
        </StarknetConfig>
    );
};
