import { editor, IPosition, Selection } from 'monaco-editor'
import ScrollType = editor.ScrollType
import { Monaco } from '@monaco-editor/react'
import { getWorker, MonacoJsxSyntaxHighlight } from 'monaco-jsx-syntax-highlight'
import { createATA, TypeHelper } from '@/components/Playground/CodeEditor/Editor/ata'

export const useEditor = () => {
    const doOpenEditor = (
        editor: editor.IStandaloneCodeEditor,
        input: { options: { selection: Selection } }
    ) => {
        const selection = input.options ? input.options.selection : null
        if (selection) {
            if (
                typeof selection.endLineNumber === 'number' &&
                typeof selection.endColumn === 'number'
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

    const loadJsxSyntaxHighlight = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        const monacoJsxSyntaxHighlight = new MonacoJsxSyntaxHighlight(getWorker(), monaco)
        const { highlighter, dispose } = monacoJsxSyntaxHighlight.highlighterBuilder({ editor })

        editor.onDidChangeModelContent(() => {
            highlighter()
        })
        highlighter()

        return { highlighter, dispose }
    }

    const autoLoadExtraLib = async (
        editor: editor.IStandaloneCodeEditor,
        monaco: Monaco,
        defaultValue: string,
        onWatch: (typeHelper: TypeHelper) => () => void
    ) => {
        const typeHelper = await createATA()

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
        loadJsxSyntaxHighlight,
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
