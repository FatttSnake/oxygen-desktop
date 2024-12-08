import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto',
        height: 30,
        padding: '0 20px',
        color: token.colorText,
        border: `1px solid ${token.colorBorder}`,
        backgroundColor: token.colorBgLayout,
        borderRadius: '6px 6px 0 0',
        cursor: 'pointer'
    },

    active: {
        backgroundColor: token.colorBgElevated,
        borderBottom: 'none'
    },

    tabItemInput: {
        position: 'relative',
        minWidth: 40,
        transform: 'translateY(1px)',

        input: {
            position: 'absolute',
            backgroundColor: 'transparent',
            width: '100%',
            color: token.colorText,
            fontSize: token.fontSizeSM
        }
    },

    tabItemInputMask: {
        display: 'inline-block',
        color: 'transparent'
    },

    tabItemClose: {
        transform: 'translateX(10px)',

        svg: {
            height: token.sizeXS,
            fill: token.colorTextSecondary
        },

        '>:hover': {
            fill: token.colorTextDescription
        }
    }
}))
