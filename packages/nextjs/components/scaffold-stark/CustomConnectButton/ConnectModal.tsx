import { Connector, useConnect } from "@starknet-react/core";
import { useRef } from "react";
import { useLocalStorage } from "usehooks-ts";
import GenericModal from "./GenericModal";
import Wallet from "~~/components/scaffold-stark/CustomConnectButton/Wallet";
import { LAST_CONNECTED_TIME_LOCALSTORAGE_KEY } from "~~/utils/Constants";

const loader = ({ src }: { src: string }) => src;

const ConnectModal = () => {
    const modalRef = useRef<HTMLInputElement>(null);
    const { connectors, connect } = useConnect();
    const [, setLastConnector] = useLocalStorage<{ id: string }>(
        "lastUsedConnector",
        { id: "" }
    );
    const [, setLastConnectionTime] = useLocalStorage<number>(
        LAST_CONNECTED_TIME_LOCALSTORAGE_KEY,
        0
    );
    const [, setWasDisconnectedManually] = useLocalStorage<boolean>(
        "wasDisconnectedManually",
        false
    );

    const handleCloseModal = () => {
        if (modalRef.current) modalRef.current.checked = false;
    };

    function handleConnectWallet(
        e: React.MouseEvent<HTMLButtonElement>,
        connector: Connector
    ) {
        setWasDisconnectedManually(false);
        connect({ connector });
        setLastConnector({ id: connector.id });
        setLastConnectionTime(Date.now());
        handleCloseModal();
    }

    return (
        <div>
            <label
                htmlFor="connect-modal"
                className="btn btn-primary normal-case"
            >
                Connect Wallet
            </label>
            <input
                ref={modalRef}
                type="checkbox"
                id="connect-modal"
                className="modal-toggle"
            />
            <GenericModal modalId="connect-modal">
                <>
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">Connect a Wallet</h3>
                        <label
                            htmlFor="connect-modal"
                            className="btn btn-ghost btn-sm btn-circle cursor-pointer"
                        >
                            ✕
                        </label>
                    </div>
                    <div className="flex flex-col flex-1 lg:grid">
                        <div className="flex flex-col gap-4 w-full px-8 py-10">
                            {connectors.map((connector, index) => (
                                <Wallet
                                    key={connector.id || index}
                                    connector={connector}
                                    loader={loader}
                                    handleConnectWallet={handleConnectWallet}
                                />
                            ))}
                        </div>
                    </div>
                </>
            </GenericModal>
        </div>
    );
};

export default ConnectModal;
