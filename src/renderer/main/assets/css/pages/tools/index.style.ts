import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        padding: 20,
        gap: 20
    },

    ownContent: {
        gap: 20,
        flexWrap: 'wrap',
        justifyContent: 'flex-start',

        '> div': {
            flex: '0 0 auto'
        }
    },

    favoriteDivider: {
        alignItems: 'center',
        gap: 20,
        marginTop: 20,

        '> :first-child, > :last-child': {
            height: 0,
            border: `1px dashed ${token.colorSplit}`
        }
    },

    dividerText: {
        flex: '0 0 auto !important',
        fontSize: '1.2em',
        color: token.colorTextSecondary
    },

    starContent: {
        gap: 20,
        flexWrap: 'wrap',
        justifyContent: 'flex-start',

        '> div': {
            flex: '0 0 auto'
        }
    }
}))
