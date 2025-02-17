import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        display: 'flex',
        width: '100vw',
        height: 40,
        minHeight: 40,
        backgroundColor: token.colorBgContainer,
        overflow: 'hidden',
        userSelect: 'none',
        '-webkit-user-select': 'none',
        '-webkit-app-region': 'drag'
    },

    btn: {
        width: 28,
        height: 28,
        color: token.colorTextSecondary,
        backgroundColor: 'transparent',
        borderRadius: token.borderRadius,
        fontSize: token.size,

        ':hover': {
            backgroundColor: token.colorBgTextHover
        }
    },

    titleBarLeft: {
        width: 'env(titlebar-area-x, 0)',
        height: '100%'
    },

    titleBarCenter: {
        display: 'flex',
        flex: 1,
        width: 0,
        height: '100%',
        alignItems: 'center'
    },

    operation: {
        display: 'flex',
        alignItems: 'center',
        gap: token.sizeSM,
        padding: `0 ${token.paddingSM}px`,
        height: '100%',
        fontSize: token.sizeLG,

        button: {
            '-webkit-app-region': 'no-drag'
        }
    },

    expandIcon: {
        transform: 'rotateZ(180deg)',
        transition: 'all 0.3s'
    },

    collapse: {
        transform: 'rotateZ(360deg)'
    },

    tabs: {
        position: 'relative',
        flex: 1,
        height: '100%',
        width: 0,

        '::before, ::after': {
            position: 'absolute',
            content: '""',
            top: 0,
            height: '100%',
            width: token.sizeSM,
            zIndex: token.zIndexPopupBase * 2
        },

        '::before': {
            left: 0,
            background: `linear-gradient(to right, ${token.colorBgContainer}ff, ${token.colorBgContainer}00)`
        },

        '::after': {
            right: 0,
            background: `linear-gradient(to left, ${token.colorBgContainer}ff, ${token.colorBgContainer}00)`
        }
    },

    settings: {
        margin: `0 ${token.marginSM}px`,
        '-webkit-app-region': 'no-drag'
    },

    titleBarRight: {
        width: 'calc(100% - env(titlebar-area-x, 0) - env(titlebar-area-width, 100%))',
        height: '100%'
    }
}))
