import { editor, IPosition, Selection } from 'monaco-editor'
import ScrollType = editor.ScrollType
import { Monaco } from '@monaco-editor/react'
import { IImportMap } from '$/components/Playground/shared'
import { createATA, TypeHelper } from '$/components/Playground/CodeEditor/Editor/ata'

/**
 * Parse an esm.sh URL to extract package name and version.
 *
 * Examples:
 *   https://esm.sh/react@18.3.1          → { pkg: 'react', ver: '18.3.1' }
 *   https://esm.sh/@mui/material@6.1.7   → { pkg: '@mui/material', ver: '6.1.7' }
 */
const parseEsmUrl = (url: string): { pkg: string; ver: string } | null => {
    try {
        const { pathname } = new URL(url)
        if (pathname.startsWith('/@')) {
            const m = pathname.match(/^\/(@[^/]+\/[^@]+)@([^/]+)/)
            if (m) return { pkg: m[1], ver: m[2] }
        } else {
            const m = pathname.match(/^\/([^@]+)@([^/]+)/)
            if (m) return { pkg: m[1], ver: m[2] }
        }
    } catch {
        // ignore invalid URLs
    }
    return null
}

/**
 * Convert an importMap (package → esm.sh URL) into a simple version map
 * (package → semver string) used by ATA's URL rewriter.
 */
const buildVersionMap = (importMap: IImportMap): Record<string, string> => {
    const map: Record<string, string> = {}
    for (const [, url] of Object.entries(importMap)) {
        const parsed = parseEsmUrl(url)
        if (parsed) {
            map[parsed.pkg] = parsed.ver
        }
    }
    return map
}

export const useEditor = () => {
    const doOpenEditor = (
        editor: editor.IStandaloneCodeEditor,
        input: { options: { selection: Selection } }
    ) => {
        const selection = input.options ? input.options.selection : null
        if (selection) {
            if (
                typeof selection?.endLineNumber === 'number' &&
                typeof selection?.endColumn === 'number'
            ) {
                editor.setSelection(selection)
                editor.revealRangeInCenter(selection, ScrollType.Immediate)
            } else {
                const position: IPosition = {
                    lineNumber: selection.startLineNumber,
                    column: selection.startColumn
                }
                editor.setPosition(position)
                editor.revealPositionInCenter(position, ScrollType.Immediate)
            }
        }
    }

    const autoLoadExtraLib = async (
        editor: editor.IStandaloneCodeEditor,
        monaco: Monaco,
        defaultValue: string,
        onWatch: (typeHelper: TypeHelper) => () => void,
        importMap?: IImportMap
    ) => {
        const versionMap = importMap ? buildVersionMap(importMap) : undefined

        const typeHelper = await createATA(versionMap)

        onWatch(typeHelper)

        typeHelper.acquireType(`import React from 'react'`)

        editor.onDidChangeModelContent(() => {
            typeHelper.acquireType(editor.getValue())
        })

        const addLibraryToRuntime = (code: string, path: string) => {
            monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${path}`)
        }

        typeHelper.addListener('receivedFile', addLibraryToRuntime)
        typeHelper.acquireType(defaultValue)

        return typeHelper
    }

    return {
        doOpenEditor,
        autoLoadExtraLib
    }
}

export const useTypesProgress = () => {
    const [progress, setProgress] = useState(0)
    const [total, setTotal] = useState(0)
    const [isFinished, setIsFinished] = useState(false)

    const onWatch = (typeHelper: TypeHelper) => {
        const handleStarted = () => {
            setIsFinished(false)
        }
        typeHelper.addListener('started', handleStarted)

        const handleProgress = (progress: number, total: number) => {
            setProgress(progress)
            setTotal(total)
        }
        typeHelper.addListener('progress', handleProgress)

        const handleFinished = () => {
            setIsFinished(true)
        }
        typeHelper.addListener('progress', handleFinished)

        return () => {
            typeHelper.removeListener('started', handleStarted)
            typeHelper.removeListener('progress', handleProgress)
            typeHelper.removeListener('finished', handleFinished)
        }
    }

    return {
        progress,
        total,
        finished: isFinished,
        onWatch
    }
}
