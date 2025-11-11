"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Bars3Icon,
    SparklesIcon,
    PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-stark";
import { CustomConnectButton } from "~~/components/scaffold-stark/CustomConnectButton";
import { useTheme } from "next-themes";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";
import { devnet } from "@starknet-react/chains";
import { SwitchTheme } from "./SwitchTheme";
import { useAccount, useNetwork, useProvider } from "@starknet-react/core";
import { BlockIdentifier } from "starknet";

type HeaderMenuLink = {
    label: string;
    href: string;
    icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
    {
        label: "Home",
        href: "/",
    },
    {
        label: "Auctions",
        href: "/auction",
        icon: <SparklesIcon className="h-4 w-4" />,
    },
    {
        label: "Create Auction",
        href: "/auction/create",
        icon: <PlusCircleIcon className="h-4 w-4" />,
    },
];

export const HeaderMenuLinks = () => {
    const pathname = usePathname();
    const { theme } = useTheme();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(theme === "dark");
    }, [theme]);

    return (
        <>
            {menuLinks.map(({ label, href, icon }) => {
                const isActive = pathname === href;
                return (
                    <li key={href}>
                        <Link
                            href={href}
                            className={`${
                                isActive
                                    ? "bg-primary text-primary-content"
                                    : "hover:bg-base-200"
                            } flex items-center gap-2 px-3 py-2 rounded-lg transition-colors`}
                        >
                            {icon}
                            <span className="text-sm font-medium">{label}</span>
                        </Link>
                    </li>
                );
            })}
        </>
    );
};

/**
 * Site header
 */
export const Header = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const burgerMenuRef = useRef<HTMLDivElement>(null);

    useOutsideClick(
        burgerMenuRef,
        useCallback(() => setIsDrawerOpen(false), [])
    );

    const { targetNetwork } = useTargetNetwork();
    const isLocalNetwork = targetNetwork.network === devnet.network;

    const { provider } = useProvider();
    const { address, status, chainId } = useAccount();
    const { chain } = useNetwork();
    const [isDeployed, setIsDeployed] = useState(true);
    const { resolvedTheme } = useTheme();
    const isDarkMode = resolvedTheme === "dark";

    const navbarClasses = isDarkMode
        ? "bg-gray-900/90 border-gray-800/80 text-gray-100"
        : "bg-base-200/90 border-base-300/80 text-base-content";

    useEffect(() => {
        if (
            status === "connected" &&
            address &&
            chainId === targetNetwork.id &&
            chain.network === targetNetwork.network
        ) {
            provider
                .getClassHashAt(address)
                .then((classHash) => {
                    if (classHash) setIsDeployed(true);
                    else setIsDeployed(false);
                })
                .catch((e) => {
                    console.error("contract check", e);
                    if (e.toString().includes("Contract not found")) {
                        setIsDeployed(false);
                    }
                });
        }
    }, [
        status,
        address,
        provider,
        chainId,
        targetNetwork.id,
        targetNetwork.network,
        chain.network,
    ]);

    return (
        <div
            className={`navbar sticky top-0 z-50 border-b backdrop-blur ${navbarClasses}`}
        >
            <div className="navbar-start">
                {/* Mobile menu button */}
                <div className="dropdown lg:hidden" ref={burgerMenuRef}>
                    <label
                        tabIndex={0}
                        className="btn btn-ghost btn-square"
                        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </label>
                    {isDrawerOpen && (
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                            onClick={() => setIsDrawerOpen(false)}
                        >
                            <HeaderMenuLinks />
                        </ul>
                    )}
                </div>

                {/* Logo - visible on all screen sizes */}
                <Link href="/" className="btn btn-ghost normal-case text-xl">
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                            <Image
                                alt="Bidnox logo"
                                className="cursor-pointer"
                                fill
                                src="/logo-app.png"
                            />
                        </div>
                        <span className="hidden sm:block font-bold">
                            Bidnox
                        </span>
                    </div>
                </Link>

                {/* Desktop menu */}
                <ul className="hidden lg:flex menu menu-horizontal px-1 gap-1">
                    <HeaderMenuLinks />
                </ul>
            </div>

            <div className="navbar-end gap-2">
                {status === "connected" && !isDeployed && (
                    <span className="badge badge-warning badge-sm">
                        Wallet Not Deployed
                    </span>
                )}
                <CustomConnectButton />
                <SwitchTheme className="btn btn-ghost btn-square" />
            </div>
        </div>
    );
};
