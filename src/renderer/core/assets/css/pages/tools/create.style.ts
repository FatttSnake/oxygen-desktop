import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        padding: 20,
        gap: 20,
        height: '100%',
        width: '100%',

        '> *': {
            gap: 10,
            width: 0
        }
    },

    title: {
        flex: '0 0 auto',
        height: 40,

        '> *': {
            height: '100%',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: token.fontSizeXL,
            fontWeight: 'bolder',
            color: token.colorPrimary
        }
    },

    config: {
        padding: 20
    },

    createBt: {
        width: '100%',
        fontWeight: 'bold'
    },

    preview: {
        display: 'flex',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center'
    },

    noPreview: {
        color: token.colorTextSecondary,
        fontSize: token.fontSizeLG,
        fontWeight: 'bolder'
    }
}))
