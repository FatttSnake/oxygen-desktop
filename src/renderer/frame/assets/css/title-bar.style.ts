import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        display: 'flex',
        width: '100vw',
        height: 41,
        backgroundColor: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorder}`,
        overflow: 'hidden',
        userSelect: 'none',
        '-webkit-user-select': 'none',
        '-webkit-app-region': 'drag'
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
        fontSize: token.fontSizeXL,

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
        flex: 1,
        height: '100%',
        width: 0
    },

    titleBarRight: {
        width: 'calc(100% - env(titlebar-area-x, 0) - env(titlebar-area-width, 100%))',
        height: '100%'
    }
}))
