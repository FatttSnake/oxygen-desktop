import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    renderRoot: {
        border: `1px solid ${token.colorBorder}`,
        height: '100%',
        width: '100%',
        flex: 1
    },

    device: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: token.colorBgElevated,
        width: 'fit-content',
        margin: '0 auto',
        borderRadius: 40
    },

    rotate: {
        flexDirection: 'row'
    },

    deviceHeader: {
        margin: '20px auto',
        width: 60,
        height: 10,
        borderRadius: 5,
        backgroundColor: token.colorBgMask
    },

    rotatedDeviceHeader: {
        margin: 'auto 20px',
        width: 10,
        height: 60
    },

    deviceContent: {
        margin: '0 10px',
        backgroundColor: token.colorBgLayout
    },

    rotatedDeviceContent: {
        margin: '10px 0'
    },

    deviceFooter: {
        margin: '20px auto',
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: token.colorBgMask
    },

    rotatedDeviceFooter: {
        margin: 'auto 20px'
    }
}))
