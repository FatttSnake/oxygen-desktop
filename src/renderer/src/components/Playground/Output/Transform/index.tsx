import MonacoEditor from '@monaco-editor/react'
import { Loader } from 'esbuild-wasm'
import '@/components/Playground/Output/Transform/transform.scss'
import { IFile, ITheme } from '@/components/Playground/shared'
import { cssToJs, jsonToJs, addReactImport } from '@/components/Playground/files'
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
        let _code = code
        if (['jsx', 'tsx'].includes(loader)) {
            _code = addReactImport(code)
        }

        Compiler?.transform(_code, loader)
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
                        setCompiledCode(cssToJs(file))
                        break
                    case 'json':
                        setCompiledCode(jsonToJs(file))
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
        <div data-component={'playground-transform'}>
            <MonacoEditor
                theme={theme}
                language={'javascript'}
                value={compiledCode}
                options={{ ...MonacoEditorConfig, readOnly: true }}
            />
            {errorMsg && <div className={'playground-error-message'}>{errorMsg}</div>}
        </div>
    )
}

export default Transform
