import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        padding: `0 ${token.paddingSM}px ${token.paddingSM}px`,
        backgroundColor: token.colorBgContainer
    },

    dropMaskBorder: {
        display: 'flex',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        border: `2px dashed ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
        fontSize: token.fontSizeHeading3
    }
}))
