import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
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
        '-webkit-app-region': 'drag',
        '-webkit-user-select': 'none'
    },

    titleContent: {
        display: 'flex',
        marginLeft: 'env(titlebar-area-x, 0);',
        width: 'env(titlebar-area-width, 100%)'
    },

    titleBarLeft: {
        flex: 1,
        width: 0
    },

    titleBarRight: {},

    windowContent: {
        flex: 1,
        height: 0
    }
}))
