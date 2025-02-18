import { createStyles } from 'antd-style'

export default createStyles(() => ({
    root: {
        display: 'flex',
        flex: '0 0 auto',
        height: 40
    },

    multiple: {
        flex: 1,
        width: 0
    },

    tabContent: {
        height: 40,
        alignItems: 'flex-end',
        gap: 2,
        marginLeft: 10
    },

    tabItemAdd: {
        padding: '0 12px'
    },

    tabsMarginRight: {
        height: '100%',

        '> *': {
            height: '100%',
            width: 10
        }
    },

    sticky: {
        display: 'flex',
        flex: '0 0 auto',
        alignItems: 'flex-end',
        marginRight: 10
    }
}))
