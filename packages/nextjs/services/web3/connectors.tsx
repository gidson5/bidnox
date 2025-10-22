import { braavos, InjectedConnector, ready } from "@starknet-react/core";
import { getTargetNetworks } from "~~/utils/scaffold-stark";
import scaffoldConfig from "~~/scaffold.config";
import { LAST_CONNECTED_TIME_LOCALSTORAGE_KEY } from "~~/utils/Constants";
import { KeplrConnector } from "./keplr";

const targetNetworks = getTargetNetworks();

export const connectors = getConnectors();

// workaround helper function to properly disconnect with removing local storage (prevent autoconnect infinite loop)
function withDisconnectWrapper(connector: InjectedConnector) {
    const connectorDisconnect = connector.disconnect;
    const _disconnect = (): Promise<void> => {
        localStorage.removeItem("lastUsedConnector");
        localStorage.removeItem(LAST_CONNECTED_TIME_LOCALSTORAGE_KEY);
        return connectorDisconnect();
    };
    connector.disconnect = _disconnect.bind(connector);
    return connector;
}

function getConnectors() {
    const { targetNetworks } = scaffoldConfig;

    // Only include Argent X, Braavos, and Keplr connectors for production
    const connectors: InjectedConnector[] = [ready(), braavos()];
    const isDevnet = targetNetworks.some(
        (network) => (network.network as string) === "devnet"
    );

    if (!isDevnet) {
        connectors.push(new KeplrConnector());
    }

    return connectors
        .sort(() => Math.random() - 0.5)
        .map(withDisconnectWrapper);
}

export const appChains = targetNetworks;
