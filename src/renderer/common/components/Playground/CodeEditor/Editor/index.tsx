import { editor, Selection } from 'monaco-editor'
import MonacoEditor, { Monaco } from '@monaco-editor/react'
import { shikiToMonaco } from '@shikijs/monaco'
import { createHighlighter } from 'shiki'
import useStyles from '$/assets/css/components/playground/code-editor/editor.style'
import { IEditorOptions, IFile, IFileTree } from '$/components/Playground/shared'
import {
    findNodeByKey,
    findNodeByPath,
    flattenFileTree,
    getImportMap,
    getPathByKey,
    getTsconfig,
    TSCONFIG_FILE_NAME,
    tsconfigJsonDiagnosticsOptions
} from '$/components/Playground/files'
import { useEditor, useTypesProgress } from '$/components/Playground/CodeEditor/Editor/hooks'
import { MonacoEditorConfig } from '$/components/Playground/CodeEditor/Editor/monacoConfig'

export interface ExtraLib {
    path: string
    content: string
}

interface EditorProps {
    isDarkMode?: boolean
    fileTree: IFileTree
    selectedFileKey: string
    readonly?: boolean
    extraLibs?: ExtraLib[]
    options?: IEditorOptions
    onEditorDidMount?: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void
    onChange?: (fileKey: string, content: string) => void
    onJumpFile?: (fileKey: string) => boolean
}

const Editor = ({
    isDarkMode = false,
    fileTree,
    selectedFileKey,
    readonly = false,
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
    const file: IFile = findNodeByKey(fileTree, selectedFileKey)?.node || {
        key: 'Unknown',
        fileName: 'Untitled',
        content: '',
        language: 'none'
    }
    const selectedFilePath = getPathByKey(fileTree, selectedFileKey)
    const importMap = useMemo(() => getImportMap(fileTree), [fileTree])

    const handleOnEditorWillMount = (monaco: Monaco) => {
        loadModel(monaco)

        createHighlighter({
            themes: ['vitesse-light', 'vitesse-dark'],
            langs: ['javascript', 'jsx', 'typescript', 'tsx', 'css', 'json']
        }).then((highlighter) => {
            shikiToMonaco(highlighter, monaco)
            monaco.editor.setTheme(isDarkMode ? 'vitesse-dark' : 'vitesse-light')
        })

        monaco.languages.json.jsonDefaults.setDiagnosticsOptions(tsconfigJsonDiagnosticsOptions)
        const tsconfig = getTsconfig(fileTree)
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions(tsconfig.compilerOptions)
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

        void autoLoadExtraLib(editor, monaco, file.content, onWatch, importMap)
    }

    const loadModel = (monaco: Monaco) => {
        const currentModels = new Set<string>()
        const fileMap = flattenFileTree(fileTree)
        fileMap.forEach((file, key) => {
            const uri = monaco.Uri.parse(`file:///${key}`)
            currentModels.add(uri.toString())

            const model = monaco.editor.getModel(uri)
            if (model) {
                if (model.getValue() !== file.content) {
                    model.setValue(file.content)
                }
            } else {
                monaco.editor.createModel(file.content, file.language, uri)
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
    }, [selectedFileKey])

    const tsconfigRaw = fileTree.children?.find(
        (item) => item.fileName === TSCONFIG_FILE_NAME
    )?.content
    useEffect(() => {
        try {
            monacoRef.current?.languages.typescript.typescriptDefaults.setCompilerOptions(
                getTsconfig(fileTree).compilerOptions
            )
        } catch {
            // invalid JSON — keep previous options
        }
    }, [tsconfigRaw])

    useEffect(() => {
        const monaco = monacoRef.current
        if (monaco) {
            loadModel(monaco)
        }
    }, [fileTree, selectedFileKey])

    useEffect(() => {
        customDoOpenEditorRef.current = (editor, input) => {
            const path = input.resource.path
            if (!['/lib.dom.d.ts', '/node_modules/'].some((item) => path.startsWith(item))) {
                const targetFile = path.replace(/^\//, '')
                if (
                    targetFile === selectedFilePath ||
                    onJumpFile?.(findNodeByPath(fileTree, targetFile)?.key ?? '')
                ) {
                    setTimeout(() => doOpenEditor(editor, input))
                }
            }
        }
    }, [onJumpFile])

    return (
        <div className={styles.root}>
            <MonacoEditor
                theme={isDarkMode ? 'vitesse-dark' : 'vitesse-light'}
                path={selectedFilePath}
                language={file.language}
                value={file.content}
                options={{
                    ...MonacoEditorConfig,
                    ...options,
                    theme: undefined,
                    readOnly: readonly
                }}
                onChange={(value) => onChange?.(selectedFileKey, value ?? '')}
                beforeMount={handleOnEditorWillMount}
                onMount={handleOnEditorDidMount}
            />
            {total > 0 && !finished && <div className={styles.loading} />}
        </div>
    )
}

export default Editor
