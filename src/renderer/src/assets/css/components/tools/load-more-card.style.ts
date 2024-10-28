import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',

        '>*': {
            flex: '0 0 auto'
        }
    },

    icon: {
        fontSize: token.sizeXXL,
        color: token.colorPrimary
    },

    text: {
        fontSize: token.fontSizeXL,
        fontWeight: 'bolder'
    }
}))
