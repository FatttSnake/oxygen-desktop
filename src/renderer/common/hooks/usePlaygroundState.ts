import { IFileTree } from '$/components/Playground/shared'
import {
    fileNameToLanguage,
    EMPTY_FILE_TREE,
    treesEqual,
    findNodeByKey,
    cloneTree,
    setFileContent,
    hasDuplicateInSiblings,
    addNodeToParent,
    renameNode,
    moveNode,
    removeNode,
    findEntry,
    getPathByKey,
    getOrFirstFile
} from '$/components/Playground/files'

let _tempKeyCounter = 0

const tempKey = (fileName: string): string => `__new__${++_tempKeyCounter}__${fileName}`
export const isTempKey = (key: string): boolean => key.startsWith('__new__')

export interface TreeDiffOperation {
    type: 'add' | 'remove' | 'rename' | 'move' | 'content'
    fileName: string
    nodeId: string
    dirNode: boolean
    payload: Record<string, unknown>
}

export const usePlaygroundState = (
    initialFileTree: IFileTree = EMPTY_FILE_TREE,
    initialEntryPointPath?: string
) => {
    const handleErrorRef = useRef<(message: string) => void>()

    const [fileTree, setFileTree] = useState<IFileTree>(initialFileTree)
    const [originalFileTree, setOriginalFileTree] = useState<IFileTree>(initialFileTree)
    const [selectedFileKey, setSelectedFileKey] = useState<string>('')
    const [isReadonly, setIsReadonly] = useState<boolean>(false)
    const [entryPoint, setEntryPoint] = useState(
        initialEntryPointPath ? findEntry(initialFileTree, initialEntryPointPath)?.key : ''
    )
    const [entryPointPath, setEntryPointPath] = useState(initialEntryPointPath)
    const hasUnsavedChanges = !treesEqual(fileTree, originalFileTree)
    const selectedFile = findNodeByKey(fileTree, selectedFileKey)?.node ?? undefined

    const init = useCallback(
        (
            fileTree_: IFileTree,
            isReadonly_: boolean = false,
            entryPointPath_?: string,
            selectedKey_?: string
        ) => {
            setFileTree(fileTree_)
            setOriginalFileTree(cloneTree(fileTree_))
            setIsReadonly(isReadonly_)
            let entry: IFileTree | undefined = undefined
            if (entryPointPath_) {
                entry = findEntry(fileTree_, entryPointPath_)
                setEntryPoint(entry?.key)
                setEntryPointPath(entry ? getPathByKey(fileTree_, entry.key) : undefined)
            }
            if (selectedKey_) {
                setSelectedFileKey(selectedKey_)
            } else {
                setSelectedFileKey(entry?.key ?? getOrFirstFile(fileTree_)?.key ?? '')
            }
        },
        []
    )

    const markAsSaved = useCallback(() => {
        setFileTree((prev) => {
            setOriginalFileTree(cloneTree(prev))
            return prev
        })
    }, [])

    const onError = useCallback((message: string) => {
        handleErrorRef.current?.(message)
    }, [])

    const listenOnError = useCallback((callback: ((message: string) => void) | undefined) => {
        handleErrorRef.current = callback
    }, [])

    const isValidFileName = useCallback(
        (fileName: string): boolean => {
            if (fileName.length > 40) {
                onError('File name is too long.')
                return false
            }
            if (!/^[a-zA-Z0-9_\-. ]{1,40}$/.test(fileName)) {
                onError('Invalid file name.')
                return false
            }
            if (!/^.*\.(jsx|tsx|js|ts|css|json)$/.test(fileName)) {
                onError('Playground only supports *.jsx, *.tsx, *.js, *.ts, *.css, *.json files.')
                return false
            }

            return true
        },
        [onError]
    )

    const updateFileContent = useCallback(
        (key: string, content: string) => {
            if (isReadonly) {
                return
            }
            setFileTree((prev) => setFileContent(prev, key, content))
        },
        [isReadonly]
    )

    const addFile = useCallback(
        (fileName: string, isDir: boolean, parentKey: string = ''): boolean => {
            if (isReadonly) {
                return false
            }
            if (!isDir && !isValidFileName(fileName)) {
                return false
            }

            const key = tempKey(fileName)
            let added = false
            setFileTree((prev) => {
                const targetParentKey = parentKey || prev.key
                if (parentKey) {
                    const parent = findNodeByKey(prev, parentKey)
                    if (!parent) {
                        onError(`Parent directory with key "${parentKey}" not found`)
                        return prev
                    }
                    if (parent.node.children === undefined) {
                        onError(`Parent node "${parentKey}" is not a directory`)
                        return prev
                    }
                }
                if (hasDuplicateInSiblings(prev, targetParentKey, fileName, isDir)) {
                    const type = isDir ? 'Directory' : 'File'
                    onError(`${type} "${fileName}" already exists in this directory`)
                    return prev
                }
                added = true
                return addNodeToParent(prev, targetParentKey, {
                    key,
                    fileName: fileName,
                    content: '',
                    language: fileNameToLanguage(fileName),
                    children: isDir ? [] : undefined
                })
            })
            if (added && !isDir) {
                setSelectedFileKey(key)
            }
            return added
        },
        [isReadonly, isValidFileName, onError]
    )

    const renameFile = useCallback(
        (key: string, newFileName: string): boolean => {
            if (isReadonly) {
                return false
            }

            let renamed = false
            setFileTree((prev) => {
                const existing = findNodeByKey(prev, key)
                if (!existing) {
                    onError(`File with key "${key}" not found`)
                    return prev
                }
                if (existing.node.fileName === newFileName) {
                    return prev
                }
                if (key === entryPoint) {
                    onError(`Cannot rename entry file`)
                    return prev
                }
                const isDir = existing.node.children !== undefined
                if (!isDir && !isValidFileName(newFileName)) {
                    return prev
                }
                const renameParentKey = existing.parent?.key ?? ''
                if (hasDuplicateInSiblings(prev, renameParentKey, newFileName, isDir, key)) {
                    const type = isDir ? 'Directory' : 'File'
                    onError(`${type} "${newFileName}" already exists in this directory`)
                    return prev
                }
                renamed = true

                return renameNode(prev, key, newFileName).tree
            })

            return renamed
        },
        [isReadonly, isValidFileName, onError, entryPoint, selectedFileKey]
    )

    const moveFile = useCallback(
        (key: string, newParentKey: string): boolean => {
            if (isReadonly) {
                return false
            }

            let moved = false
            setFileTree((prev) => {
                const existing = findNodeByKey(prev, key)
                if (!existing) {
                    onError(`File with key "${key}" not found`)
                    return prev
                }
                if (key === newParentKey) {
                    return prev
                }
                if (key === entryPoint) {
                    onError(`Cannot move entry file`)
                    return prev
                }
                const newParent = findNodeByKey(prev, newParentKey)
                if (!newParent || newParent.node.children === undefined) {
                    onError(`Target "${newParentKey}" is not a directory`)
                    return prev
                }
                const isDir = existing.node.children !== undefined
                if (
                    hasDuplicateInSiblings(prev, newParentKey, existing.node.fileName, isDir, key)
                ) {
                    const type = isDir ? 'Directory' : 'File'
                    onError(
                        `${type} "${existing.node.fileName}" already exists in the target directory`
                    )

                    return prev
                }
                let ancestor:
                    | {
                          node: IFileTree
                          parent?: IFileTree
                      }
                    | undefined = newParent
                while (ancestor) {
                    if (ancestor.node.key === key) {
                        onError('Cannot move a directory into itself')
                        return prev
                    }
                    ancestor = ancestor.parent
                        ? findNodeByKey(prev, ancestor.parent.key)
                        : undefined
                }
                moved = true

                return moveNode(prev, key, newParentKey)
            })

            return moved
        },
        [isReadonly, onError, entryPoint]
    )

    const removeFile = useCallback(
        (key: string): boolean => {
            if (isReadonly) {
                return false
            }

            let removed = false
            setFileTree((prev) => {
                if (!findNodeByKey(prev, key)) {
                    return prev
                }
                if (key === entryPoint) {
                    onError(`Cannot delete entry file`)
                    return prev
                }
                removed = true
                return removeNode(prev, key)
            })
            if (removed) {
                if (selectedFileKey === key) {
                    const leaves: IFileTree[] = []
                    const walk = (node: IFileTree) => {
                        if (node.children === undefined) {
                            leaves.push(node)
                        } else {
                            node.children.forEach(walk)
                        }
                    }
                    walk(fileTree)
                    const idx = leaves.findIndex((leaf) => leaf.key === key)
                    if (idx !== -1) {
                        const nextLeaf = idx > 0 ? leaves[idx - 1] : leaves[idx + 1]
                        if (nextLeaf) {
                            setSelectedFileKey(nextLeaf.key)
                        }
                    }
                }
            }

            return removed
        },
        [isReadonly, onError, entryPoint, fileTree, selectedFileKey]
    )

    const setSelectedFileKeySafe = useCallback(
        (key: string): boolean => {
            if (!findNodeByKey(fileTree, key)) {
                return false
            }
            setSelectedFileKey(key)

            return true
        },
        [fileTree]
    )

    const setEntryPointSafe = useCallback(
        (key: string): boolean => {
            if (!findNodeByKey(fileTree, key)) {
                onError(`File with key "${key}" does not exist`)
                return false
            }
            setEntryPoint(key)

            return true
        },
        [fileTree, onError]
    )

    useEffect(() => {
        if (fileTree && entryPoint) {
            setEntryPointPath(getPathByKey(fileTree, entryPoint))
        }
    }, [fileTree, entryPoint])

    return {
        fileTree,
        originalFileTree,
        selectedFileKey,
        selectedFile,
        isReadonly,
        entryPoint,
        entryPointPath,
        hasUnsavedChanges,

        init,
        setIsReadonly,
        markAsSaved,

        setSelectedFileKey: setSelectedFileKeySafe,
        setEntryPoint: setEntryPointSafe,
        updateFileContent,
        addFile,
        renameFile,
        moveFile,
        removeFile,

        listenOnError
    }
}

/**
 * Compare the working tree against the original baseline and produce an
 * ordered list of PATCH operations for the server API.
 *
 * Uses key as the stable identifier. Newly added nodes have temp keys
 * (`__new__*`) and are excluded from CONTENT/RENAME/MOVE/REMOVE passes
 * (they can't have a server-side nodeId yet).
 *
 * ADD parentNode / MOVE newParentId may contain temp keys when targeting
 * newly created directories — the consumer must resolve these to the
 * server-returned nodeId before sending.
 *
 * Order: ADD → CONTENT → RENAME → MOVE → REMOVE.
 */
export const computeTreeDiff = (current: IFileTree, original: IFileTree): TreeDiffOperation[] => {
    const currentNodes = collectAllNodes(current)
    const originalNodes = collectAllNodes(original)

    const currentByKey = new Map(currentNodes.map((n) => [n.key, n]))
    const originalByKey = new Map(originalNodes.map((n) => [n.key, n]))

    const adds: TreeDiffOperation[] = []
    const contents: TreeDiffOperation[] = []
    const renames: TreeDiffOperation[] = []
    const moves: TreeDiffOperation[] = []
    const removes: TreeDiffOperation[] = []

    // ── ADD ──
    // Collect new nodes in DFS traversal order (parents before children).
    for (const node of currentNodes) {
        if (!originalByKey.has(node.key)) {
            adds.push({
                type: 'add',
                fileName: node.fileName,
                nodeId: node.key,
                dirNode: node.isDir,
                payload: {
                    parentNode: node.parentKey ?? ''
                }
            })
            // Content for newly added files — sent after ADD returns the nodeId
            if (!node.isDir && node.content) {
                contents.push({
                    type: 'content',
                    fileName: node.fileName,
                    nodeId: node.key,
                    dirNode: false,
                    payload: { content: node.content }
                })
            }
        }
    }

    // ── CONTENT (existing server-side files only) ──
    for (const [key, node] of currentByKey) {
        const orig = originalByKey.get(key)
        if (orig && !isTempKey(key) && !node.isDir && node.content !== orig.content) {
            contents.push({
                type: 'content',
                fileName: node.fileName,
                nodeId: key,
                dirNode: false,
                payload: { content: node.content }
            })
        }
    }

    // ── RENAME ──
    for (const [key, node] of originalByKey) {
        const cur = currentByKey.get(key)
        if (cur && cur.fileName !== node.fileName && !isTempKey(key)) {
            renames.push({
                type: 'rename',
                fileName: cur.fileName,
                nodeId: key,
                dirNode: cur.isDir,
                payload: {}
            })
        }
    }

    // ── MOVE ──
    for (const [key, node] of originalByKey) {
        const cur = currentByKey.get(key)
        if (cur && cur.parentKey !== node.parentKey && !isTempKey(key)) {
            moves.push({
                type: 'move',
                fileName: cur.fileName,
                nodeId: key,
                dirNode: cur.isDir,
                payload: {
                    newParentId: cur.parentKey ?? ''
                }
            })
        }
    }

    // ── REMOVE ──
    // Collect removed server-side nodes, then filter out descendants whose
    // ancestor is also removed (the ancestor REMOVE covers them).
    const removedKeys = new Set<string>()
    for (const [key] of originalByKey) {
        if (!currentByKey.has(key) && !isTempKey(key)) {
            removedKeys.add(key)
        }
    }
    // Exclude nodes whose ancestor is also being removed
    for (const key of removedKeys) {
        let pk: string | undefined = originalByKey.get(key)?.parentKey
        while (pk) {
            if (removedKeys.has(pk)) {
                removedKeys.delete(key)
                break
            }
            pk = originalByKey.get(pk)?.parentKey
        }
    }
    for (const key of removedKeys) {
        const node = originalByKey.get(key)!
        removes.push({
            type: 'remove',
            fileName: node.fileName,
            nodeId: key,
            dirNode: node.isDir,
            payload: {}
        })
    }

    // Order: ADD → CONTENT → RENAME → MOVE → REMOVE
    return [...adds, ...contents, ...renames, ...moves, ...removes]
}

/**
 * Collect all nodes (files + directories) in DFS traversal order.
 * Parents appear before their children so callers can process ADD
 * operations in creation-safe order.
 */
const collectAllNodes = (
    tree: IFileTree
): Array<{
    key: string
    fileName: string
    content: string
    parentKey?: string
    isDir: boolean
}> => {
    const result: Array<{
        key: string
        fileName: string
        content: string
        parentKey?: string
        isDir: boolean
    }> = []
    const walk = (node: IFileTree, parentKey?: string) => {
        result.push({
            key: node.key,
            fileName: node.fileName,
            content: node.content,
            parentKey,
            isDir: node.children !== undefined
        })
        if (node.children !== undefined) {
            node.children.forEach((child) => walk(child, node.key))
        }
    }
    walk(tree)
    return result
}

export const convertDiffToStepTitle = ({ type, fileName, dirNode }: TreeDiffOperation) => {
    switch (type) {
        case 'add':
            return `新建${dirNode ? '目录' : '文件'}：${fileName}`
        case 'content':
            return `更新文件：${fileName}`
        case 'rename':
            return `重命名${dirNode ? '目录' : '文件'}：${fileName}`
        case 'move':
            return `移动${dirNode ? '目录' : '文件'}：${fileName}`
        case 'remove':
            return `删除${dirNode ? '目录' : '文件'}：${fileName}`
    }
}
