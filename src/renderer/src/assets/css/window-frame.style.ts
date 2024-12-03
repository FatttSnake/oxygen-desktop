import { createStyles } from 'antd-style'

export default createStyles(({ token }) => {
    const { x } = navigator.windowControlsOverlay!.getTitlebarAreaRect()

    return {
        root: {
            display: 'flex',
            flexDirection: 'column',
            width: '100vw',
            height: '100vh'
        },

        titleBar: {
            width: '100%',
            height: 31,
            backgroundColor: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorder}`,
            overflow: 'hidden',
            '-webkit-app-region': 'drag',
            '-webkit-user-select': 'none'
        },

        titleContent: {
            display: 'flex',
            width: '100%',
            height: '100%'
        },

        titleBarLeft: {
            display: 'flex',
            paddingLeft: token.paddingXS,
            width:
                x === 0
                    ? 'calc(100% - env(titlebar-area-x, 0) - env(titlebar-area-width, 100%))'
                    : 'env(titlebar-area-x, 0)',
            height: '100%',
            alignItems: 'center',
            fontSize: token.fontSizeXL
        },

        titleBarCenter: {
            display: 'flex',
            flex: 1,
            width: 0,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        },

        titleBarRight: {
            width:
                x === 0
                    ? 'calc(100% - env(titlebar-area-x, 0) - env(titlebar-area-width, 100%))'
                    : 'env(titlebar-area-x, 0)',
            height: '100%'
        },

        windowContent: {
            flex: 1,
            height: 0,
            width: '100%',
            overflow: 'hidden'
        }
    }
})
