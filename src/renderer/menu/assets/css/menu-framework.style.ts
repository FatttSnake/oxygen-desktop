import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        width: 'fit-content',
        height: '100vh',
        backgroundColor: token.colorBgContainer,
        overflow: 'hidden'
    }
}))
