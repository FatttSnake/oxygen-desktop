import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    sidebar: {
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
        width: `${token.sizeXL * 2 + 1}px !important`
    },

    safeVerticalPadding: {
        padding: `${token.paddingXS}px 0`
    }
}))
