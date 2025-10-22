import {
    CommonInputProps,
    InputBase,
    SIGNED_NUMBER_REGEX,
} from "~~/components/scaffold-stark";

/**
 * Input for STRK amount.
 */
export const StarkInput = ({
    value,
    name,
    placeholder,
    onChange,
    disabled,
}: CommonInputProps) => {
    const handleChangeNumber = (newValue: string) => {
        if (newValue && !SIGNED_NUMBER_REGEX.test(newValue)) {
            return;
        }
        onChange(newValue);
    };

    return (
        <InputBase
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={handleChangeNumber}
            disabled={disabled}
            prefix={
                <span className="pl-4 mr-2 text-accent self-center">Ξ</span>
            }
            suffix={
                <span className="pr-4 text-accent self-center text-xs font-semibold">
                    STRK
                </span>
            }
        />
    );
};
