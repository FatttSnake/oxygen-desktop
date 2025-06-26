import useStyles from '$/assets/css/components/playground/index.style'
import { IFiles } from '$/components/Playground/shared'
import { usePlaygroundState } from '$/hooks/usePlaygroundState'
import { ENTRY_FILE_NAME } from '$/components/Playground/files'
import FlexBox from '$/components/FlexBox'
import CodeEditor from '$/components/Playground/CodeEditor'
import Output from '$/components/Playground/Output'

interface PlaygroundProps {
    isDarkMode?: boolean
    initialFiles: IFiles
    initialEntryPoint?: string
}

const Playground = ({
    isDarkMode,
    initialFiles,
    initialEntryPoint = ENTRY_FILE_NAME
}: PlaygroundProps) => {
    const { styles } = useStyles()
    const {
        files,
        selectedFileName,
        entryPoint,
        importMap,
        tsconfig,
        setSelectedFileName,
        updateFileContent,
        addFile,
        removeFile,
        renameFile,
        listenOnError
    } = usePlaygroundState(initialFiles, initialEntryPoint)

    return (
        <FlexBox className={styles.root} direction={'horizontal'}>
            <CodeEditor
                isDarkMode={isDarkMode}
                tsconfig={tsconfig}
                files={files}
                selectedFileName={selectedFileName}
                onSelectedFileChange={setSelectedFileName}
                onChangeFileContent={updateFileContent}
                onAddFile={addFile}
                onRenameFile={renameFile}
                onRemoveFile={removeFile}
                listenOnError={(listener) => listenOnError(() => listener)}
            />
            <Output
                isDarkMode={isDarkMode}
                files={files}
                selectedFileName={selectedFileName}
                importMap={importMap}
                entryPoint={entryPoint}
            />
        </FlexBox>
    )
}

Playground.CodeEditor = CodeEditor
Playground.Output = Output

export default Playground
