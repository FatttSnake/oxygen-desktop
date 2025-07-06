import { editor, Selection } from 'monaco-editor'
import MonacoEditor, { Monaco } from '@monaco-editor/react'
import { shikiToMonaco } from '@shikijs/monaco'
import { createHighlighter } from 'shiki'
import useStyles from '$/assets/css/components/playground/code-editor/editor.style'
import { IEditorOptions, IFile, ITsconfig } from '$/components/Playground/shared'
import { fileNameToLanguage, tsconfigJsonDiagnosticsOptions } from '$/components/Playground/files'
import { useEditor, useTypesProgress } from '$/components/Playground/CodeEditor/Editor/hooks'
import { MonacoEditorConfig } from '$/components/Playground/CodeEditor/Editor/monacoConfig'

export interface ExtraLib {
    path: string
    content: string
}

interface EditorProps {
    isDarkMode?: boolean
    tsconfig?: ITsconfig
    files?: Record<string, IFile>
    selectedFileName?: string
    readonly?: boolean
    extraLibs?: ExtraLib[]
    options?: IEditorOptions
    onEditorDidMount?: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void
    onChange?: (fileName: string, code: string) => void
    onJumpFile?: (fileName: string) => boolean
}

const Editor = ({
    isDarkMode,
    tsconfig,
    files = {},
    selectedFileName = '',
    readonly,
    extraLibs = [],
    options,
    onEditorDidMount,
    onChange,
    onJumpFile
}: EditorProps) => {
    const { styles } = useStyles()
    const editorRef = useRef<editor.IStandaloneCodeEditor>()
    const monacoRef = useRef<Monaco>()
    const customDoOpenEditorRef =
        useRef<
            (
                editor: editor.IStandaloneCodeEditor,
                input: { options: { selection: Selection }; resource: { path: string } }
            ) => void
        >()
    const { doOpenEditor, autoLoadExtraLib } = useEditor()
    const { total, finished, onWatch } = useTypesProgress()
    const file = files[selectedFileName] || { name: 'Untitled' }

    const handleOnEditorWillMount = (monaco: Monaco) => {
        loadModel(monaco)

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
    }

    const handleOnEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor
        monacoRef.current = monaco

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            editor.getAction('editor.action.formatDocument')?.run()
        })

        editor['_codeEditorService'].doOpenEditor = (
            editor: editor.IStandaloneCodeEditor,
            input: { options: { selection: Selection }; resource: { path: string } }
        ) => {
            customDoOpenEditorRef.current?.(editor, input)
        }

        extraLibs.forEach((item) =>
            monaco.languages.typescript.typescriptDefaults.addExtraLib(item.content, item.path)
        )

        onEditorDidMount?.(editor, monaco)

        void autoLoadExtraLib(editor, monaco, file.value, onWatch)
    }

    const loadModel = (monaco: Monaco) => {
        const currentModels = new Set<string>()

        Object.entries(files).forEach(([key, file]) => {
            const uri = monaco.Uri.parse(`file:///${key}`)
            currentModels.add(uri.toString())

            const model = monaco.editor.getModel(uri)
            if (model) {
                if (model.getValue() !== file.value) {
                    model.setValue(file.value)
                }
            } else {
                monaco.editor.createModel(file.value, fileNameToLanguage(key), uri)
            }
        })

        monaco.editor.getModels().forEach((model) => {
            if (!currentModels.has(model.uri.toString())) {
                model.dispose()
            }
        })
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

    useEffect(() => {
        const monaco = monacoRef.current
        if (monaco) {
            loadModel(monaco)
        }
    }, [files, selectedFileName])

    useEffect(() => {
        customDoOpenEditorRef.current = (editor, input) => {
            const path = input.resource.path
            if (!['/lib.dom.d.ts', '/node_modules/'].some((item) => path.startsWith(item))) {
                const targetFile = path.replace('/', '')
                if (targetFile === selectedFileName || onJumpFile?.(targetFile)) {
                    setTimeout(() => doOpenEditor(editor, input))
                }
            }
        }
    }, [onJumpFile])

    return (
        <div className={styles.root}>
            <MonacoEditor
                theme={isDarkMode ? 'vitesse-dark' : 'vitesse-light'}
                path={file.name}
                language={file.language}
                value={file.value}
                options={{
                    ...MonacoEditorConfig,
                    ...options,
                    theme: undefined,
                    readOnly: readonly
                }}
                onChange={(value) => onChange?.(selectedFileName, value ?? '')}
                beforeMount={handleOnEditorWillMount}
                onMount={handleOnEditorDidMount}
            />
            {total > 0 && !finished && <div className={styles.loading} />}
        </div>
    )
}

export default Editor
