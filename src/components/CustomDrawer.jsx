import { styled, SwipeableDrawer } from '@mui/material'

const Puller = styled("div")({
    width: 40,
    height: 4,
    position: "absolute",
    top: 8,
    left: "calc(50% - 15px)"
})

const CustomDrawer = ({
    openDrawer = false,
    onClose = () => { },
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
            disableSwipeToOpen={true}
            transitionDuration={500}
            ModalProps={{
                keepMounted: true,
            }}
        >
            <div>
                <Puller />
                <div>
                    <span>{title}</span>
                    <span>{subtitle}</span>
                </div>

                <div style={{ flex: 1, overflowY: "auto" }}>
                    {children}
                </div>
            </div>
        </SwipeableDrawer>
    )
}

export default CustomDrawer
