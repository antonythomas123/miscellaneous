import { Collapse, IconButton, InputAdornment, MenuItem, TextField } from '@mui/material';
import { lazy, memo, Suspense, useCallback, useMemo, useRef, useState } from 'react'
import CustomSearch from './CustomSearch';
import { Controller, useController } from 'react-hook-form';
import { ArrowDownward, ExpandMore } from '@mui/icons-material';

const CustomDrawer = lazy(() => import('./CustomDrawer'))
const CountryDrawer = lazy(() => import('./CountryDrawer'))

const optionCollator = new Intl.Collator();
const EMPTY_OPTIONS = []

const OPTION_STYLE = {
    border: '1px solid #E6E7E9',
    background: 'transparent',
    borderRadius: '8px',
    padding: '12px 16px 12px 16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
}

const SELECTED_OPTION_STYLE = {
    ...OPTION_STYLE,
    border: '1px solid #1501FF',
    background: "#F4F3FF"
}

const SelectedOption = memo(({ option, selected, onSelect, isAmount, isCountry }) => {
    const handleClick = useCallback(() => onSelect(option?.value), [onSelect, option?.value])

    return (
        <div
            key={option?.value}
            style={selected ? SELECTED_OPTION_STYLE : OPTION_STYLE}
            onClick={handleClick}
        >
            {isCountry && (
                <div>
                    <div className={option?.value} />
                </div>
            )}
            <span style={{ color: '#02142E', fontSize: '14px', fontWeight: 550 }} dir={isAmount ? "ltr" : ""}>{option?.name}</span>
        </div>
    )
})

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
    isAmount = false,
    flagIcon
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(open);
    const [selectedCountry, setSelectedCountry] = useState(value);
    const [search, setSearch] = useState("")

    const optionNames = useMemo(
        () => new Map(options.map((option) => [option?.value, option?.name])),
        [options]
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
        if (isAmount || !normalizedSearch) return options;

        return options?.filter((option) => option?.name.toLowerCase().includes(normalizedSearch))
    }, [isAmount, normalizedSearch, options])

    const sortedOptions = useMemo(() => {
        if (!isDrawerOpen) return EMPTY_OPTIONS;
        if (isAmount) return filteredOptions;
        return [...filteredOptions].sort((a, b) => optionCollator.compare(a.name, b.name))
    }, [filteredOptions, isAmount, isDrawerOpen])

    const countryDrawer = isCountry || isFullScreen;

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

        const current = Array.isArray(value) ? value : [];
        const updated = current.includes(optionValue) ? current.filter((item) => item !== optionValue) : [...current, optionValue]
        onChange({ target: { name, value: updated } })
    }, [closeDrawer, isMultiSelect, name, onChange, value])

    const _options = isAmount ? options : sortedOptions;

    const handleCountrySelect = useCallback((countryValue) => {
        setSelectedCountry((previous) => {
            if (!isMultiSelect) return countryValue

            const current = Array.isArray(previous) ? previous : [];

            return current.includes(countryValue) ? current.filter((item) => item !== countryValue) : [...current, countryValue]
        })
    }, [isMultiSelect])

    const handleCountryConfirm = useCallback(() => {
        onChange({ target: { name, value: selectedCountry } })

        if (restrictedCountry && selectedCountry === restrictedCountry) return
        closeDrawer()
    }, [closeDrawer, name, onChange, restrictedCountry, selectedCountry])

    const menuItems = useMemo(() => {
        if (isMultiSelect) return options || [];

        const selected = (options || []).find((o) => o?.value === value)
        return selected ? [selected] : []
    }, [isMultiSelect, options, value])

    return isEditMode ? (
        <div style={{ width: "100%" }}>
            <TextField
                fullWidth
                select
                label={label}
                disabled={disabled}
                name={name}
                sx={{
                    "& label.Mui-focused": {
                        color: "#5B6677",
                        borderColor: '#1501FF'
                    },
                    "& .Mui-disabled": {
                        backgroundColor: "#FFF !important"
                    },
                    "& .MuiFilledInput-input": {
                        padding: '25px 0px 5px 12px'
                    },
                    "& .MuiSelect-select": {
                        paddingInline: flagIcon ? "36px" : ""
                    },
                    "& .MuiSelect-select:focus": {
                        backgroundColor: 'transparent'
                    },
                    "& .MuiFilledInput-root": {
                        overflow: 'hidden !important',
                        width: '100%',
                        borderRadius: 1,
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E6E7EA',
                        paddingBottom: '0px !important',
                        color: '#02142E',
                        fontSize: '14px',
                        fontWeight: 500,
                        height: '56px',
                        paddingInline: flagIcon ? "20px" : "",
                        "&:hover": {
                            backgroundColor: "transparent"
                        },
                        "&.Mui-focused": {
                            backgroundColor: "transparent",
                            borderColor: "#1501FF"
                        },
                        "& .MuiInputAdornment-root": {
                            paddingInline: "0px",
                            marginInline: '-10px'
                        },
                        "&.MuiInputBase-input-MuiFilledInput-input": {
                            paddingBottom: "0px"
                        },
                        "&.Mui-error": {
                            borderColor: "#D32F2F"
                        }
                    },
                    "& .MuiInputLabel-root": {
                        color: "#67707D",
                        fontSize: "14px",
                        fontWeight: 500,
                        "&.Mui-error": {
                            color: "#D32F2F",
                        }
                    },
                    "& .MuiInputLabel-shrink": {
                        color: "#67707D",
                        fontSize: flagIcon ? "16px" : "12px",
                        fontWeight: 400,
                    },
                    "& .MuiSelect-icon": {
                        display: 'none'
                    },
                    "& . MuiSelect-filled": {
                        marginLeft: flagIcon ? '-18px !important' : null
                    }
                }}
                helperText={error ? error : helperText}
                error={!!error}
                value={value ?? ""}
                variant="filled"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position='end'>
                            <IconButton>
                                <div
                                    style={{
                                        transform: `${isDrawerOpen && endIcon ? "rotate(180deg)" : ""}`
                                    }}
                                >
                                    {endIcon ? endIcon : <ArrowDownward />}
                                </div>
                            </IconButton>
                        </InputAdornment>
                    ),
                    disableUnderline: true,
                    readOnly: true,
                    onClick: openSelect
                }}
            >
                {menuItems?.map((item) => <MenuItem key={item?.value} value={item?.value}>{item?.name}</MenuItem>)}
            </TextField>

            {isDrawerOpen && (
                <Suspense fallback={null}>
                    <Collapse in={isDrawerOpen} timeout={500} mountOnEnter unmountOnExit>
                        {!countryDrawer && (
                            <CustomDrawer
                                title={drawerTitle || label}
                                openDrawer={isDrawerOpen}
                                onClose={closeDrawer}
                                height={isSearchEnabled ? "80vh" : ""}
                            >
                                {sortedOptions?.map((option) => (
                                    <SelectedOption
                                        key={option?.value}
                                        option={option}
                                        selected={isMultiSelect
                                            ? Array.isArray(value) && value.includes(option?.value)
                                            : value === option?.value
                                        }
                                        onSelect={handleOptionClick}
                                        isAmount={isAmount}
                                    />
                                ))}
                            </CustomDrawer>
                        )}

                        {countryDrawer && (
                            <CountryDrawer
                                openDrawer={isDrawerOpen}
                                onButtonClick={handleCountryConfirm}
                                search={search}
                                setSearch={setSearch}
                                title={drawerTitle || label}
                                onClose={closeDrawer}
                                placeholder={countryPlaceholder}
                                buttonText={countryButtonText || "Choose"}
                            >
                                {sortedOptions.map((option) => (
                                    <SelectedOption
                                        key={option?.value}
                                        option={option}
                                        selected={isMultiSelect
                                            ? Array.isArray(selectedCountry) && selectedCountry.includes(option.value)
                                            : selectedCountry === option?.value
                                        }
                                        onSelect={handleCountrySelect}
                                        isAmount={isAmount}
                                        isCountry={isCountry}
                                    />
                                ))}
                            </CountryDrawer>
                        )}
                    </Collapse>
                </Suspense>
            )}
        </div>
    ) : (
        <div>
            <span>{label}</span>
            <span>{displayValue || ""}</span>
        </div>
    )
}

const MemoizedCustomSelect = memo(CustomSelect)

export default MemoizedCustomSelect


export const ControlledSelect = ({
    name, control, onChange, ...rest
}) => {
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
            onChange={onChange ? handleChange  : field.onChange}
        />
    )
}
