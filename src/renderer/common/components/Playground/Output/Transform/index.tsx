import { ReactNode } from 'react'
import MonacoEditor from '@monaco-editor/react'
import { Loader } from 'esbuild-wasm'
import useStyles from '$/assets/css/components/playground/output/transform.style'
import { IFile } from '$/components/Playground/shared'
import { cssToJs, jsonToJs } from '$/components/Playground/files'
import Compiler, { handleBuildError } from '$/components/Playground/compiler'
import { MonacoEditorConfig } from '$/components/Playground/CodeEditor/Editor/monacoConfig'

interface OutputProps {
    isDarkMode?: boolean
    file?: IFile
}

const Transform = ({ isDarkMode, file }: OutputProps) => {
    const { styles } = useStyles()
    const [compiledCode, setCompiledCode] = useState('')
    const [errorMsg, setErrorMsg] = useState<ReactNode>(undefined)

    const compile = (code: string, loader: Loader) => {
        Compiler?.transform(code, loader)
            .then((value) => {
                setCompiledCode(value.code)
                setErrorMsg(undefined)
            })
            .catch((e) => {
                const formattedError = handleBuildError(e)
                console.error(formattedError)
                setErrorMsg(`编译失败：${formattedError}`)
            })
    }

    useEffect(() => {
        if (file) {
            try {
                const code = file.content

                switch (file.language) {
                    case 'typescript':
                        compile(code, 'tsx')
                        break
                    case 'javascript':
                        compile(code, 'jsx')
                        break
                    case 'css':
                        setCompiledCode(cssToJs(file.content))
                        break
                    case 'json':
                        setCompiledCode(jsonToJs(file.content))
                        break
                }
            } catch (e) {
                console.error(e)
                setCompiledCode('')
            }
        } else {
            setCompiledCode('')
        }
    }, [file, Compiler])

    return (
        <div className={styles.root}>
            <MonacoEditor
                key={Date.now()}
                theme={isDarkMode ? 'vitesse-dark' : 'vitesse-light'}
                language={'javascript'}
                value={compiledCode}
                options={{ ...MonacoEditorConfig, readOnly: true }}
            />
            {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
        </div>
    )
}

export default Transform
