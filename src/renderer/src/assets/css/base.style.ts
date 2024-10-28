import { createGlobalStyle } from 'antd-style'

export default createGlobalStyle(() => ({
    '*': { margin: 0, padding: 0, boxSizing: 'border-box' },
    html: { scrollBehavior: 'smooth' },
    'em, i': { fontStyle: 'normal' },
    li: { listStyle: 'none' },
    img: { border: 0, verticalAlign: 'middle' },
    button: { cursor: 'pointer' },
    a: { color: '#666', textDecoration: 'none', whiteSpace: 'nowrap' },
    'button, input': {
        fontFamily:
            'Microsoft YaHei, Heiti SC, tahoma, arial, Hiragino Sans GB, "\\5B8B\\4F53", sans-serif',
        border: 0,
        outline: 'none'
    },
    body: {
        WebkitFontSmoothing: 'antialiased',
        backgroundColor: '#fff',
        font: '12px/1.5 Microsoft YaHei, Heiti SC, tahoma, arial, Hiragino Sans GB, "\\5B8B\\4F53", sans-serif',
        color: '#666'
    },
    '.hide, .none': { display: 'none' },
    '.clearfix:after': {
        visibility: 'hidden',
        clear: 'both',
        display: 'block',
        content: '"."',
        height: 0
    },
    '.clearfix': { zoom: 1 }
}))
