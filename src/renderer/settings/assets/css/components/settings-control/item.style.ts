import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        display: 'flex',
        backgroundColor: token.colorBgContainer,
        padding: token.paddingSM,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: token.borderRadiusSM
    },

    clickable: {
        ':hover': {
            backgroundColor: token.colorBgTextHover
        },
        ':active': {
            backgroundColor: token.colorBgTextActive
        }
    },

    label: {
        display: 'flex',
        gap: token.sizeSM
    },

    icon: {
        fontSize: token.sizeLG
    },

    text: {
        display: 'flex',
        flexDirection: 'column'
    },

    name: {
        fontSize: token.fontSizeHeading5
    },

    desc: {
        color: token.colorTextSecondary
    },

    content: {
        fontSize: token.fontSize,

        '> .anticon': {
            fontSize: token.fontSizeHeading4
        }
    }
}))
