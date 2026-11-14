import { memo, useCallback, useMemo } from 'react'
import { TextField } from '@mui/material'
import { useController } from 'react-hook-form'

const NOOP = () => { }

const CustomTextField = memo(({
    label = "",
    value = "",
    onChange = NOOP,
    name = "",
    disabled = false,
    type = "",
    helperText = "",
    maxLength,
    error = "",
    placeholder = "",
    onBLur = NOOP,
    onBlur = onBLur,
    endAdornment = null,
    inputMode = "",
    isEditMode = false,
}) => {
    const slotProps = useMemo(() => ({
        input: {
            endAdornment,
            readOnly: false,
            disableUnderline: true,
        },
        htmlInput: {
            maxLength,
            inputMode,
        },
    }), [endAdornment, inputMode, maxLength])

    return isEditMode ? (
        <TextField
            label={label}
            value={value ?? ""}
            onChange={onChange}
            name={name}
            disabled={disabled}
            type={type}
            fullWidth
            variant="filled"
            onBlur={onBlur}
            error={!!error}
            helperText={error || helperText}
            placeholder={placeholder}
            slotProps={slotProps}
        />
    ) : (
        <div>
            <span>{label}</span>
            <span>{value ?? ""}</span>
        </div>
    )
})

export default CustomTextField

export const ControlledTextField = memo(({ name, control, onChange, ...rest }) => {
    const { field } = useController({ name, control })
    const fieldOnChange = field.onChange
    const handleChange = useCallback((event) => {
        fieldOnChange(event)
        onChange?.(event)
    }, [fieldOnChange, onChange])

    return (
        <CustomTextField
            {...rest}
            {...field}
            onChange={handleChange}
        />
    )
})
