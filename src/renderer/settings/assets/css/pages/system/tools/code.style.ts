import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        padding: 20
    },

    layout: {
        gap: token.sizeSM,
        width: '100%',
        height: '100%'
    },

    draggableContent: {
        position: 'fixed',
        insetInlineEnd: 48,
        insetBlockEnd: 48,

        '> *': {
            position: 'relative',
            insetInlineEnd: 0,
            insetBlockEnd: 0
        }
    }
}))
