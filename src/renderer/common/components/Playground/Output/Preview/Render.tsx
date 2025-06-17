import useStyles from '$/assets/css/components/playground/output/preview-render.style'
import iframeRaw from '$/assets/template/playground/iframe.html?raw'

interface RenderProps {
    iframeKey: string
    compiledCode: string
    globalJsVariables?: Record<string, unknown>
    globalCssVariables?: string
}

interface IMessage {
    type: 'LOADED' | 'ERROR' | 'UPDATE' | 'DONE' | 'GLOBAL_VARIABLES'
    msg: string
    data: {
        compiledCode?: string
        zoom?: number
        globalJsVariables?: Record<string, unknown>
        globalCssVariables?: string
    }
}

const getIframeUrl = (iframeRaw: string) => {
    return URL.createObjectURL(new Blob([iframeRaw], { type: 'text/html' }))
}

const iframeUrl = getIframeUrl(iframeRaw)

const Render = ({
    iframeKey,
    compiledCode,
    globalJsVariables,
    globalCssVariables
}: RenderProps) => {
    const { styles } = useStyles()
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    const loadGlobalVariables = () => {
        iframeRef.current?.contentWindow?.postMessage(
            {
                type: 'GLOBAL_VARIABLES',
                data: { globalJsVariables, globalCssVariables }
            } as IMessage,
            '*'
        )
    }

    useEffect(() => {
        if (!isLoaded) {
            return
        }
        loadGlobalVariables()
        iframeRef.current?.contentWindow?.postMessage(
            {
                type: 'UPDATE',
                data: { compiledCode }
            } as IMessage,
            '*'
        )
    }, [isLoaded, compiledCode])

    useEffect(() => {
        if (!isLoaded) {
            return
        }
        loadGlobalVariables()
    }, [isLoaded, globalJsVariables, globalCssVariables])

    return (
        <iframe
            className={styles.renderRoot}
            key={iframeKey}
            ref={iframeRef}
            src={iframeUrl}
            onLoad={() => setIsLoaded(true)}
            sandbox={'allow-downloads allow-forms allow-modals allow-scripts'}
            allow={'clipboard-read; clipboard-write'}
        />
    )
}

export default Render
