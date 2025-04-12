import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        backgroundColor: token.colorBgLayout
    },

    collapsed: {
        backgroundColor: token.colorBgContainer
    },

    leftPanel: {
        backgroundColor: token.colorBgContainer,
        borderRadius: `0 ${token.borderRadiusLG}px ${token.borderRadiusLG}px 0`,
        overflow: 'hidden'
    },

    menuDroppable: {
        display: 'flex',
        position: 'relative',
        minHeight: 0,
        flex: 1,
        width: '100%'
    },

    rightPanel: {
        flex: 1,
        width: 0,
        backgroundColor: token.colorBgLayout,
        borderRadius: `${token.borderRadiusLG}px 0 0 ${token.borderRadiusLG}px`,
        overflow: 'hidden'
    }
}))
