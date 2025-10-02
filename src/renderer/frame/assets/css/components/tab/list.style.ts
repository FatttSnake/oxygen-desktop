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

        '&.dnd-dragging': {
            zIndex: '1000000 !important',
            '> div': {
                background: token.colorBgTextHover,
                borderRadius: token.borderRadius,

                '::before,::after': {
                    opacity: 0
                },
                '>div:first-child,>div:last-child': {
                    opacity: 0
                },
                '>div:nth-child(4)': {
                    opacity: 0
                }
            }
        },

        '&.dnd-out-of-over-mask': {
            '> div': {
                background: 'transparent !important',
                border: `1px dashed ${token.colorBorder}`,
                color: token.colorBorder,
                borderRadius: token.borderRadius,

                '::before,::after': {
                    opacity: 0
                },

                '>div:first-child,>div:last-child': {
                    opacity: 0
                }
            }
        }
    }
}))
