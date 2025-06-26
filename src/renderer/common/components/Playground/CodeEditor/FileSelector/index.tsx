import useStyles from '$/assets/css/components/playground/code-editor/file-selector.style'
import HideScrollbar, { HideScrollbarElement } from '$/components/HideScrollbar'
import FlexBox from '$/components/FlexBox'
import { IFile } from '$/components/Playground/shared'
import { IMPORT_MAP_FILE_NAME, TSCONFIG_FILE_NAME } from '$/components/Playground/files'
import Item from '$/components/Playground/CodeEditor/FileSelector/Item'

interface FileSelectorProps {
    files?: Record<string, IFile>
    selectedFileName?: string
    readonly?: boolean
    notRemovableFiles?: string[]
    onChange?: (fileName: string) => boolean
    onAddFile?: (fileName: string) => boolean
    onUpdateFileName?: (oldFileName: string, newFileName: string) => boolean
    onRemoveFile?: (fileName: string) => boolean
}

const FileSelector = ({
    files = {},
    selectedFileName = '',
    readonly = false,
    notRemovableFiles = [],
    onChange,
    onAddFile,
    onUpdateFileName,
    onRemoveFile
}: FileSelectorProps) => {
    const { styles } = useStyles()
    const hideScrollbarRef = useRef<HideScrollbarElement>(null)
    const [editingFileName, setEditingFileName] = useState<string>()
    const [isCreating, setIsCreating] = useState(false)

    const handleOnClickTab = (fileName: string) => {
        if (editingFileName || isCreating) {
            return
        }

        onChange?.(fileName)
    }

    const handleOnChangeFileName = (oldFileName: string, newFileName: string) => {
        if (oldFileName === newFileName) {
            setEditingFileName(undefined)
            return true
        }

        if (onUpdateFileName?.(oldFileName, newFileName) ?? true) {
            setEditingFileName(undefined)
            return true
        }

        return false
    }

    const getMaxSequenceTabName = () => {
        const result = Object.keys(files).reduce((max, filesName) => {
            const match = filesName.match(/Component(\d+)\.tsx/)
            if (match) {
                const sequenceNumber = parseInt(match[1], 10)
                return Math.max(Number(max), sequenceNumber)
            }
            return max
        }, 0)

        return `Component${result + 1}.tsx`
    }

    const handleOnAddTab = () => {
        if (editingFileName || isCreating) {
            return
        }

        setIsCreating(true)
        setTimeout(() => {
            hideScrollbarRef.current?.scrollRight(1000)
        })
    }

    const handleOnAddFile = (newFileName: string) => {
        if (onAddFile?.(newFileName) ?? true) {
            setIsCreating(false)
            return true
        }

        return false
    }

    const handleOnEditImportMap = () => {
        if (editingFileName || isCreating) {
            return
        }

        onChange?.(IMPORT_MAP_FILE_NAME)
    }

    const handleOnEditTsconfig = () => {
        if (editingFileName || isCreating) {
            return
        }

        onChange?.(TSCONFIG_FILE_NAME)
    }

    return (
        <div className={styles.root}>
            <div className={styles.multiple}>
                <HideScrollbar
                    ref={hideScrollbarRef}
                    autoHideWaitingTime={800}
                    scrollbarWidth={1}
                    scrollbarAsidePadding={0}
                    scrollbarEdgePadding={0}
                >
                    <FlexBox direction={'horizontal'} className={styles.tabContent}>
                        {Object.entries(files)
                            .filter(
                                ([fileName]) =>
                                    ![IMPORT_MAP_FILE_NAME, TSCONFIG_FILE_NAME].includes(fileName)
                            )
                            .map(([fileName]) => (
                                <Item
                                    key={fileName}
                                    value={fileName}
                                    active={!isCreating && selectedFileName === fileName}
                                    readonly={readonly || notRemovableFiles.includes(fileName)}
                                    editing={editingFileName === fileName}
                                    onClick={() => handleOnClickTab(fileName)}
                                    onEditing={() => setEditingFileName(fileName)}
                                    onChange={(newValue) =>
                                        handleOnChangeFileName(fileName, newValue)
                                    }
                                    onCancel={() => setEditingFileName(undefined)}
                                    onRemove={() => onRemoveFile?.(fileName)}
                                />
                            ))}
                        {!readonly &&
                            (isCreating ? (
                                <Item
                                    key={'newTab'}
                                    value={getMaxSequenceTabName()}
                                    active
                                    editing
                                    onChange={handleOnAddFile}
                                    onCancel={() => setIsCreating(false)}
                                />
                            ) : (
                                <Item
                                    key={'addTab'}
                                    className={styles.tabItemAdd}
                                    value={'+'}
                                    onClick={handleOnAddTab}
                                    readonly
                                />
                            ))}
                        <div className={styles.tabsMarginRight}>
                            <div />
                        </div>
                    </FlexBox>
                </HideScrollbar>
            </div>
            {(files[IMPORT_MAP_FILE_NAME] || files[TSCONFIG_FILE_NAME]) && (
                <div className={styles.sticky}>
                    {files[TSCONFIG_FILE_NAME] && (
                        <Item
                            value={TSCONFIG_FILE_NAME}
                            active={selectedFileName === TSCONFIG_FILE_NAME}
                            onClick={handleOnEditTsconfig}
                            readonly
                        />
                    )}
                    {files[IMPORT_MAP_FILE_NAME] && (
                        <Item
                            value={IMPORT_MAP_FILE_NAME}
                            active={selectedFileName === IMPORT_MAP_FILE_NAME}
                            onClick={handleOnEditImportMap}
                            readonly
                        />
                    )}
                </div>
            )}
        </div>
    )
}

FileSelector.Item = Item

export default FileSelector
