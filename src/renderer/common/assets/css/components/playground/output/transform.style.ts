import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        position: 'relative',
        height: 0
    },

    errorMessage: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        color: token.colorErrorText,
        backgroundColor: token.colorErrorBg,
        padding: '5px 10px',
        fontSize: token.fontSize
    }
}))
