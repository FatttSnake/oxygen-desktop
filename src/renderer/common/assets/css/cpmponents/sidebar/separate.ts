import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    separate: {
        height: 0,
        margin: `${token.marginSM}px ${token.marginXS}px`,
        border: `1px solid ${token.colorBorder}`
    }
}))
