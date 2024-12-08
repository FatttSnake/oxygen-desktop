import { ExtraLib } from '@/components/Playground/CodeEditor/Editor'
import indexDTS from '@/util/editorExtraLibs/_index.d.ts?raw'
import nativeApiDTS from '@/util/editorExtraLibs/_NativeApi.d.ts?raw'

const editorExtraLibs: ExtraLib[] = [
    {
        path: 'file:///node_modules/_index.d.ts',
        content: indexDTS
    },
    {
        path: 'file:///node_modules/_NativeApi.d.ts',
        content: nativeApiDTS
    }
]

export default editorExtraLibs
