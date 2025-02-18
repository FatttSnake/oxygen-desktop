import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    search: {
        display: 'flex',
        position: 'sticky',
        width: '100%',
        marginTop: 20,
        top: 20,
        zIndex: 10,
        justifyContent: 'center',
        transition: 'all 0.3s ease',

        '> *': {
            width: '80%'
        }
    },

    hide: {
        transform: 'translateY(-60px)'
    },

    root: {
        padding: 20,
        gap: 20,
        flexWrap: 'wrap',
        justifyContent: 'center',

        '> div': {
            flex: '0 0 auto'
        }
    },

    noTool: {
        display: 'flex',
        justifyContent: 'center',
        fontSize: '1.4em',
        fontWeight: 'bolder',
        color: token.colorTextSecondary
    }
}))
