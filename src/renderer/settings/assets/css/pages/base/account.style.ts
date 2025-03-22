import { createStyles } from 'antd-style'

export default createStyles(({ token }) => ({
    qrCode: {
        width: token.sizeXXL * 6.5,
        height: token.sizeXXL * 6.5,
        backgroundColor: token.colorText,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center'
    }
}))
