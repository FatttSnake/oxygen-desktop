import { editor, Selection } from 'monaco-editor'
import MonacoEditor, { Monaco } from '@monaco-editor/react'
import { shikiToMonaco } from '@shikijs/monaco'
import { createHighlighter } from 'shiki'
import useStyles from '@/components/Playground/CodeEditor/Editor/index.style'
import '@/components/Playground/CodeEditor/Editor/loader'
import { IEditorOptions, IFiles, ITsconfig } from '@/components/Playground/shared'
import { fileNameToLanguage, tsconfigJsonDiagnosticsOptions } from '@/components/Playground/files'
import { useEditor, useTypesProgress } from '@/components/Playground/CodeEditor/Editor/hooks'
import { MonacoEditorConfig } from '@/components/Playground/CodeEditor/Editor/monacoConfig'

export interface ExtraLib {
    path: string
    content: string
}

interface EditorProps {
    isDarkMode?: boolean
    tsconfig?: ITsconfig
    files?: IFiles
    selectedFileName?: string
    readonly?: boolean
    onChange?: (code: string | undefined) => void
    options?: IEditorOptions
    onJumpFile?: (fileName: string) => void
    extraLibs?: ExtraLib[]
}

const Editor = ({
    isDarkMode,
    tsconfig,
    files = {},
    selectedFileName = '',
    readonly,
    onChange,
    options,
    onJumpFile,
    extraLibs = []
}: EditorProps) => {
    const { styles } = useStyles()
    const editorRef = useRef<editor.IStandaloneCodeEditor>()
    const monacoRef = useRef<Monaco>()
    const { doOpenEditor, autoLoadExtraLib } = useEditor()
    const { total, finished, onWatch } = useTypesProgress()
    const file = files[selectedFileName] || { name: 'Untitled' }

    const handleOnEditorWillMount = (monaco: Monaco) => {
        createHighlighter({
            themes: ['vitesse-light', 'vitesse-dark'],
            langs: ['javascript', 'jsx', 'typescript', 'tsx', 'css', 'json', 'xml']
        }).then((highlighter) => {
            shikiToMonaco(highlighter, monaco)
            monaco.editor.setTheme(isDarkMode ? 'vitesse-dark' : 'vitesse-light')
        })

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

        editor['_codeEditorService'].doOpenEditor = function (
            editor: editor.IStandaloneCodeEditor,
            input: { options: { selection: Selection }; resource: { path: string } }
        ) {
            const path = input.resource.path
            if (!['/lib.dom.d.ts', '/node_modules/'].some((item) => path.startsWith(item))) {
                onJumpFile?.(path.replace('/', ''))
                doOpenEditor(editor, input)
            }
        }

        extraLibs.forEach((item) =>
            monaco.languages.typescript.typescriptDefaults.addExtraLib(item.content, item.path)
        )

        void autoLoadExtraLib(editor, monaco, file.value, onWatch)
    }

    useEffect(() => {
        monacoRef.current?.editor.setTheme(isDarkMode ? 'vitesse-dark' : 'vitesse-light')
    }, [isDarkMode])

    useEffect(() => {
        editorRef.current?.focus()
    }, [file.name])

    useEffect(() => {
        tsconfig &&
            monacoRef.current?.languages.typescript.typescriptDefaults.setCompilerOptions(
                tsconfig.compilerOptions
            )
    }, [tsconfig])

    return (
        <>
            <div className={styles.root}>
                <MonacoEditor
                    theme={isDarkMode ? 'vitesse-dark' : 'vitesse-light'}
                    path={file.name}
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
                {total > 0 && !finished && <div className={styles.loading} />}
            </div>
        </>
    )
}

export default Editor
