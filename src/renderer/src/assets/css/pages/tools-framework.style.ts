import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
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
        backgroundColor: token.colorBgLayout
    }
}))
