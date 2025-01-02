import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    separate: {
        height: 0,
        margin: `${token.marginSM}px ${token.marginXS}px 0`,
        border: `1px solid ${token.colorBorder}`
    }
}))
