import { memo } from 'react'

export const ExpandMoreIcon = memo(() => (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path d="m7.41 8.59 4.59 4.58 4.59-4.58L18 10l-6 6-6-6z" />
    </svg>
))

export const CheckIcon = memo(() => (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
        <path d="m9 16.17-3.88-3.88-1.41 1.42L9 19 21 7l-1.41-1.41z" />
    </svg>
))

export const CloseIcon = memo(() => (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.41 4.29 19.71 2.88 18.3 9.17 12 2.88 5.7 4.29 4.29 10.59 10.59 16.89 4.29z" />
    </svg>
))
