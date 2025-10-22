"use client";

import { Address } from "@starknet-react/chains";
import useScaffoldStrkBalance from "~~/hooks/scaffold-stark/useScaffoldStrkBalance";

type BalanceProps = {
    address?: Address;
    className?: string;
};

/**
 * Display STRK balance of an address.
 */
export const Balance = ({ address, className = "" }: BalanceProps) => {
    const {
        formatted: strkFormatted,
        isLoading: strkIsLoading,
        isError: strkIsError,
        symbol: strkSymbol,
    } = useScaffoldStrkBalance({
        address,
    });

    if (!address || strkIsLoading || strkFormatted === null) {
        return (
            <div className="animate-pulse flex space-x-4">
                <div className="rounded-md bg-slate-300 h-6 w-6"></div>
                <div className="flex items-center space-y-6">
                    <div className="h-2 w-28 bg-slate-300 rounded-sm"></div>
                </div>
            </div>
        );
    }

    if (strkIsError) {
        return (
            <div
                className={`border-2 border-gray-400 rounded-md px-2 flex flex-col items-center max-w-fit cursor-pointer`}
            >
                <div className="text-warning">Error</div>
            </div>
        );
    }

    return (
        <div
            className={`btn btn-sm btn-ghost flex font-normal items-center hover:bg-transparent ${className}`}
        >
            <div className="w-full flex items-center justify-center">
                <span>{parseFloat(strkFormatted).toFixed(4)}</span>
                <span className="text-[0.8em] font-bold ml-1">
                    {strkSymbol}
                </span>
            </div>
        </div>
    );
};
