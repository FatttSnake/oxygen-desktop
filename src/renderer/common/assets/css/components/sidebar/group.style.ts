import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        color: token.colorTextDescription,
        marginLeft: token.marginMD,
        marginTop: token.marginMD,
        marginBottom: token.marginXXS,

        ':first-child': {
            marginTop: 0
        }
    }
}))
