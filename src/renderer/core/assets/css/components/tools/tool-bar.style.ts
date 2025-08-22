import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        flex: '0 0 auto',
        padding: token.paddingSM
    },

    content: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        textWrap: 'nowrap'
    },

    left: {
        alignItems: 'center',
        gap: token.sizeXS
    },

    title: {
        fontSize: token.fontSizeXL
    },

    right: {
        alignItems: 'center',
        gap: token.sizeMD,
        marginRight: token.marginSM
    }
}))
