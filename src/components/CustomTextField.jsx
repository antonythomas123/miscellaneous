import { TextField } from '@mui/material'
import { Controller } from 'react-hook-form'

const CustomTextField = ({
    label = "",
    value = "",
    onChange = () => { },
    name = "",
    disabled = false,
    type = "",
    helperText = "",
    maxLength,
    error = "",
    placeholder = "",
    onBLur = () => { },
    endAdornment = null,
    inputMode = "",
    isEditMode = false,
}) => {
    return (
        <>
            {isEditMode ? (
                <TextField
                    label={label}
                    value={value ?? ""}
                    onChange={onChange}
                    name={name}
                    disabled={disabled}
                    type={type}
                    fullWidth
                    variant="filled"
                    onBlur={onBLur}
                    error={!!error}
                    helperText={error ? error : helperText}
                    placeholder={placeholder}
                    slotProps={{
                        input: {
                            endAdornment: endAdornment,
                            readOnly: false,
                            disableUnderline: true,
                        },
                        htmlInput: {
                            maxLength: maxLength,
                            inputMode: inputMode,
                        },
                    }}
                />
            ) : (
                <div>
                    <span>{label}</span>
                    <span>{value ?? ""}</span>
                </div>
            )}
        </>
    )
}

export default CustomTextField

export const ControlledTextField = ({ name, control, onChange, ...rest }) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <CustomTextField
                    {...rest}
                    {...field}
                    onChange={(e) => {
                        field.onChange(e)
                        onChange?.(e)
                    }}
                />
            )}
        />
    )
}
