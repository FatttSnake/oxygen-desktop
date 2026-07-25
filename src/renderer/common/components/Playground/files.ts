import { languages } from 'monaco-editor'
import DiagnosticsOptions = languages.json.DiagnosticsOptions
import { IFile, IFileTree, IImportMap, ILanguage, ITsconfig } from '$/components/Playground/shared'
import tsconfigSchema from '$/assets/schema/playground/tsconfig-schema.json'
import importMapSchema from '$/assets/schema/playground/import-map-schema.json'

export const IMPORT_MAP_FILE_NAME = 'import-map.json'
export const TSCONFIG_FILE_NAME = 'tsconfig.json'
export const ENTRY_FILE_NAME = 'main.tsx'
export const MAIN_FILE_NAME = 'App.tsx'
export const EMPTY_FILE_TREE: IFileTree = {
    key: 'root',
    fileName: '',
    content: '',
    language: 'none',
    children: []
}

export const fileNameToLanguage = (name: string): ILanguage => {
    const suffix = name.split('.').pop() || ''
    if (['js', 'jsx'].includes(suffix)) {
        return 'javascript'
    }
    if (['ts', 'tsx'].includes(suffix)) {
        return 'typescript'
    }
    if (['json'].includes(suffix)) {
        return 'json'
    }
    if (['css'].includes(suffix)) {
        return 'css'
    }

    return 'none'
}

export const sourceListToFileTree = (sourceList: ToolSourceVo[]): IFileTree => {
    const rootNode = sourceList.find((node) => node.rootNode)
    if (!rootNode) {
        throw new Error('No root node found in source list')
    }

    const nodeMap = new Map<string, ToolSourceVo>()
    sourceList.forEach((node) => nodeMap.set(node.id, node))

    const buildTree = (node: ToolSourceVo): IFileTree => {
        const isDirectory = node.dirNode
        const language: ILanguage = isDirectory ? 'none' : fileNameToLanguage(node.fileName)

        const children = sourceList.filter((item) => item.parentId === node.id)

        const fileNode: IFileTree = {
            key: node.id,
            fileName: node.fileName,
            content: node.latestFileVersion?.fileContent || '',
            language,
            children: isDirectory ? [] : undefined
        }

        if (isDirectory && children.length > 0) {
            fileNode.children = children.map((child) => buildTree(child)).sort(compareFileTreeNodes)
        }

        return fileNode
    }

    return buildTree(rootNode)
}

export const getImportMap = (fileTree: IFileTree): IImportMap => {
    const importMapRaw = fileTree.children?.find(
        (item) => item.fileName === IMPORT_MAP_FILE_NAME
    )?.content

    return importMapRaw ? JSON.parse(importMapRaw) : {}
}

export const getTsconfig = (fileTree: IFileTree): ITsconfig => {
    const tsconfigRaw = fileTree.children?.find(
        (item) => item.fileName === TSCONFIG_FILE_NAME
    )?.content

    return tsconfigRaw ? JSON.parse(tsconfigRaw) : { compilerOptions: {} }
}

export const jsonToJs = (code: string) => {
    return `export default ${code}`
}

export const cssToJs = (code: string, fileName?: string) => {
    const randomId = new Date().getTime()
    return `(() => {
  let stylesheet = document.getElementById('style_${randomId}${fileName ? `_${fileName}` : ''}');
  if (!stylesheet) {
    stylesheet = document.createElement('style')
    stylesheet.setAttribute('id', 'style_${randomId}_${fileName ? `_${fileName}` : ''}')
    document.head.appendChild(stylesheet)
  }
  const styles = document.createTextNode(
\`${code}\`
    )
  stylesheet.innerHTML = ''
  stylesheet.appendChild(styles)
})()
`
}

export const addReactImport = (code: string) => {
    if (!/^\s*import\s+React\s+/g.test(code)) {
        return `import React from 'react';\n${code}`
    }
    return code
}

export const tsconfigJsonDiagnosticsOptions: DiagnosticsOptions = {
    validate: true,
    schemas: [
        {
            uri: 'tsconfig.json',
            fileMatch: ['tsconfig.json'],
            schema: tsconfigSchema
        },
        {
            uri: 'import-map.json',
            fileMatch: ['import-map.json'],
            schema: importMapSchema
        }
    ]
}

/** Recursively search for a node by its unique key. */
export const findNodeByKey = (
    tree: IFileTree,
    key: string
): { node: IFileTree; parent?: IFileTree } | undefined => {
    if (tree.key === key) {
        return { node: tree }
    }
    if (tree.children === undefined) {
        return undefined
    }
    for (const child of tree.children) {
        if (child.key === key) {
            return { node: child, parent: tree }
        }
        if (child.children !== undefined) {
            const found = findNodeByKey(child, key)
            if (found) {
                return found
            }
        }
    }

    return undefined
}

/** Find a node by its file-system path (e.g., `"src/App.tsx"`). */
export const findNodeByPath = (tree: IFileTree, path: string): IFileTree | undefined => {
    const parts = path.split('/').filter(Boolean)
    if (parts.length === 0) {
        return undefined
    }

    let current: IFileTree | undefined = tree

    for (const part of parts) {
        if (!current || current.children === undefined) {
            return undefined
        }
        current = current.children.find((child) => child.fileName === part)
    }

    return current
}

/** Recursively search for a node by fileName (for cases where we only know the name). */
export const findFileNodeByFilename = (
    tree: IFileTree,
    fileName: string
): { node: IFileTree; parent?: IFileTree } | undefined => {
    if (tree.children === undefined) {
        return tree.fileName === fileName ? { node: tree } : undefined
    }
    for (const child of tree.children) {
        if (child.fileName === fileName && child.children === undefined) {
            return { node: child, parent: tree }
        }
        if (child.children !== undefined) {
            const found = findFileNodeByFilename(child, fileName)
            if (found) {
                return found
            }
        }
    }

    return undefined
}

/**
 * Get a file by its key, or find the first eligible code file (.tsx > .ts > .jsx > .js)
 * at the outermost (shallowest) level via breadth-first search.
 */
export const getOrFirstFile = (tree: IFileTree, key?: string): IFileTree | undefined => {
    if (key) {
        const found = findNodeByKey(tree, key)
        if (found && found.node.children === undefined) {
            return found.node
        }
    }

    // Breadth-first search to prefer files at shallower depth
    const queue: IFileTree[] = [tree]
    const extensions = ['.tsx', '.ts', '.jsx', '.js']

    while (queue.length > 0) {
        const node = queue.shift()!
        if (node.children === undefined) {
            if (extensions.some((ext) => node.fileName.endsWith(ext))) {
                return node
            }
        } else {
            queue.push(...node.children)
        }
    }

    return undefined
}

/**
 * Find an entry-point file. Priority: `path` lookup → `ENTRY_FILE_NAME` → `MAIN_FILE_NAME`
 * → first .tsx/.ts/.jsx/.js at the outermost level.
 */
export const findEntry = (tree: IFileTree, path: string): IFileTree | undefined => {
    const found = findNodeByPath(tree, path)
    if (found && found.children === undefined) {
        return found
    }

    return undefined
}

/** Build the full file-system path (e.g., `"src/App.tsx"`) for a node identified by its key. */
export const getPathByKey = (tree: IFileTree, key: string): string | undefined => {
    const segments: string[] = []

    const walk = (node: IFileTree): boolean => {
        if (node.key === key) {
            if (node.fileName) {
                segments.push(node.fileName)
            }

            return true
        }
        if (node.children) {
            for (const child of node.children) {
                if (walk(child)) {
                    if (node.fileName) {
                        segments.push(node.fileName)
                    }
                    return true
                }
            }
        }
        return false
    }

    return walk(tree) ? segments.reverse().join('/') : undefined
}

/** Comparator: directories before files, then alphabetically by file name. */
const compareFileTreeNodes = (a: IFileTree, b: IFileTree): number => {
    const aIsDir = Array.isArray(a.children)
    const bIsDir = Array.isArray(b.children)
    if (aIsDir && !bIsDir) return -1
    if (!aIsDir && bIsDir) return 1
    return a.fileName.localeCompare(b.fileName)
}

/** Sort an array of children in place (directories first, then alphabetically). */
const sortChildren = (children: IFileTree[]): IFileTree[] => children.sort(compareFileTreeNodes)

/** Return a new tree with a leaf node's content updated (matched by key). */
export const setFileContent = (tree: IFileTree, key: string, content: string): IFileTree => {
    if (tree.children === undefined) {
        return tree.key === key ? { ...tree, content } : tree
    }

    let changed = false
    const next = tree.children.map((child) => {
        const result = setFileContent(child, key, content)
        if (result !== child) {
            changed = true
        }

        return result
    })

    return changed ? { ...tree, children: next } : tree
}

/** Return a new tree with a child added under the specified parent key. */
export const addNodeToParent = (tree: IFileTree, parentKey: string, file: IFileTree): IFileTree => {
    if (tree.key === parentKey && tree.children !== undefined) {
        return { ...tree, children: sortChildren([...tree.children, file]) }
    }
    if (tree.children === undefined) {
        return tree
    }

    let changed = false
    const next = tree.children.map((child) => {
        const result = addNodeToParent(child, parentKey, file)
        if (result !== child) {
            changed = true
        }

        return result
    })

    return changed ? { ...tree, children: next } : tree
}

/** Return a new tree with a node removed (matched by key). */
export const removeNode = (tree: IFileTree, key: string): IFileTree => {
    if (tree.children === undefined) {
        return tree
    }

    let changed = false
    const next = tree.children
        .map((child) => {
            if (child.key === key) {
                changed = true
                return undefined
            }

            if (child.children !== undefined) {
                const result = removeNode(child, key)
                if (result !== child) {
                    changed = true
                }
                return result
            }

            return child
        })
        .filter(Boolean) as IFileTree[]

    return changed ? { ...tree, children: next } : tree
}

/** Return a new tree with a node's file name updated (matched by key). */
export const renameNode = (
    tree: IFileTree,
    key: string,
    newName: string
): { tree: IFileTree; renamed: boolean } => {
    if (tree.key === key) {
        return {
            tree: {
                ...tree,
                fileName: newName,
                language: tree.children === undefined ? fileNameToLanguage(newName) : 'none'
            },
            renamed: true
        }
    }

    if (tree.children === undefined) {
        return { tree, renamed: false }
    }

    let renamed = false
    const next = tree.children.map((child) => {
        const result = renameNode(child, key, newName)
        if (result.renamed) {
            renamed = true
        }

        return result.tree
    })

    return { tree: renamed ? { ...tree, children: sortChildren(next) } : tree, renamed }
}

/** Return a new tree with a node moved to a new parent directory (matched by key). */
export const moveNode = (tree: IFileTree, key: string, newParentKey: string): IFileTree => {
    // can't move to itself
    if (key === newParentKey) {
        return tree
    }

    const found = findNodeByKey(tree, key)
    if (!found) {
        return tree
    }
    // Check new parent is a valid directory
    const newParent = findNodeByKey(tree, newParentKey)
    if (!newParent || newParent.node.children === undefined) {
        return tree
    }
    // Remove from current location, then add to new parent
    const afterRemove = removeNode(tree, key)

    return addNodeToParent(afterRemove, newParentKey, found.node)
}

/** Deep-clone a tree (for snapshots). */
export const cloneTree = (tree: IFileTree): IFileTree => ({
    ...tree,
    content: tree.content,
    children: tree.children?.map(cloneTree)
})

/** Structural equality check for trees. */
export const treesEqual = (a: IFileTree, b: IFileTree): boolean => {
    if (a.key !== b.key || a.fileName !== b.fileName || a.content !== b.content) {
        return false
    }
    if ((a.children === undefined) !== (b.children === undefined)) {
        return false
    }
    if (a.children === undefined) {
        return true
    }
    if (a.children.length !== b.children?.length) {
        return false
    }

    return a.children.every((child, i) => treesEqual(child, b.children![i]))
}

/**
 * Check if a parent node already has a same-type child with the same file name.
 * File+directory with same name in the same directory is allowed (e.g., `Button.tsx` and `Button/`).
 */
export const hasDuplicateInSiblings = (
    tree: IFileTree,
    parentKey: string,
    fileName: string,
    isDirectory: boolean,
    excludeKey?: string
): boolean => {
    const children = findNodeByKey(tree, parentKey)?.node.children
    if (!children) {
        return false
    }
    return children.some(
        (child) =>
            child.key !== excludeKey &&
            child.fileName === fileName &&
            (child.children !== undefined) === isDirectory
    )
}

/**
 * Flatten an IFileTree into a path → IFile map.
 *
 * The tree's root file name is treated as the base directory.
 * Files in subdirectories get paths like `src/App.tsx`.
 */
export const flattenFileTree = (tree: IFileTree): Map<string, IFile> => {
    const map = new Map<string, IFile>()

    const walk = (node: IFileTree, prefix: string) => {
        const path = prefix ? `${prefix}/${node.fileName}` : node.fileName

        if (node.children === undefined) {
            // File node
            map.set(path, {
                key: node.key,
                fileName: node.fileName,
                content: node.content,
                language: node.language
            })
        } else if (node.children.length > 0) {
            // Directory node with children
            for (const child of node.children) {
                walk(child, path)
            }
        }
        // Empty directory — skip
    }

    walk(tree, '')
    return map
}
