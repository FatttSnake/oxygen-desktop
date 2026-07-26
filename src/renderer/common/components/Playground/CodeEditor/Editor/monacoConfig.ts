import { editor } from 'monaco-editor'

export const MonacoEditorConfig: editor.IStandaloneEditorConstructionOptions = {
    automaticLayout: true,
    cursorBlinking: 'smooth',
    fontLigatures: true,
    formatOnPaste: true,
    formatOnType: true,
    fontSize: 14,
    showDeprecated: true,
    showUnused: true,
    showFoldingControls: 'mouseover',
    scrollBeyondLastLine: false,
    minimap: {
        enabled: false
    },
    inlineSuggest: {
        enabled: false
    },
    fixedOverflowWidgets: true,
    smoothScrolling: true,
    smartSelect: {
        selectSubwords: true,
        selectLeadingAndTrailingWhitespace: true
    },
    tabSize: 2,
    overviewRulerBorder: false,
    scrollbar: {
        verticalScrollbarSize: 6,
        horizontalScrollbarSize: 6
    }
    // lineNumbers: 'off'
}
