import { memo, useCallback } from 'react'
import { useController } from 'react-hook-form'
import CustomRadio from './CustomRadio'

const CustomRadioGroup = memo(({
    label = "",
    option1,
    option2,
    value,
    onChange,
    error,
    disabled,
    name,
}) => {
    const handleOption1Change = useCallback(() => onChange?.(true), [onChange])
    const handleOption2Change = useCallback(() => onChange?.(false), [onChange])
    return (
        <div>
            <label>{label}</label>
            <div style={{ border: '1px solid #02142E', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '50%' }}>
                        <span>{option1}</span>
                        <CustomRadio
                            isChecked={value === true}
                            name={name}
                            onChange={handleOption1Change}
                            value={"true"}
                            disabled={disabled}
                        />
                    </div>

                    <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '50%' }}>
                        <span>{option2}</span>
                        <CustomRadio
                            isChecked={value === false}
                            name={name}
                            onChange={handleOption2Change}
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
})

export default CustomRadioGroup


export const ControlledRadioGroup = memo(({ name, control, onChange, ...rest }) => {
    const { field } = useController({ name, control })
    const fieldOnChange = field.onChange
    const handleChange = useCallback((nextValue) => {
        fieldOnChange(nextValue)
        onChange?.(nextValue)
    }, [fieldOnChange, onChange])

    return <CustomRadioGroup {...rest} {...field} onChange={handleChange} />
})
