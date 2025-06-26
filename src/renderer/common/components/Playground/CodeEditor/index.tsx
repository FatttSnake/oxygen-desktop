import { Monaco } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import useStyles from '$/assets/css/components/playground/code-editor/index.style'
import FlexBox from '$/components/FlexBox'
import { IEditorOptions, IFiles, ITsconfig } from '$/components/Playground/shared'
import FileSelector from '$/components/Playground/CodeEditor/FileSelector'
import Editor, { ExtraLib } from '$/components/Playground/CodeEditor/Editor'

interface CodeEditorProps {
    isDarkMode?: boolean
    showFileSelector?: boolean
    tsconfig?: ITsconfig
    files: IFiles
    selectedFileName: string
    readonly?: boolean
    readonlyFiles?: string[]
    notRemovableFiles?: string[]
    options?: IEditorOptions
    extraLibs?: ExtraLib[]
    onEditorDidMount?: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void
    onSelectedFileChange?: (fileName: string) => boolean
    onChangeFileContent?: (content: string, fileName: string) => void
    onAddFile?: (fileName: string) => boolean
    onRenameFile?: (newFileName: string, oldFileName: string) => boolean
    onRemoveFile?: (fileName: string) => boolean
    listenOnError?: (listener: ((message: string) => void) | undefined) => void
}

const CodeEditor = ({
    isDarkMode,
    showFileSelector = true,
    tsconfig,
    files,
    selectedFileName,
    readonly,
    readonlyFiles,
    notRemovableFiles,
    options,
    extraLibs,
    onEditorDidMount,
    onSelectedFileChange,
    onChangeFileContent,
    onAddFile,
    onRenameFile,
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
            {showFileSelector && (
                <FileSelector
                    files={files}
                    readonly={readonly}
                    notRemovableFiles={notRemovableFiles}
                    selectedFileName={selectedFileName}
                    onChange={onSelectedFileChange}
                    onAddFile={onAddFile}
                    onUpdateFileName={onRenameFile}
                    onRemoveFile={onRemoveFile}
                />
            )}
            <Editor
                isDarkMode={isDarkMode}
                tsconfig={tsconfig}
                selectedFileName={selectedFileName}
                files={files}
                readonly={
                    readonly ||
                    readonlyFiles?.includes(selectedFileName) ||
                    !files[selectedFileName]
                }
                extraLibs={extraLibs}
                options={options}
                onEditorDidMount={onEditorDidMount}
                onChange={onChangeFileContent}
                onJumpFile={onSelectedFileChange}
            />
            {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
        </FlexBox>
    )
}

CodeEditor.Editor = Editor
CodeEditor.FileSelector = FileSelector

export default CodeEditor
