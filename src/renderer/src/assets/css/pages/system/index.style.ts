import { createStyles } from 'antd-style'

export default createStyles(() => ({
    root: {
        padding: 20,
        gap: 20,
        flexWrap: 'wrap',
        justifyContent: 'flex-start',

        '> *': {
            flex: '0 0 auto',
            overflow: 'hidden !important'
        }
    }
}))
