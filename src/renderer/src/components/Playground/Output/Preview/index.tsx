import useStyles from '@/components/Playground/Output/Preview/index.style'
import { IFiles, IImportMap } from '@/components/Playground/shared'
import Compiler from '@/components/Playground/compiler'
import Render from '@/components/Playground/Output/Preview/Render'

interface PreviewProps {
    iframeKey: string
    files: IFiles
    importMap: IImportMap
    entryPoint: string
    preExpansionCode?: string
    postExpansionCode?: string
    mobileMode?: boolean
}

const Preview = ({
    iframeKey,
    files,
    importMap,
    entryPoint,
    preExpansionCode = '',
    postExpansionCode = '',
    mobileMode = false
}: PreviewProps) => {
    const { styles } = useStyles()
    const [errorMsg, setErrorMsg] = useState('')
    const [compiledCode, setCompiledCode] = useState('')

    useEffect(() => {
        if (!Object.keys(files).length || !importMap || !entryPoint.length) {
            return
        }
        Compiler.compile(files, importMap, entryPoint)
            .then((result) => {
                setCompiledCode(
                    `(()=>{${preExpansionCode}})();\n(()=>{${result.outputFiles[0].text}})();\n(()=>{${postExpansionCode}})();`
                )
                setErrorMsg('')
            })
            .catch((e: Error) => {
                setErrorMsg(`编译失败：${e.message}`)
            })
    }, [files, Compiler, importMap, entryPoint])

    return (
        <div className={styles.root}>
            <Render iframeKey={iframeKey} compiledCode={compiledCode} mobileMode={mobileMode} />
            {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
        </div>
    )
}

Preview.Render = Render

export default Preview
