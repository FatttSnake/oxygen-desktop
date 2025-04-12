import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        display: 'flex',
        flex: 1,
        height: 0,
        backgroundColor: token.colorBgLayout,
        overflow: 'hidden',
        visibility: 'hidden'
    },

    visible: {
        visibility: 'visible'
    },

    collapsed: {
        backgroundColor: token.colorBgContainer
    },

    menu: {
        backgroundColor: token.colorBgContainer,
        borderRadius: `0 ${token.borderRadiusLG}px ${token.borderRadiusLG}px 0`
    },

    content: {
        flex: 1,
        backgroundColor: token.colorBgLayout,
        borderRadius: `${token.borderRadiusLG}px 0 0 ${token.borderRadiusLG}px`,
        overflow: 'hidden'
    }
}))
