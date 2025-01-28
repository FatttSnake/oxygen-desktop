import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        userSelect: 'none',
        transition: 'all .3s',
        whiteSpace: 'nowrap'
    },

    content: {
        display: 'flex',
        minHeight: 0,
        flexDirection: 'column',
        flex: 1
    },

    collapse: {
        width: `${token.sizeXL * 2}px !important`
    }
}))
