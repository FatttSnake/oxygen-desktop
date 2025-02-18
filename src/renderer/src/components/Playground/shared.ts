import { editor, languages } from 'monaco-editor'
import CompilerOptions = languages.typescript.CompilerOptions

export type ILanguage = 'javascript' | 'typescript' | 'json' | 'css' | 'xml'

export interface IFile {
    name: string
    value: string
    language: ILanguage
    hidden?: boolean
}

export interface IFiles {
    [key: string]: IFile
}

export interface ITemplate {
    name: string
    tsconfig: ITsconfig
    importMap: IImportMap
    files: IFiles
}

export interface ITemplates {
    [key: string]: ITemplate
}

export interface IImportMap {
    imports: Record<string, string>
}

export interface ITsconfig {
    compilerOptions: CompilerOptions
}

export type ITheme = 'light' | 'vs-dark'

export type IEditorOptions = editor.IStandaloneEditorConstructionOptions
