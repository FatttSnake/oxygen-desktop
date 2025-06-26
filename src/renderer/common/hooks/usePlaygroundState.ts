import { IFiles, IImportMap, ITsconfig } from '$/components/Playground/shared'
import {
    EMPTY_FILES,
    ENTRY_FILE_NAME,
    fileNameToLanguage,
    IMPORT_MAP_FILE_NAME,
    MAIN_FILE_NAME,
    TSCONFIG_FILE_NAME
} from '$/components/Playground/files'

export const usePlaygroundState = (
    initialFiles: IFiles = EMPTY_FILES,
    initialEntryPoint: string = ENTRY_FILE_NAME
) => {
    const [files, setFiles] = useState<IFiles>(initialFiles)
    const [selectedFileName, setSelectedFileName] = useState<string>(MAIN_FILE_NAME)
    const [importMap, setImportMap] = useState<IImportMap>({})
    const [tsconfig, setTsconfig] = useState<ITsconfig>({ compilerOptions: {} })
    const [entryPoint, setEntryPoint] = useState(initialEntryPoint)
    const [hasEdited, setHasEdited] = useState(false)
    const [onError, listenOnError] = useState<(message: string) => void>()

    const init = useCallback((files: IFiles, selectedFileName?: string, entryPoint?: string) => {
        setFiles(files)
        if (selectedFileName) {
            setSelectedFileName(selectedFileName)
        }
        if (entryPoint) {
            setEntryPoint(entryPoint)
        }
        setHasEdited(false)
    }, [])

    const updateFileContent = useCallback((fileName: string, content: string) => {
        setFiles((prev) => ({
            ...prev,
            [fileName]: {
                ...prev[fileName],
                value: content
            }
        }))
        setHasEdited(true)
    }, [])

    const validateFileName = (fileName: string) => {
        if (files[fileName]) {
            onError?.(`File "${fileName}" already exists`)
            return false
        }

        if (fileName.length > 40) {
            onError?.('File name is too long, maximum 40 characters.')
            return false
        }

        if (!/\.(jsx|tsx|js|ts|css|json)$/.test(fileName)) {
            onError?.('Playground only supports *.jsx, *.tsx, *.js, *.ts, *.css, *.json files.')
            return false
        }

        return true
    }

    const addFile = useCallback(
        (fileName: string, content: string = '') => {
            if (!validateFileName(fileName)) {
                return false
            }

            setFiles((prev) => ({
                ...prev,
                [fileName]: {
                    name: fileName,
                    value: content,
                    language: fileNameToLanguage(fileName)
                }
            }))
            setSelectedFileName(fileName)
            setHasEdited(true)
            return true
        },
        [files]
    )

    const renameFile = useCallback(
        (oldFileName: string, newFileName: string) => {
            if (!files[oldFileName]) {
                onError?.(`Cannot rename file "${oldFileName}"`)
                return false
            }
            if (oldFileName === entryPoint) {
                onError?.(`Cannot rename entry file "${oldFileName}"`)
                return false
            }
            if (!validateFileName(newFileName)) {
                return false
            }

            const { [oldFileName]: oldFile, ...rest } = files
            setFiles({
                ...rest,
                [newFileName]: {
                    ...oldFile,
                    name: newFileName,
                    language: fileNameToLanguage(newFileName)
                }
            } as IFiles)

            if (selectedFileName === oldFileName) {
                setSelectedFileName(newFileName)
            }

            if (entryPoint === oldFileName) {
                setEntryPoint(newFileName)
            }

            setHasEdited(true)
            return true
        },
        [files, selectedFileName, entryPoint]
    )

    const removeFile = useCallback(
        (fileName: string) => {
            if (!files[fileName]) {
                return true
            }
            if (fileName === entryPoint) {
                onError?.(`Cannot delete entry file "${fileName}"`)
                return false
            }

            const newFiles = { ...files }
            delete newFiles[fileName]
            setFiles(newFiles)

            if (fileName === selectedFileName) {
                const visibleFiles = Object.keys(newFiles).filter(
                    (name) =>
                        !newFiles[name].hidden &&
                        name !== IMPORT_MAP_FILE_NAME &&
                        name !== TSCONFIG_FILE_NAME
                )
                if (visibleFiles.length > 0) {
                    setSelectedFileName(visibleFiles[0])
                }
            }

            setHasEdited(true)
            return true
        },
        [files, selectedFileName]
    )

    const setSelectedFileNameSafe = useCallback(
        (fileName: string) => {
            if (!files[fileName]) {
                return false
            }
            setSelectedFileName(fileName)
            return true
        },
        [files]
    )

    const setEntryPointSafe = useCallback(
        (newEntryPoint: string) => {
            if (!files[newEntryPoint]) {
                onError?.(`File "${newEntryPoint}" does not exist`)
                return false
            }

            setEntryPoint(newEntryPoint)
            return true
        },
        [files]
    )

    const saveFiles = useCallback(() => {
        setHasEdited(false)
    }, [])

    useEffect(() => {
        if (!files[entryPoint]) {
            const defaultEntry = Object.keys(files).find(
                (f) =>
                    f === ENTRY_FILE_NAME ||
                    f === MAIN_FILE_NAME ||
                    f.endsWith('.tsx') ||
                    f.endsWith('.ts') ||
                    f.endsWith('.jsx') ||
                    f.endsWith('.js')
            )
            if (defaultEntry) {
                setEntryPoint(defaultEntry)
            }
        }
    }, [files, entryPoint])

    useEffect(() => {
        try {
            const importMapFile = files[IMPORT_MAP_FILE_NAME]
            if (!importMapFile) {
                addFile(IMPORT_MAP_FILE_NAME, JSON.stringify({}))
                return
            }

            setImportMap(JSON.parse(importMapFile.value))
        } catch (error) {
            /* empty */
        }
    }, [files[IMPORT_MAP_FILE_NAME]?.value])

    useEffect(() => {
        try {
            const tsconfigFile = files[TSCONFIG_FILE_NAME]
            if (!tsconfigFile) {
                addFile(TSCONFIG_FILE_NAME, JSON.stringify({ compilerOptions: {} }))
                return
            }

            setTsconfig(JSON.parse(tsconfigFile.value))
        } catch (error) {
            /* empty */
        }
    }, [files[TSCONFIG_FILE_NAME]?.value])

    return {
        init,
        files,
        selectedFileName,
        entryPoint,
        importMap,
        tsconfig,
        hasEdited,
        setFiles,
        setSelectedFileName: setSelectedFileNameSafe,
        setEntryPoint: setEntryPointSafe,
        updateFileContent,
        addFile,
        renameFile,
        removeFile,
        saveFiles,
        listenOnError
    }
}
