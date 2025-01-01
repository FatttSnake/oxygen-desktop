import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        height: 40,
        padding: `0 ${token.paddingSM}px`
    }
}))
