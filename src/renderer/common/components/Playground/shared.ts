import { editor, languages } from 'monaco-editor'
import CompilerOptions = languages.typescript.CompilerOptions

export type ILanguage = 'none' | 'javascript' | 'typescript' | 'json' | 'css'

export interface IFile {
    key: string
    fileName: string
    content: string
    language: ILanguage
}

export interface IFileTree extends IFile {
    children: IFileTree[] | undefined
}

export type IImportMap = Record<string, string>

export interface ITsconfig {
    compilerOptions: CompilerOptions
}

export type IEditorOptions = editor.IStandaloneEditorConstructionOptions

export interface ErrorLocation {
    column: number
    file: string
    length: number
    line: number
    lineText: string
    namespace: string
    suggestion: string
}

export interface BuildError {
    detail: {
        message: string
    }
    id: string
    location: ErrorLocation
    notes: never[]
    pluginName: string
    text: string
}

export interface BuildErrorResponse {
    errors: BuildError[]
}
