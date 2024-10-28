import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        position: 'relative',
        width: '100%',
        height: '100%'
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
