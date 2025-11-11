import scaffoldConfig from "~~/scaffold.config";
import {
  jsonRpcProvider,
  publicProvider,
  starknetChainId,
} from "@starknet-react/core";
import * as chains from "@starknet-react/chains";

const containsDevnet = (networks: readonly chains.Chain[]) => {
  return (
    networks.filter((it) => it.network == chains.devnet.network).length > 0
  );
};

// Get the current target network (first one in the array)
const currentNetwork = scaffoldConfig.targetNetworks[0];
const currentNetworkName = currentNetwork.network;

const fallbackRpcMap: Record<string, string> = {
  devnet: "http://127.0.0.1:5050/rpc",
  sepolia: "https://starknet-sepolia.public.blastapi.io/rpc/v0_9",
  mainnet: "https://starknet-mainnet.public.blastapi.io/rpc/v0_9",
};

const normalizeRpcUrl = (url: string | undefined, network: chains.Chain) => {
  if (!url) return "";

  const trimmed = url.trim();
  if (trimmed === "") return "";

  if (trimmed.includes("/rpc/v0_9")) {
    return trimmed;
  }

  if (/\/v[0-9]+\/[a-z0-9_-]+/i.test(trimmed) && !trimmed.endsWith("/")) {
    return trimmed;
  }

  if (trimmed.includes("/rpc/v0_8") || trimmed.includes("/rpc/v0_7")) {
    return trimmed.replace(/\/rpc\/v0_[0-9]+$/, "/rpc/v0_9");
  }

  if (trimmed.endsWith("/rpc") || trimmed.endsWith("/rpc/")) {
    return `${trimmed.replace(/\/$/, "")}/v0_9`;
  }

  if (trimmed.endsWith("/")) {
    return `${trimmed}rpc/v0_9`;
  }

  if (trimmed.includes("infura.io")) {
    return trimmed;
  }

  if (trimmed.includes("http")) {
    return `${trimmed}/rpc/v0_9`;
  }

  console.warn(
    `[provider] Unexpected RPC URL format "${trimmed}" for ${network.network}; falling back.`,
  );
  return "";
};

export const getRpcUrl = (network: chains.Chain): string => {
  const envRpcMap: Record<string, string | undefined> = {
    devnet: process.env.NEXT_PUBLIC_DEVNET_PROVIDER_URL,
    sepolia: process.env.NEXT_PUBLIC_SEPOLIA_PROVIDER_URL,
    mainnet: process.env.NEXT_PUBLIC_MAINNET_PROVIDER_URL,
  };

  const envRpcUrl = normalizeRpcUrl(envRpcMap[network.network], network);
  if (envRpcUrl) {
    return envRpcUrl;
  }

  const fromChainConfig = normalizeRpcUrl(
    network.rpcUrls?.default?.http?.[0] ?? network.rpcUrls?.public?.http?.[0],
    network,
  );

  if (fromChainConfig) {
    return fromChainConfig;
  }

  return normalizeRpcUrl(fallbackRpcMap[network.network], network);
};

// Get RPC URL for the current network
const rpcUrl = getRpcUrl(currentNetwork);

// Important: if the rpcUrl is empty (not configed in .env), we use the publicProvider
// which randomly choose a provider from the chain list of public providers.
// Some public provider might have strict rate limits.
if (rpcUrl === "") {
  console.warn(
    `No RPC Provider URL configured for ${currentNetworkName}. Using public provider.`,
  );
}

if (typeof window !== "undefined") {
  console.debug("[provider] Using Starknet RPC:", rpcUrl || "public provider");
}

const browserRpcUrl =
  typeof window === "undefined" || !rpcUrl.startsWith("http")
    ? rpcUrl
    : "/api/starknet-rpc";

const provider =
  browserRpcUrl === "" || containsDevnet(scaffoldConfig.targetNetworks)
    ? publicProvider()
    : jsonRpcProvider({
        rpc: () => ({
          nodeUrl: browserRpcUrl,
          chainId: starknetChainId(currentNetwork.id),
        }),
      });

export default provider;
