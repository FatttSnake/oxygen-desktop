import MonacoEditor from '@monaco-editor/react'
import { Loader } from 'esbuild-wasm'
import styles from '@/components/Playground/Output/Transform/index.module.less'
import { IFile, ITheme } from '@/components/Playground/shared'
import { cssToJsFromFile, jsonToJsFromFile } from '@/components/Playground/files'
import Compiler from '@/components/Playground/compiler'
import { MonacoEditorConfig } from '@/components/Playground/CodeEditor/Editor/monacoConfig'

interface OutputProps {
    file: IFile
    theme?: ITheme
}

const Transform = ({ file, theme }: OutputProps) => {
    const [compiledCode, setCompiledCode] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const compile = (code: string, loader: Loader) => {
        Compiler?.transform(code, loader)
            .then((value) => {
                setCompiledCode(value.code)
                setErrorMsg('')
            })
            .catch((e: Error) => {
                setErrorMsg(`编译失败：${e.message}`)
            })
    }

    useEffect(() => {
        if (file) {
            try {
                const code = file.value

                switch (file.language) {
                    case 'typescript':
                        compile(code, 'tsx')
                        break
                    case 'javascript':
                        compile(code, 'jsx')
                        break
                    case 'css':
                        setCompiledCode(cssToJsFromFile(file))
                        break
                    case 'json':
                        setCompiledCode(jsonToJsFromFile(file))
                        break
                    case 'xml':
                        setCompiledCode(code)
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
                theme={theme}
                language={'javascript'}
                value={compiledCode}
                options={{ ...MonacoEditorConfig, readOnly: true }}
            />
            {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
        </div>
    )
}

export default Transform
