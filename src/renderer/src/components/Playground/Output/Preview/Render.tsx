import '@/components/Playground/Output/Preview/render.scss'
import iframeRaw from '@/components/Playground/Output/Preview/iframe.html?raw'

interface RenderProps {
    iframeKey: string
    compiledCode: string
}

interface IMessage {
    type: 'LOADED' | 'ERROR' | 'UPDATE' | 'DONE'
    msg: string
    data: {
        compiledCode: string
    }
}

const getIframeUrl = (iframeRaw: string) => {
    const shimsUrl = '//unpkg.com/es-module-shims/dist/es-module-shims.js'
    // 判断浏览器是否支持esm ，不支持esm就引入es-module-shims
    const newIframeRaw =
        typeof import.meta === 'undefined'
            ? iframeRaw.replace(
                  '<!-- es-module-shims -->',
                  `<script async src="${shimsUrl}"></script>`
              )
            : iframeRaw
    return URL.createObjectURL(new Blob([newIframeRaw], { type: 'text/html' }))
}

const iframeUrl = getIframeUrl(iframeRaw)

const Render = ({ iframeKey, compiledCode }: RenderProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        if (loaded) {
            iframeRef.current?.contentWindow?.postMessage(
                {
                    type: 'UPDATE',
                    data: { compiledCode }
                } as IMessage,
                '*'
            )
        }
    }, [compiledCode, loaded])

    return (
        <iframe
            data-component={'playground-output-preview-render'}
            key={iframeKey}
            ref={iframeRef}
            src={iframeUrl}
            onLoad={() => setLoaded(true)}
            sandbox="allow-downloads allow-forms allow-modals allow-scripts"
        />
    )
}

export default Render
