import { useRef, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import CopyToClipboard from "react-copy-to-clipboard";
import {
    ArrowLeftEndOnRectangleIcon,
    ArrowTopRightOnSquareIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    DocumentDuplicateIcon,
    QrCodeIcon,
} from "@heroicons/react/24/outline";
import { useLocalStorage } from "usehooks-ts";
import { BlockieAvatar, isENS } from "~~/components/scaffold-stark";
import { useOutsideClick } from "~~/hooks/scaffold-stark";
import { getTargetNetworks, notification } from "~~/utils/scaffold-stark";
import { Address } from "@starknet-react/chains";
import { useDisconnect, useNetwork } from "@starknet-react/core";
import { getStarknetPFPIfExists } from "~~/utils/profile";
import { useScaffoldStarkProfile } from "~~/hooks/scaffold-stark/useScaffoldStarkProfile";
import { default as NextImage } from "next/image";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
    address: Address;
    blockExplorerAddressLink: string | undefined;
    displayName: string;
    ensAvatar?: string;
};

export const AddressInfoDropdown = ({
    address,
    ensAvatar,
    displayName,
    blockExplorerAddressLink,
}: AddressInfoDropdownProps) => {
    const { disconnect } = useDisconnect();
    const [addressCopied, setAddressCopied] = useState(false);
    const { data: profile } = useScaffoldStarkProfile(address);
    const { chain } = useNetwork();
    const [selectingNetwork, setSelectingNetwork] = useState(false);
    const dropdownRef = useRef<HTMLDetailsElement>(null);
    const closeDropdown = () => {
        setSelectingNetwork(false);
        dropdownRef.current?.removeAttribute("open");
    };

    useOutsideClick(dropdownRef, closeDropdown);

    const [, setWasDisconnectedManually] = useLocalStorage<boolean>(
        "wasDisconnectedManually",
        false,
        {
            initializeWithValue: false,
        }
    );

    const handleDisconnect = () => {
        try {
            disconnect();
            localStorage.removeItem("lastUsedConnector");
            localStorage.removeItem("lastConnectionTime");
            setWasDisconnectedManually(true);
            window.dispatchEvent(new Event("manualDisconnect"));
            notification.success("Disconnect successfully!");
        } catch (err) {
            console.log(err);
            notification.success("Disconnect failure!");
        }
    };
    return (
        <>
            <details
                ref={dropdownRef}
                className="dropdown dropdown-end leading-3"
            >
                <summary className="btn bg-transparent btn-sm px-2 py-[0.35rem] dropdown-toggle gap-0 !h-auto border border-[#5c4fe5] ">
                    <div className="hidden [@media(min-width:412px)]:block">
                        {getStarknetPFPIfExists(profile?.profilePicture) ? (
                            <NextImage
                                src={profile?.profilePicture || ""}
                                alt="Profile Picture"
                                className="rounded-full"
                                width={30}
                                height={30}
                            />
                        ) : (
                            <BlockieAvatar
                                address={address}
                                size={28}
                                ensImage={ensAvatar}
                            />
                        )}
                    </div>
                    <span className="ml-2 mr-2 text-sm">
                        {isENS(displayName)
                            ? displayName
                            : profile?.name ||
                              address?.slice(0, 6) + "..." + address?.slice(-4)}
                    </span>
                    <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0 sm:block hidden" />
                </summary>
                <ul
                    tabIndex={0}
                    className={`dropdown-content menu z-[2] p-2 mt-2 rounded-[5px] gap-1 border border-[#5c4fe5] bg-base-100`}
                >
                    <NetworkOptions hidden={!selectingNetwork} />
                    <li className={selectingNetwork ? "hidden" : ""}>
                        {addressCopied ? (
                            <div className="btn-sm !rounded-xl flex gap-3">
                                <CheckCircleIcon
                                    className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                                    aria-hidden="true"
                                />
                                <span className=" whitespace-nowrap">
                                    Copy address
                                </span>
                            </div>
                        ) : (
                            //@ts-ignore
                            <CopyToClipboard
                                text={address}
                                onCopy={() => {
                                    setAddressCopied(true);
                                    setTimeout(() => {
                                        setAddressCopied(false);
                                    }, 800);
                                }}
                            >
                                <div className="btn-sm !rounded-xl flex gap-3">
                                    <DocumentDuplicateIcon
                                        className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                                        aria-hidden="true"
                                    />
                                    <span className=" whitespace-nowrap">
                                        Copy address
                                    </span>
                                </div>
                            </CopyToClipboard>
                        )}
                    </li>
                    <li className={selectingNetwork ? "hidden" : ""}>
                        <label
                            htmlFor="qrcode-modal"
                            className="btn-sm !rounded-xl flex gap-3"
                        >
                            <QrCodeIcon className="h-6 w-4 ml-2 sm:ml-0" />
                            <span className="whitespace-nowrap">
                                View QR Code
                            </span>
                        </label>
                    </li>
                    {chain.network != "devnet" ? (
                        <li className={selectingNetwork ? "hidden" : ""}>
                            <button
                                className="menu-item btn-sm !rounded-xl flex gap-3"
                                type="button"
                            >
                                <ArrowTopRightOnSquareIcon className="h-6 w-4 ml-2 sm:ml-0" />
                                <a
                                    target="_blank"
                                    href={blockExplorerAddressLink}
                                    rel="noopener noreferrer"
                                    className="whitespace-nowrap"
                                >
                                    View on Block Explorer
                                </a>
                            </button>
                        </li>
                    ) : null}

                    {/* TODO: reinstate if needed */}
                    {/* {allowedNetworks.length > 1 ? (
            <li className={selectingNetwork ? "hidden" : ""}>
              <button
                className="btn-sm !rounded-xl flex gap-3 py-3"
                type="button"
                onClick={() => {
                  setSelectingNetwork(true);
                }}
              >
                <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" />{" "}
                <span>Switch Network</span>
              </button>
            </li>
          ) : null} */}
                    <li className={selectingNetwork ? "hidden" : "p-0"}>
                        <button
                            className="menu-item text-secondary-content btn-sm text-sm !rounded-xl flex gap-3"
                            type="button"
                            onClick={handleDisconnect}
                        >
                            <ArrowLeftEndOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" />{" "}
                            <span>Disconnect</span>
                        </button>
                    </li>
                </ul>
            </details>
        </>
    );
};
