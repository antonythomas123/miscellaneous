import { Button, Dialog, DialogActions, DialogContent } from '@mui/material'
import { memo } from 'react'

const CustomModal = memo(({
    open,
    onClose,
    title,
    content,
    cancelButtonText,
    actionButtonText,
    onCancelClick,
    onActionClick
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogContent>
                {title && <span>{title}</span>}
                <span>{content}</span>

            </DialogContent>

            <DialogActions style={{ display: 'flex', gap: '16px' }}>
                {cancelButtonText && (
                    <Button variant='outlined' onClick={onCancelClick}>
                        {cancelButtonText || "Cancel"}
                    </Button>
                )}
                <Button variant='contained' onClick={onActionClick}>
                    {actionButtonText}
                </Button>

            </DialogActions>
        </Dialog>
    )
})

export default CustomModal
