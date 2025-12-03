"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CustomConnectButton } from "~~/components/scaffold-stark/CustomConnectButton";
import { useAccount } from "~~/hooks/useAccount";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";

export const WalletGate = ({ children }: { children: ReactNode }) => {
  const { status, chainId } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const pathname = usePathname();

  const isConnected =
    status === "connected" && chainId === targetNetwork.id;
  const isConnecting = status === "connecting";
  const isLandingPage = pathname === "/";

  if (isConnected) {
    return <>{children}</>;
  }

  // Show children on landing page even if not connected (connect button is in header)
  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center gap-6 bg-base-200 px-6 py-12">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-3xl font-semibold">Connect your wallet</h1>
        <p className="text-base-content/70">
          Please connect your Starknet wallet to access Bidnox.
        </p>
      </div>
      {isConnecting ? (
        <span className="loading loading-spinner text-primary" />
      ) : (
        <CustomConnectButton />
      )}
    </div>
  );
};

