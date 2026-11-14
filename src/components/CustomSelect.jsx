import { IconButton, InputAdornment, TextField } from '@mui/material';
import { memo, useCallback, useMemo, useRef, useState } from 'react'
import CustomDrawer from './CustomDrawer';
import CustomSearch from './CustomSearch';
import CountryDrawer from './CountryDrawer';
import { Controller } from 'react-hook-form';
import { ExpandMore } from '@mui/icons-material';

const CustomSelect = ({
    label = "",
    value = "",
    drawerTitle = "",
    helperText = "",
    error = "",
    onChange = () => { },
    open = false,
    disabled = false,
    name = "",
    options = [],
    endIcon = null,
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
    const [isDrawerOpen, setIsDrawerOpen] = useState(open)
    const editModeValue = useMemo(() => options?.find((x) => x?.value === value)?.name || "", [options, value]);
    const displayValue = isMultiSelect ? options?.filter((o) => value?.includes(o?.value)).map((o) => o.name).join(", ") : editModeValue || "";

    const [selectedCountry, setSelectedCountry] = useState(value)
    const [search, setSearch] = useState("")

    const filteredOptions = useMemo(() => (
        options?.filter((country) => country?.name?.toLowerCase().includes(search?.toLowerCase())) ?? []
    ), [options, search])
    const sortedOptions = useMemo(() => {
        if (isCountry) return filteredOptions

        return [...filteredOptions].sort((a, b) => a?.name?.localeCompare(b?.name))
    }, [filteredOptions, isCountry])

    const _options = isAmount ? options : sortedOptions;

    const handleOptionClick = useCallback((optionValue) => {
        if (!isMultiSelect) {
            onChange({ target: { name, value: optionValue } })
            setIsDrawerOpen(false)
            return
        }

        const current = Array.isArray(value) ? value : []
        const updated = current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue];
        onChange({ target: { name, value: updated } })
    }, [isMultiSelect, name, onChange, value])

    const handleCountrySelect = useCallback((countryValue) => {
        setSelectedCountry(countryValue)
    }, [])

    const countryDrawer = isCountry || isFullScreen

    return (
        <>
            {isEditMode ? (
                <div style={{ width: "100%" }} ref={selectRef}>
                    <TextField
                        fullWidth
                        label={label}
                        disabled={disabled}
                        name={name}
                        helperText={error ? error : helperText}
                        error={!!error}
                        value={displayValue}
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
                                        setSelectedCountry(value)
                                        setIsDrawerOpen(true)
                                    }
                                },
                            },
                        }}
                    />

                    {!countryDrawer && isDrawerOpen && (
                        <CustomDrawer
                            title={drawerTitle}
                            openDrawer={isDrawerOpen}
                            onClose={() => {
                                setIsDrawerOpen(false)
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
                    )}

                    {countryDrawer && isDrawerOpen && (
                        <CountryDrawer
                            openDrawer={isDrawerOpen}
                            onButtonClick={() => {
                                onChange({ target: { name, value: selectedCountry } })
                                if (restrictedCountry) {
                                    if (selectedCountry === restrictedCountry) {
                                        setIsDrawerOpen(false)
                                    } else return
                                } else {
                                    setIsDrawerOpen(false)
                                }
                            }}
                            search={search}
                            setSearch={setSearch}
                            title={drawerTitle}
                            placeholder={countryPlaceholder || "Search"}
                            buttonText={countryButtonText || "Select"}
                            launchOptions={launchOptions}
                            onClose={() => {
                                setIsDrawerOpen(false)
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
                    )}
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

const MemoizedCustomSelect = memo(CustomSelect)

export default MemoizedCustomSelect


export const ControlledSelect = ({
    name, control, onChange, ...rest
}) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <MemoizedCustomSelect
                    {...rest}
                    {...field}
                    onChange={onChange
                        ? (e) => {
                            field.onChange(e.target.value)
                            onChange(e.target.value)
                        }
                        : field.onChange}
                />

            )}
        />
    )
}
