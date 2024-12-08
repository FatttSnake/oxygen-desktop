import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        width: 180,
        height: 290,
        textAlign: 'center',
        gap: token.sizeXXL,
        cursor: 'pointer',
        '> *': {
            flex: '0 0 auto',
            display: 'block'
        }
    },
    icon: {
        marginTop: 80,
        color: token.colorPrimary,
        fontSize: token.sizeXXL
    },
    text: {
        fontWeight: 'bolder',
        fontSize: token.fontSizeXL
    }
}))
