import { createStyles } from 'antd-style'

export default createStyles(() => ({
    root: {
        padding: 20
    },

    rootBox: {
        width: '100%',
        height: '100%'
    },

    content: {
        position: 'relative',
        width: '100%',
        height: '100%',

        '> *': {
            width: 0
        }
    },

    draggableMask: {
        position: 'absolute',
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
