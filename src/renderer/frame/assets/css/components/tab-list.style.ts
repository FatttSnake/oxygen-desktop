import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        height: 40,
        padding: `0 ${token.paddingSM}px`
    },

    droppable: {
        display: 'flex',
        alignItems: 'center',
        height: '100%'
    },

    sortable: {
        height: '100%',

        '&.dnd-over-mask': {
            '> div': {
                background: 'transparent !important',
                border: `1px dashed ${token.colorBorder}`,
                color: token.colorBorder
            }
        }
    }
}))
