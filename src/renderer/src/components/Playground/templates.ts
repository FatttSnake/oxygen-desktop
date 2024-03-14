import { ITemplates } from '@/components/Playground/shared'
import { ENTRY_FILE_NAME, MAIN_FILE_NAME } from '@/components/Playground/files'

import baseTsconfig from '@/components/Playground/templates/base/tsconfig.json'
import baseImportMap from '@/components/Playground/templates/base/import-map.json'
import baseMain from '@/components/Playground/templates/base/main.tsx?raw'
import baseApp from '@/components/Playground/templates/base/App.tsx?raw'

import demoTsconfig from '@/components/Playground/templates/demo/tsconfig.json'
import demoImportMap from '@/components/Playground/templates/demo/import-map.json'
import demoMain from '@/components/Playground/templates/demo/main.tsx?raw'
import demoApp from '@/components/Playground/templates/demo/App.tsx?raw'
import demoAppCSS from '@/components/Playground/templates/demo/App.css?raw'

const templates: ITemplates = {
    base: {
        name: '基础',
        tsconfig: baseTsconfig,
        importMap: baseImportMap,
        files: {
            [ENTRY_FILE_NAME]: {
                name: ENTRY_FILE_NAME,
                language: 'typescript',
                value: baseMain,
                hidden: true
            },
            [MAIN_FILE_NAME]: {
                name: MAIN_FILE_NAME,
                language: 'typescript',
                value: baseApp
            }
        }
    },
    demo: {
        name: 'Demo',
        tsconfig: demoTsconfig,
        importMap: demoImportMap,
        files: {
            [ENTRY_FILE_NAME]: {
                name: ENTRY_FILE_NAME,
                language: 'typescript',
                value: demoMain,
                hidden: true
            },
            [MAIN_FILE_NAME]: {
                name: MAIN_FILE_NAME,
                language: 'typescript',
                value: demoApp
            },
            ['App.css']: {
                name: 'App.css',
                language: 'css',
                value: demoAppCSS
            }
        }
    }
}

export default templates
