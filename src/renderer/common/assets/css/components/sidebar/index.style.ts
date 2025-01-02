import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    sidebar: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        userSelect: 'none',
        transition: 'all .3s',
        whiteSpace: 'nowrap',
        borderRight: `1px solid ${token.colorBorder}`
    },

    content: {
        display: 'flex',
        minHeight: 0,
        flexDirection: 'column',
        flex: 1,

        'ul > li, ul > div > li': {
            padding: `${token.paddingXXS}px ${token.paddingSM}px`
        }
    },

    collapse: {
        width: `${token.sizeXL * 2 + 1}px !important`
    }
}))
