/**
 * Component to display auction status as a colored badge
 */

"use client";

type AuctionStatus = "active" | "ended" | "finalized" | "cancelled";

interface AuctionStatusBadgeProps {
    status: AuctionStatus;
}

export const AuctionStatusBadge: React.FC<AuctionStatusBadgeProps> = ({
    status,
}) => {
    const getBadgeStyles = (status: AuctionStatus) => {
        switch (status) {
            case "active":
                return "bg-green-600 text-white";
            case "ended":
                return "bg-yellow-600 text-white";
            case "finalized":
                return "bg-blue-600 text-white";
            case "cancelled":
                return "bg-red-600 text-white";
            default:
                return "bg-gray-600 text-white";
        }
    };

    const getStatusText = (status: AuctionStatus) => {
        switch (status) {
            case "active":
                return "Active";
            case "ended":
                return "Ended";
            case "finalized":
                return "Finalized";
            case "cancelled":
                return "Cancelled";
            default:
                return "Unknown";
        }
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeStyles(status)}`}
        >
            {getStatusText(status)}
        </span>
    );
};
