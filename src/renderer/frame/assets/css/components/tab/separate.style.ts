import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        width: 1,
        minWidth: 1,
        height: 16,
        marginTop: token.paddingXS,
        marginLeft: -1,
        backgroundColor: token.colorBorder,

        ':has(+ :hover)': {
            opacity: 0
        },

        ':has(+ .active)': {
            opacity: 0
        }
    }
}))
