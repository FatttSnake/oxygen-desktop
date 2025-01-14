import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    item: {
        fontSize: token.fontSizeHeading5,
        padding: '4px 12px'
    },

    menuBt: {
        display: 'flex',
        alignItems: 'center',
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
        height: 40,
        cursor: 'pointer',

        ':hover': {
            backgroundColor: token.colorBgLayout
        }
    },

    active: {
        background: `${token.colorPrimary} !important`
    },

    icon: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: `0 ${token.paddingXS}px`,
        width: 40,
        height: 40,
        fontSize: token.sizeMD,
        img: {
            width: '100%'
        }
    },

    text: {
        flex: 1,
        paddingLeft: token.paddingXS,
        width: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },

    collapsedText: {
        display: 'none'
    }
}))
