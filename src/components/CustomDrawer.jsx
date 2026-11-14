import { memo } from 'react'
import { SwipeableDrawer } from '@mui/material'

const NOOP = () => { }
const pullerStyle = {
    width: 40,
    height: 4,
    position: "absolute",
    top: 8,
    left: "calc(50% - 15px)",
}
const contentStyle = { flex: 1, overflowY: "auto" }

const CustomDrawer = memo(({
    openDrawer = false,
    onClose = NOOP,
    title = "",
    children = null,
    subtitle = "",
}) => {
    return (
        <SwipeableDrawer
            anchor="bottom"
            open={openDrawer}
            onClose={onClose}
            swipeAreaWidth={56}
            disableSwipeToOpen
            transitionDuration={500}
        >
            <div>
                <div style={pullerStyle} />
                <div>
                    <span>{title}</span>
                    <span>{subtitle}</span>
                </div>

                <div style={contentStyle}>
                    {children}
                </div>
            </div>
        </SwipeableDrawer>
    )
})

export default CustomDrawer
