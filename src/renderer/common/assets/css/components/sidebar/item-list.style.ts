import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        paddingTop: token.paddingXS,

        '.dnd-over-mask > li > div': {
            border: `1px dashed ${token.colorErrorHover}`,
            filter: `drop-shadow(1000px 0 0 ${token.colorErrorHover})`,
            transform: 'translate(-1000px)',

            '> a': {
                backgroundColor: 'transparent !important'
            }
        }
    }
}))
