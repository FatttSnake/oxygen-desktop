import { editor, languages } from 'monaco-editor'
import CompilerOptions = languages.typescript.CompilerOptions
import { IMPORT_MAP_FILE_NAME, TSCONFIG_FILE_NAME } from '$/components/Playground/files'

export type ILanguage = 'javascript' | 'typescript' | 'json' | 'css' | 'xml'

export interface IFile {
    name: string
    value: string
    language: ILanguage
    hidden?: boolean
}

export interface IFiles {
    [IMPORT_MAP_FILE_NAME]: IFile
    [TSCONFIG_FILE_NAME]: IFile
    [key: string]: IFile
}

export type IImportMap = Record<string, string>

export interface ITsconfig {
    compilerOptions: CompilerOptions
}

export type IEditorOptions = editor.IStandaloneEditorConstructionOptions
