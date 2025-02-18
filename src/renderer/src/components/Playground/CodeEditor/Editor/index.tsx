import { editor, Selection } from 'monaco-editor'
import MonacoEditor, { Monaco } from '@monaco-editor/react'
import '@/components/Playground/CodeEditor/Editor/editor.scss'
import '@/components/Playground/CodeEditor/Editor/loader'
import { IEditorOptions, IFiles, ITheme, ITsconfig } from '@/components/Playground/shared'
import { fileNameToLanguage, tsconfigJsonDiagnosticsOptions } from '@/components/Playground/files'
import { useEditor, useTypesProgress } from '@/components/Playground/CodeEditor/Editor/hooks'
import { MonacoEditorConfig } from '@/components/Playground/CodeEditor/Editor/monacoConfig'

interface EditorProps {
    tsconfig?: ITsconfig
    files?: IFiles
    selectedFileName?: string
    readonly?: boolean
    onChange?: (code: string | undefined) => void
    options?: IEditorOptions
    theme?: ITheme
    onJumpFile?: (fileName: string) => void
}

const Editor = ({
    tsconfig,
    files = {},
    selectedFileName = '',
    readonly,
    theme,
    onChange,
    options,
    onJumpFile
}: EditorProps) => {
    const editorRef = useRef<editor.IStandaloneCodeEditor>()
    const monacoRef = useRef<Monaco>()
    const { doOpenEditor, loadJsxSyntaxHighlight, autoLoadExtraLib } = useEditor()
    const jsxSyntaxHighlightRef = useRef<{
        highlighter: (code?: string | undefined) => void
        dispose: () => void
    }>({
        highlighter: () => undefined,
        dispose: () => undefined
    })
    const { total, finished, onWatch } = useTypesProgress()
    const file = files[selectedFileName] || { name: 'Untitled' }

    const handleOnEditorWillMount = (monaco: Monaco) => {
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions(tsconfigJsonDiagnosticsOptions)
        tsconfig &&
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
                tsconfig.compilerOptions
            )

        if (files) {
            monaco.editor.getModels().forEach((model) => model.dispose())
            Object.entries(files).forEach(([key]) => {
                if (!monaco.editor.getModel(monaco.Uri.parse(`file:///${key}`))) {
                    monaco.editor.createModel(
                        files[key].value,
                        fileNameToLanguage(key),
                        monaco.Uri.parse(`file:///${key}`)
                    )
                }
            })
        }
    }

    const handleOnEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            void editor.getAction('editor.action.formatDocument')?.run()
        })

        monacoRef.current = monaco

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        editor['_codeEditorService'].doOpenEditor = function (
            editor: editor.IStandaloneCodeEditor,
            input: { options: { selection: Selection }; resource: { path: string } }
        ) {
            const path = input.resource.path
            if (!path.startsWith('/node_modules/')) {
                onJumpFile?.(path.replace('/', ''))
                doOpenEditor(editor, input)
            }
        }

        jsxSyntaxHighlightRef.current = loadJsxSyntaxHighlight(editor, monaco)

        void autoLoadExtraLib(editor, monaco, file.value, onWatch)
    }

    useEffect(() => {
        editorRef.current?.focus()
        jsxSyntaxHighlightRef?.current?.highlighter?.()
    }, [file.name])

    useEffect(() => {
        tsconfig &&
            monacoRef.current?.languages.typescript.typescriptDefaults.setCompilerOptions(
                tsconfig.compilerOptions
            )
    }, [tsconfig])

    return (
        <>
            <div data-component={'playground-code-editor-editor'}>
                <MonacoEditor
                    theme={theme}
                    path={file.name}
                    className={`monaco-editor-${theme ?? 'light'}`}
                    language={file.language}
                    value={file.value}
                    onChange={onChange}
                    beforeMount={handleOnEditorWillMount}
                    onMount={handleOnEditorDidMount}
                    options={{
                        ...MonacoEditorConfig,
                        ...options,
                        theme: undefined,
                        readOnly: readonly
                    }}
                />
                {total > 0 && !finished && <div className={'playground-code-editor-loading'} />}
            </div>
        </>
    )
}

export default Editor
