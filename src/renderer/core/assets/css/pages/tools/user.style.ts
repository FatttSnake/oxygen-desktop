import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        padding: '80px 20px 20px 20px'
    },

    content: {
        width: '100%',
        height: '100%',
        overflow: 'visible',
        alignItems: 'center',
        minWidth: 900,
        paddingBottom: 20
    },

    info: {
        marginLeft: 40,
        transform: 'translateY(-40px)',

        '> *': {
            flex: '0 0 auto !important'
        }
    },

    avatarBox: {
        backgroundColor: token.colorBgLayout,
        padding: 4,
        borderRadius: '50%',
        boxShadow: token.boxShadow
    },

    avatar: {
        backgroundColor: 'transparent !important'
    },

    infoName: {
        margin: '20px 0 0 20px',
        justifyContent: 'center',

        '> *': {
            flex: '0 0 auto'
        }
    },

    nickname: {
        fontSize: token.fontSizeHeading2,
        fontWeight: 'bolder',
        color: token.colorPrimary
    },

    url: {
        cursor: 'pointer',

        '> span': {
            marginLeft: 8
        }
    },

    tools: {
        padding: 20,
        gap: 20,
        flexWrap: 'wrap',
        justifyContent: 'center',

        '> div': {
            flex: '0 0 auto',

            '> div': {
                backgroundColor: token.colorBgLayout
            }
        }
    },

    noTool: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 20,
        fontSize: token.fontSizeLG,
        color: token.colorTextSecondary
    }
}))
