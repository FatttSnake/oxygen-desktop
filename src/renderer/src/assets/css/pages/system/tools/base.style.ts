import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        padding: 20,
        gap: 20,

        '> *:first-child': {
            width: 0,
            height: 'fit-content'
        },

        '> *:nth-child(2)': {
            position: 'sticky',
            top: 20,
            height: 'calc(100vh - 40px)'
        }
    },

    hasEdited: {
        '&::after': {
            content: '"*"',
            color: token.colorTextSecondary
        }
    },

    closeEditorBtn: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: token.colorBorder,
        width: 32,
        height: 32,
        borderRadius: '50%',
        color: token.colorTextSecondary,
        opacity: 0.6,
        boxShadow: token.boxShadow,
        cursor: 'pointer',
        zIndex: 1000
    }
}))
