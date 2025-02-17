import { createStyles } from 'antd-style'

export default createStyles(
    (
        _,
        props: {
            maxWidth: number
            minPadding: number
        }
    ) => ({
        root: {
            width: '100%',
            height: '100%',
            paddingLeft: `max(calc(50% - ${props.maxWidth / 2}px), ${props.minPadding}px)`,
            paddingRight: `max(calc(50% - ${props.maxWidth / 2}px), ${props.minPadding}px)`
        }
    })
)
