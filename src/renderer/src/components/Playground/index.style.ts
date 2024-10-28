import { createStyles } from 'antd-style'

export default createStyles(() => ({
    root: {
        width: '100%',
        height: '100%',

        '> *': {
            width: '0 !important'
        }
    }
}))
