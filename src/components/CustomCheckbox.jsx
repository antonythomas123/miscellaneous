import { Controller } from 'react-hook-form'
import CheckIcon from '@mui/icons-material/Check'

const checkboxStyle = (checked, disabled) => ({
    width: "24px",
    height: "24px",
    borderRadius: "4px",
    border: checked ? "none" : "1px solid #02142E",
    backgroundColor: checked ? "#1501FF" : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer",
    flexShrink: 0,
    opacity: disabled ? 0.5 : 1,
    boxSizing: "border-box",
    transition: "background-color 0.15s ease, border-color 0.15s ease",
})

const CustomCheckbox = ({ checked, onChange, disabled = false }) => {
    return (
        <div onClick={() => !disabled && onChange?.(!checked)}>
            <div style={checkboxStyle(checked, disabled)}>
                {checked && <CheckIcon sx={{ color: "#fff", fontSize: 18 }} />}
            </div>
        </div>
    )
}

export default CustomCheckbox

export const ControlledCheckbox = ({ name, control, disabled, onChange }) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <CustomCheckbox
                    checked={!!field.value}
                    onChange={(nextValue) => {
                        field.onChange(nextValue)
                        onChange?.(nextValue)
                    }}
                    disabled={disabled}
                />
            )}
        />
    )
}
