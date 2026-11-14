import { IconButton, InputAdornment, MenuItem, TextField } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import CustomDrawer from './CustomDrawer';
import CustomSearch from './CustomSearch';
import CountryDrawer from './CountryDrawer';
import { Controller } from 'react-hook-form';
import { ExpandMore } from '@mui/icons-material';

const CustomSelect = ({
    label = "",
    value = "" || [],
    drawerTitle = "",
    helperText = "",
    error = "",
    onChange = () => { },
    open = false,
    disabled = false,
    name = "",
    options = [],
    endIcon = null,
    labelSize = "14px",
    flagIcon = null,
    isEditMode = false,
    launchOptions = null,
    isCountry = false,
    countryPlaceholder = "",
    countryButtonText = "",
    isMultiSelect = false,
    restrictedCountry = "",
    isFullScreen = false,
    isSearchEnabled = false,
    searchText = "",
    isAmount = false
}) => {
    const selectRef = useRef(null)
    const [openDrawer, setOpenDrawer] = React.useState(open)
    const editModeValue = useMemo(() => options?.find((x) => x?.value === value)?.name || "", [options, value]);
    const displayValue = isMultiSelect ? options?.filter((o) => value?.includes(o?.value)).map((o) => o.name).join(", ") : editModeValue || "";

    const [selectedCountry, setSelectedCountry] = React.useState("")
    const [search, setSearch] = React.useState("")

    const sortedOptions = useMemo(() => {
        return options?.filter((c) => c?.name?.toLowerCase().includes(search?.toLowerCase())).sort((a, b) => a?.name?.localeCompare(b?.name)) ?? []
    }, [options, search])

    const _options = isAmount ? options : sortedOptions;

    const handleOptionClick = useCallback((optionValue) => {
        if (!isMultiSelect) {
            onChange({ target: { name, value: optionValue } })
            setOpenDrawer(false)
            return
        }

        const current = Array.isArray(value) ? value : []
        const updated = current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue];
        onChange({ target: { name, value: updated } })
    }, [name, onChange])

    const handleCountrySelect = useCallback((countryValue) => {
        setSelectedCountry(countryValue)
    }, [])

    useEffect(() => {
        if (isCountry && value !== selectedCountry) {
            setSelectedCountry(value)
        }
    }, [value])

    return (
        <>
            {isEditMode ? (
                <div style={{ width: "100%" }} ref={selectRef}>
                    <TextField
                        fullWidth
                        label={label}
                        select
                        disabled={disabled}
                        name={name}
                        helperText={error ? error : helperText}
                        error={!!error}
                        value={value ?? ""}
                        variant="filled"
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton>
                                            <div>
                                                {endIcon ? endIcon : <ExpandMore />}
                                            </div>
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                disableUnderline: true,
                                readOnly: true,
                                onClick: () => {
                                    if (!disabled && selectRef?.current) {
                                        setOpenDrawer(true)
                                    }
                                },
                            },
                        }}
                    >
                        {options?.map((item, index) => {
                            return (
                                <MenuItem key={item?.value} value={item?.value ?? ""}>{item?.name}</MenuItem>
                            )
                        })}
                    </TextField>

                    <CustomDrawer
                        title={drawerTitle}
                        openDrawer={(!isCountry || !isFullScreen) && openDrawer}
                        onClose={() => {
                            setOpenDrawer(prev => !prev)
                            setSearch("")
                        }}
                        launchIcons={launchOptions}
                        height={isSearchEnabled ? "80vh" : ""}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: '8px', padding: "16px" }}>
                            {isSearchEnabled && (
                                <CustomSearch
                                    search={search}
                                    setSearch={setSearch}
                                    placeholder={searchText || "Search"}
                                />
                            )}

                            {_options?.map((option) => {
                                const isSelected = isMultiSelect ? value?.includes(option?.value) : value === option?.value;
                                return (
                                    <div
                                        key={option?.value}
                                        onClick={() => handleOptionClick(option?.value)}
                                        style={{ border: isSelected ? '1px solid #1501FF' : '1px solid #02142E', borderRadius: '8px', padding: '8px' }}
                                    >
                                        {option?.name}
                                    </div>
                                )
                            })}
                        </div>
                    </CustomDrawer>

                    <CountryDrawer
                        openDrawer={(isCountry || isFullScreen) && openDrawer}
                        onButtonClick={() => {
                            onChange({ target: { name, value: selectedCountry } })
                            if (restrictedCountry) {
                                if (selectedCountry === restrictedCountry) {
                                    setOpenDrawer(false)
                                } else return
                            } else {
                                setOpenDrawer(false)
                            }
                        }}
                        search={search}
                        setSearch={setSearch}
                        title={drawerTitle}
                        placeholder={countryPlaceholder || "Search"}
                        buttonText={countryButtonText || "Select"}
                        launchOptions={launchOptions}
                        onClose={() => {
                            setOpenDrawer(prev => !prev)
                            setSearch("")
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {_options?.map((option) => {
                                const isSelected = isMultiSelect ? selectedCountry?.includes(option?.value) : selectedCountry === option?.value;
                                return (
                                    <div
                                        key={option?.value}
                                        onClick={() => handleCountrySelect(option?.value)}
                                        style={{ border: isSelected ? '1px solid #1501FF' : '1px solid #02142E', borderRadius: '8px', padding: '8px' }}
                                    >
                                        {option?.name}
                                    </div>
                                )
                            })}
                        </div>
                    </CountryDrawer>
                </div>
            ) : (
                <div>
                    <span>{label}</span>
                    <span>{displayValue || ""}</span>
                </div>
            )}
        </>
    )
}

export default CustomSelect


export const ControlledSelect = ({
    name, control, onChange, ...rest
}) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <CustomSelect
                    {...rest}
                    {...field}
                    onChange={(e) => {
                        field.onChange(e.target.value)
                        onChange?.(e.target.value)
                    }}
                />

            )}
        />
    )
}
