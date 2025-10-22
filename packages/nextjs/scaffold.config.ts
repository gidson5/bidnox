import { Chain } from "@starknet-react/chains";
import { supportedChains as chains } from "./supportedChains";

export type ScaffoldConfig = {
    targetNetworks: readonly Chain[];
    pollingInterval: number;
    walletAutoConnect: boolean;
    autoConnectTTL: number;
};

const scaffoldConfig = {
    targetNetworks: [chains.sepolia],
    // The interval at which your front-end polls the RPC servers for new data
    pollingInterval: 30_000,
    /**
     * Auto connect:
     * If the user was connected into a wallet before, on page reload reconnect automatically
     */
    autoConnectTTL: 60000,
    walletAutoConnect: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
