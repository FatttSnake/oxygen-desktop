import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: { display: 'flex', alignItems: 'center', gap: token.sizeLG, marginBottom: -token.sizeLG },

    avatar: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: token.sizeXXL * 2,
        height: token.sizeXXL * 2,
        fontSize: token.sizeXXL,
        border: `2px ${token.colorBorder} solid`,
        borderRadius: '50%',
        overflow: 'hidden',
        cursor: 'pointer',

        img: {
            width: '100%',
            height: '100%'
        }
    },

    info: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    },

    nickname: {
        fontSize: token.fontSizeHeading2,
        fontWeight: token.fontWeightStrong,
        color: token.colorPrimary
    },

    url: {
        display: 'flex',
        alignItems: 'center',
        gap: token.sizeXXS,
        cursor: 'pointer'
    },

    modifyNickname: {
        color: token.colorTextSecondary,
        width: 'fit-content',
        cursor: 'pointer',

        ':hover': {
            background: token.colorBgTextHover
        }
    }
}))
