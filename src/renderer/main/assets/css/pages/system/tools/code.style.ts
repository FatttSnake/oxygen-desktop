import { createStyles } from 'antd-style'

export default createStyles(() => ({
    root: {
        padding: 20
    },

    rootBox: {
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
