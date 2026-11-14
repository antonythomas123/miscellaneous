import { memo, useCallback } from 'react'
import { useController } from 'react-hook-form'
import { CheckIcon } from './Icons'

const checkboxStyle = {
    width: "24px",
    height: "24px",
    borderRadius: "4px",
    border: "1px solid #02142E",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    boxSizing: "border-box",
    transition: "background-color 0.15s ease, border-color 0.15s ease",
}
const checkedStyle = { ...checkboxStyle, border: "none", backgroundColor: "#1501FF" }
const uncheckedStyle = { ...checkboxStyle, border: "1px solid #02142E", backgroundColor: "transparent" }
const checkedDisabledStyle = { ...checkedStyle, opacity: 0.5, cursor: "not-allowed" }
const uncheckedDisabledStyle = { ...uncheckedStyle, opacity: 0.5, cursor: "not-allowed" }

const CustomCheckbox = memo(({ checked, onChange, disabled = false }) => {
    const handleClick = useCallback(() => {
        if (!disabled) onChange?.(!checked)
    }, [checked, disabled, onChange])

    return (
        <div
            onClick={handleClick}
            role="checkbox"
            aria-checked={!!checked}
            aria-disabled={disabled}
        >
            <div style={disabled
                ? (checked ? checkedDisabledStyle : uncheckedDisabledStyle)
                : (checked ? checkedStyle : uncheckedStyle)}>
                {checked && <CheckIcon />}
            </div>
        </div>
    )
})

export default CustomCheckbox

export const ControlledCheckbox = memo(({ name, control, disabled, onChange }) => {
    const { field } = useController({ name, control })
    const fieldOnChange = field.onChange
    const handleChange = useCallback((nextValue) => {
        fieldOnChange(nextValue)
        onChange?.(nextValue)
    }, [fieldOnChange, onChange])

    return <CustomCheckbox checked={!!field.value} onChange={handleChange} disabled={disabled} />
})
