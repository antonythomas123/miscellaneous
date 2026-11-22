import { InputAdornment, styled, TextField } from '@mui/material'
import { useCallback, memo } from 'react'
import { Controller, useController } from 'react-hook-form'

export const StyledTextField = styled((props) => (
    <TextField InputProps={{ disableUnderline: true, readOnly: true }} {...props} />
))(({ theme }) => ({
    "& label.Mui-focused": {
        color: "#5B6677",
    },
    "& .MuiFilledInput-input": {
        padding: "25px 12px 5px 12px"
    },
    "& .MuiFilledInput-root": {
        overflow: 'hidden',
        width: "100%",
        borderRadius: 4,
        backgroundColor: "#FFF",
        border: '1px solid',
        borderColor: "#E6E7EA",
        transition: theme.transitions.create(["border-color"]),
        "&:hover": {
            backgroundColor: "transparent"
        },
        "&.Mui-focused": {
            backgroundColor: "transparent",
            borderColor: theme.palette.primary.main
        },
        "& .MuiInputAdornment-root": {
            paddingInlineEnd: "8px"
        }
    }
}))

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
    return isEditMode ? (
        <StyledTextField
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
            sx={{
                color: "#02142E",
                fontSize: "14px",
                fontWeight: 500,
                "& .MuiInputLabel-root": {
                    color: "#5B6677",
                    fontSize: "14px",
                    fontWeight: 500,
                    "&.Mui-error": {
                        color: "#d32f2f"
                    },
                    "&.Mui-focused": {
                        color: "#1501FF"
                    }
                },
                "& .MuiFilledInput-root": {
                    height: "56px",
                    "&.Mui-error": {
                        borderColor: "#d32f2f",
                    },
                    "&.Mui-focused": {
                        border: "1px solid #1501FF",
                        backgroundColor: "#FFFFFF",
                    },
                    "&.Mui-disabled": {
                        backgroundColor: "#FFFFFF"
                    },
                    "& .MuiInputAdornment-root": {
                        paddingInlineEnd: "0px",
                        marginInlineEnd: "-4px"
                    }
                },
                "& .MuiInputBase-root": {
                    background: "white",
                    "&.Mui-focused": {
                        border: "2px solid #1501FF",
                        background: "#FFFFFF"
                    }
                }
            }}
            InputProps={{
                endAdornment: (
                    <InputAdornment position='end'>
                        {endAdornment}
                    </InputAdornment>
                ),
                readOnly: false,
                disableUnderline: true,
                sx: {
                    height: '54px',
                    borderRadius: "4px",
                    background: 'white',
                    color: "#02142E",
                    fontSize: "14px",
                    fontWeight: 500,
                    border: "1px solid #E6E7EA",
                    padding: "0px 16px 0px 0px",
                    caretColor: "#1501FF",
                    '.MuiTypography-root': {
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#5b6677"
                    }
                }
            }}
            inputProps={{
                maxLength: maxLength,
                inputMode: inputMode
            }}
        />
    ) : (
        <div>
            <span>{label}</span>
            <span>{value ?? ""}</span>
        </div>
    )
}

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