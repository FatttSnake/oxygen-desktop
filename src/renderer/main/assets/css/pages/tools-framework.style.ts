import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        backgroundColor: token.colorBgContainer
    },

    leftPanel: {
        backgroundColor: token.colorBgContainer
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
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden'
    }
}))
