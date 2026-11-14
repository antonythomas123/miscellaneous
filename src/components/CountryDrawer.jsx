import { memo } from 'react'
import { Button, Drawer, IconButton } from '@mui/material'
import CustomSearch from './CustomSearch'
import { CloseIcon } from './Icons'

const NOOP = () => { }
const scrollableContentStyle = {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '16px',
}
const footerStyle = {
    flexShrink: 0,
    padding: '16px',
    backgroundColor: '#fff',
    borderTop: '1px solid #eee',
}
const paperSx = {
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
}

const CountryDrawer = memo(({
    openDrawer = false,
    onClose = NOOP,
    title = "",
    children = null,
    onButtonClick = NOOP,
    search,
    setSearch,
    placeholder = "",
    buttonText = "",
}) => {
    return (
        <Drawer
            anchor="bottom"
            open={openDrawer}
            onClose={onClose}
            transitionDuration={500}
            PaperProps={{ sx: paperSx }}
        >
            <div style={scrollableContentStyle}>
                <div>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
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

            <div style={footerStyle}>
                <Button
                    variant="contained"
                    onClick={onButtonClick}
                    fullWidth
                >
                    {buttonText || ""}
                </Button>
            </div>
        </Drawer>
    )
})

export default CountryDrawer
