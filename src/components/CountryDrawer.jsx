import { Button, Drawer, IconButton } from '@mui/material'
import React, { useReducer, useRef, useEffect } from 'react'
import CustomSearch from './CustomSearch'
import { Close } from '@mui/icons-material'

const CountryDrawer = ({
    openDrawer = false,
    onClose = () => { },
    title = "",
    children = null,
    onButtonClick = () => { },
    search,
    setSearch,
    placeholder = "",
    buttonText = "",
    launchOptions = null,
}) => {
    const inputElement = useRef(null)

    useEffect(() => {
        inputElement?.current?.focus()
    }, [])

    return (
        <Drawer
            anchor="bottom"
            open={openDrawer}
            onClose={onClose}
            transitionDuration={500}
            ModalProps={{
                keepMounted: true,
            }}
            PaperProps={{
                sx: {
                    height: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                },
            }}
        >
            {/* Scrollable content */}
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    padding: '16px',
                }}
            >
                <div>
                    <IconButton onClick={onClose}>
                        <Close />
                    </IconButton>
                    <span>{title}</span>
                </div>

                <CustomSearch
                    search={search}
                    setSearch={setSearch}
                    placeholder={placeholder || "Search"}
                />

                <div style={{ marginTop: '24px' }}>
                    {children}
                </div>
            </div>

            <div
                style={{
                    flexShrink: 0,
                    padding: '16px',
                    backgroundColor: '#fff',
                    borderTop: '1px solid #eee',
                }}
            >
                <Button
                    variant="contained"
                    onClick={onButtonClick}
                    style={{ width: '100%' }}
                >
                    {buttonText || ""}
                </Button>
            </div>
        </Drawer>
    )
}

export default CountryDrawer
