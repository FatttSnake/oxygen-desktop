import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        padding: 20
    },

    layout: {
        gap: token.sizeSM,
        width: '100%',
        height: '100%'
    }
}))
