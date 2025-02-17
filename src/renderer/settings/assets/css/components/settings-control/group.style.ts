import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: { gap: token.sizeSM },

    title: {
        fontSize: token.fontSizeHeading5,
        fontWeight: token.fontWeightStrong
    },

    content: {
        gap: token.sizeXXS
    }
}))
