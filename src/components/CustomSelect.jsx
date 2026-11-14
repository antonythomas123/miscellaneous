import { IconButton, InputAdornment, TextField } from '@mui/material'
import { lazy, memo, Suspense, useCallback, useMemo, useState } from 'react'
import { useController } from 'react-hook-form'
import CustomSearch from './CustomSearch'
import { ExpandMoreIcon } from './Icons'

const CustomDrawer = lazy(() => import('./CustomDrawer'))
const CountryDrawer = lazy(() => import('./CountryDrawer'))

const EMPTY_OPTIONS = []
const NOOP = () => { }
const OPTION_STYLE = {
    border: '1px solid #02142E',
    borderRadius: '8px',
    padding: '8px',
}
const SELECTED_OPTION_STYLE = {
    ...OPTION_STYLE,
    border: '1px solid #1501FF',
}

const SelectOption = memo(({ option, selected, onSelect }) => {
    const handleClick = useCallback(() => onSelect(option.value), [onSelect, option.value])

    return (
        <div
            onClick={handleClick}
            style={selected ? SELECTED_OPTION_STYLE : OPTION_STYLE}
        >
            {option.name}
        </div>
    )
})

const CustomSelect = ({
    label = "",
    value = "",
    drawerTitle = "",
    helperText = "",
    error = "",
    onChange = NOOP,
    open = false,
    disabled = false,
    name = "",
    options = EMPTY_OPTIONS,
    endIcon = null,
    isEditMode = false,
    isCountry = false,
    countryPlaceholder = "",
    countryButtonText = "",
    isMultiSelect = false,
    restrictedCountry = "",
    isFullScreen = false,
    isSearchEnabled = false,
    searchText = "",
    isAmount = false,
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(open)
    const [selectedCountry, setSelectedCountry] = useState(value)
    const [search, setSearch] = useState("")

    const optionNames = useMemo(
        () => new Map(options.map((option) => [option.value, option.name])),
        [options],
    )
    const displayValue = useMemo(() => {
        if (isMultiSelect) {
            return (Array.isArray(value) ? value : [])
                .map((optionValue) => optionNames.get(optionValue))
                .filter(Boolean)
                .join(", ")
        }

        return optionNames.get(value) || ""
    }, [isMultiSelect, optionNames, value])

    const normalizedSearch = search.trim().toLowerCase()
    const filteredOptions = useMemo(() => {
        if (isAmount || !normalizedSearch) return options

        return options.filter((option) => option.name.toLowerCase().includes(normalizedSearch))
    }, [isAmount, normalizedSearch, options])
    const sortedOptions = useMemo(() => {
        if (isAmount || isCountry) return filteredOptions

        return [...filteredOptions].sort((a, b) => a.name.localeCompare(b.name))
    }, [filteredOptions, isAmount, isCountry])

    const countryDrawer = isCountry || isFullScreen

    const closeDrawer = useCallback(() => {
        setIsDrawerOpen(false)
        setSearch("")
    }, [])

    const openSelect = useCallback(() => {
        if (disabled) return

        setSelectedCountry(value)
        setIsDrawerOpen(true)
    }, [disabled, value])

    const handleOptionClick = useCallback((optionValue) => {
        if (!isMultiSelect) {
            onChange({ target: { name, value: optionValue } })
            closeDrawer()
            return
        }

        const current = Array.isArray(value) ? value : []
        const updated = current.includes(optionValue)
            ? current.filter((item) => item !== optionValue)
            : [...current, optionValue]
        onChange({ target: { name, value: updated } })
    }, [closeDrawer, isMultiSelect, name, onChange, value])

    const handleCountrySelect = useCallback((countryValue) => {
        if (!isMultiSelect) {
            setSelectedCountry(countryValue)
            return
        }

        const current = Array.isArray(selectedCountry) ? selectedCountry : []
        setSelectedCountry(current.includes(countryValue)
            ? current.filter((item) => item !== countryValue)
            : [...current, countryValue])
    }, [isMultiSelect, selectedCountry])

    const handleCountryConfirm = useCallback(() => {
        onChange({ target: { name, value: selectedCountry } })

        if (restrictedCountry && selectedCountry !== restrictedCountry) return
        closeDrawer()
    }, [closeDrawer, name, onChange, restrictedCountry, selectedCountry])

    return isEditMode ? (
        <div style={{ width: "100%" }}>
            <TextField
                fullWidth
                label={label}
                disabled={disabled}
                name={name}
                helperText={error || helperText}
                error={!!error}
                value={displayValue}
                variant="filled"
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={openSelect} disabled={disabled}>
                                    {endIcon || <ExpandMoreIcon />}
                                </IconButton>
                            </InputAdornment>
                        ),
                        disableUnderline: true,
                        readOnly: true,
                        onClick: openSelect,
                    },
                }}
            />

            {isDrawerOpen && (
                <Suspense fallback={null}>
                    {!countryDrawer && (
                        <CustomDrawer
                            title={drawerTitle}
                            openDrawer
                            onClose={closeDrawer}
                        >
                            <div style={{ display: "flex", flexDirection: "column", gap: '8px', padding: "16px" }}>
                                {isSearchEnabled && (
                                    <CustomSearch
                                        search={search}
                                        setSearch={setSearch}
                                        placeholder={searchText || "Search"}
                                    />
                                )}

                                {sortedOptions.map((option) => (
                                    <SelectOption
                                        key={option.value}
                                        option={option}
                                        selected={isMultiSelect
                                            ? Array.isArray(value) && value.includes(option.value)
                                            : value === option.value}
                                        onSelect={handleOptionClick}
                                    />
                                ))}
                            </div>
                        </CustomDrawer>
                    )}

                    {countryDrawer && (
                        <CountryDrawer
                            openDrawer
                            onButtonClick={handleCountryConfirm}
                            search={search}
                            setSearch={setSearch}
                            title={drawerTitle}
                            placeholder={countryPlaceholder || "Search"}
                            buttonText={countryButtonText || "Select"}
                            onClose={closeDrawer}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {sortedOptions.map((option) => (
                                    <SelectOption
                                        key={option.value}
                                        option={option}
                                        selected={isMultiSelect
                                            ? Array.isArray(selectedCountry) && selectedCountry.includes(option.value)
                                            : selectedCountry === option.value}
                                        onSelect={handleCountrySelect}
                                    />
                                ))}
                            </div>
                        </CountryDrawer>
                    )}
                </Suspense>
            )}
        </div>
    ) : (
        <div>
            <span>{label}</span>
            <span>{displayValue}</span>
        </div>
    )
}

const MemoizedCustomSelect = memo(CustomSelect)

export default MemoizedCustomSelect

export const ControlledSelect = memo(({ name, control, onChange, ...rest }) => {
    const { field } = useController({ name, control })
    const fieldOnChange = field.onChange
    const handleChange = useCallback((event) => {
        const nextValue = event.target.value
        fieldOnChange(nextValue)
        onChange?.(nextValue)
    }, [fieldOnChange, onChange])

    return (
        <MemoizedCustomSelect
            {...rest}
            {...field}
            onChange={onChange ? handleChange : field.onChange}
        />
    )
})
