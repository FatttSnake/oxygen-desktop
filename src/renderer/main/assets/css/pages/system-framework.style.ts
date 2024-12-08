import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    leftPanel: {
        backgroundColor: token.colorBgContainer
    },

    rightPanel: {
        flex: 1,
        width: 0,
        backgroundColor: token.colorBgLayout
    }
}))
