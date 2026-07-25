import useStyles from '$/assets/css/components/playground/index.style'
import FlexBox from '$/components/FlexBox'
import { IFileTree } from '$/components/Playground/shared'
import { ENTRY_FILE_NAME } from '$/components/Playground/files'
import CodeEditor from '$/components/Playground/CodeEditor'
import Output from '$/components/Playground/Output'
import { usePlaygroundState } from '$/hooks/usePlaygroundState'

interface PlaygroundProps {
    isDarkMode?: boolean
    initialFileTree: IFileTree
    initialEntryPoint?: string
}

const Playground = ({
    isDarkMode,
    initialFileTree,
    initialEntryPoint = ENTRY_FILE_NAME
}: PlaygroundProps) => {
    const { styles } = useStyles()
    const {
        fileTree,
        selectedFileKey,
        setSelectedFileKey,
        updateFileContent,
        addFile,
        renameFile,
        moveFile,
        removeFile,
        listenOnError
    } = usePlaygroundState(initialFileTree, initialEntryPoint)

    return (
        <FlexBox className={styles.root} direction={'horizontal'}>
            <CodeEditor
                isDarkMode={isDarkMode}
                fileTree={fileTree}
                selectedFileKey={selectedFileKey}
                onSelectedFileChange={setSelectedFileKey}
                onChangeFileContent={updateFileContent}
                onAddFile={addFile}
                onRenameFile={renameFile}
                onMoveFile={moveFile}
                onRemoveFile={removeFile}
                listenOnError={listenOnError}
            />
            <Output isDarkMode={isDarkMode} fileTree={fileTree} selectedFileKey={selectedFileKey} />
        </FlexBox>
    )
}

Playground.CodeEditor = CodeEditor
Playground.Output = Output

export default Playground
