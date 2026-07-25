import { Monaco } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import useStyles from '$/assets/css/components/playground/code-editor/index.style'
import FlexBox from '$/components/FlexBox'
import { IEditorOptions, IFileTree } from '$/components/Playground/shared'
import { findNodeByKey } from '$/components/Playground/files'
import FileExplorer from '$/components/Playground/CodeEditor/FileExplorer'
import Editor, { ExtraLib } from '$/components/Playground/CodeEditor/Editor'

interface CodeEditorProps {
    isDarkMode?: boolean
    showFileExplorer?: boolean
    fileTree: IFileTree
    selectedFileKey: string
    readonly?: boolean
    options?: IEditorOptions
    extraLibs?: ExtraLib[]
    onEditorDidMount?: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void
    onSelectedFileChange?: (fileKey: string) => boolean
    onChangeFileContent?: (fileKey: string, content: string) => void
    onAddFile?: (fileName: string, isDir: boolean, parentKey: string) => boolean
    onRenameFile?: (fileKey: string, newFileName: string) => boolean
    onMoveFile?: (fileKey: string, newParentKey: string) => boolean
    onRemoveFile?: (fileKey: string) => boolean
    listenOnError?: (listener: ((message: string) => void) | undefined) => void
}

const CodeEditor = ({
    isDarkMode,
    showFileExplorer = true,
    fileTree,
    selectedFileKey,
    readonly,
    options,
    extraLibs,
    onEditorDidMount,
    onSelectedFileChange,
    onChangeFileContent,
    onAddFile,
    onRenameFile,
    onMoveFile,
    onRemoveFile,
    listenOnError
}: CodeEditorProps) => {
    const { styles } = useStyles()
    const [errorMsg, setErrorMsg] = useState('')
    const timer = useRef(-1)

    useEffect(() => {
        listenOnError?.((message) => {
            setErrorMsg(message)

            clearTimeout(timer.current)
            timer.current = setTimeout(() => {
                setErrorMsg('')
            }, 5e3)
        })

        return () => {
            listenOnError?.(undefined)
        }
    }, [])

    return (
        <FlexBox className={styles.root}>
            <AntdSplitter>
                {showFileExplorer && (
                    <AntdSplitter.Panel collapsible defaultSize={280}>
                        <FileExplorer
                            fileTree={fileTree}
                            selectedKey={selectedFileKey}
                            onSelect={onSelectedFileChange}
                            onAdd={onAddFile}
                            onRename={onRenameFile}
                            onMove={onMoveFile}
                            onRemove={onRemoveFile}
                        />
                    </AntdSplitter.Panel>
                )}
                <AntdSplitter.Panel>
                    <Editor
                        isDarkMode={isDarkMode}
                        fileTree={fileTree}
                        selectedFileKey={selectedFileKey}
                        readonly={readonly || !findNodeByKey(fileTree, selectedFileKey)}
                        extraLibs={extraLibs}
                        options={options}
                        onEditorDidMount={onEditorDidMount}
                        onChange={onChangeFileContent}
                        onJumpFile={onSelectedFileChange}
                    />
                    {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
                </AntdSplitter.Panel>
            </AntdSplitter>
        </FlexBox>
    )
}

CodeEditor.Editor = Editor
CodeEditor.FileExplorer = FileExplorer

export default CodeEditor
