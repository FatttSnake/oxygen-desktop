import { createStyles, keyframes } from 'antd-style'

const rotate = keyframes`
    0% {
        transform: rotateZ(0);
    }

    100% {
        transform: rotateZ(360deg);
    }
`

export default createStyles(() => ({
    root: {
        position: 'relative',
        height: 0
    },

    loading: {
        position: 'absolute',
        top: 0,
        right: 0,
        margin: 4,
        width: 10,
        height: 10,
        borderRadius: '50%',
        borderTop: '2px #666 solid',
        borderRight: '2px #ddd solid',
        borderBottom: '2px #ddd solid',
        borderLeft: '2px #ddd solid',
        animation: `${rotate} .6s linear infinite`
    }
}))
