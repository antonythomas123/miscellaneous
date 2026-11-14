import React from 'react'
import CustomRadio from './CustomRadio'
import { Controller } from 'react-hook-form'

const CustomRadioGroup = ({
    label = "",
    option1,
    option2,
    value,
    onChange,
    error,
    disabled
}) => {
    const handleChange = (nextValue) => {
        onChange?.(nextValue)
    }
    return (
        <div>
            <label>{label}</label>
            <div style={{ border: '1px solid #02142E', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '50%' }}>
                        <span>{option1}</span>
                        <CustomRadio
                            isChecked={value === true}
                            onChange={() => handleChange(true)}
                            value={"true"}
                            disabled={disabled}
                        />
                    </div>

                    <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '50%' }}>
                        <span>{option2}</span>
                        <CustomRadio
                            isChecked={value === false}
                            onChange={() => handleChange(false)}
                            value={"false"}
                            disabled={disabled}
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div>{error}</div>
            )}
        </div>
    )
}

export default CustomRadioGroup


export const ControlledRadioGroup = ({ name, control, onChange, ...rest }) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <CustomRadioGroup
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