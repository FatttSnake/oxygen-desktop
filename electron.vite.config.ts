import { fileURLToPath, URL } from 'node:url'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { AntDesignResolver } from './build/resolvers/antd'
import Icons from 'unplugin-icons/vite'
import { PluginOption } from 'vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin({ exclude: ['electron-store'] })]
    },
    preload: {
        build: {
            lib: {
                entry: ['src/preload/frame.ts', 'src/preload/main.ts', 'src/preload/tool.ts']
            }
        },
        plugins: [externalizeDepsPlugin()]
    },
    renderer: {
        plugins: [
            react(),
            AutoImport({
                // targets to transform
                include: [
                    /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
                    /\.md$/ // .md
                ],

                // global imports to register
                imports: [
                    'react',
                    'react-router',
                    'react-router-dom',
                    {
                        react: ['Suspense', 'createContext'],
                        'react-router': ['useMatches', 'RouterProvider', 'useBlocker'],
                        'react-router-dom': ['createBrowserRouter', 'useBeforeUnload'],
                        antd: ['message', 'notification']
                    },
                    {
                        from: 'react-router',
                        imports: ['RouteObject'],
                        type: true
                    }
                ],

                // Filepath to generate corresponding .d.ts file.
                // Defaults to './auto-imports.d.ts' when `typescript` is installed locally.
                // Set `false` to disable.
                dts: './auto-imports.d.ts',

                // Custom resolvers, compatible with `unplugin-vue-components`
                // see https://github.com/antfu/unplugin-auto-import/pull/23/
                resolvers: [
                    IconsResolver({
                        prefix: 'icon',
                        extension: 'jsx',
                        customCollections: ['oxygen']
                    }),
                    AntDesignResolver({
                        resolveIcons: true
                    })
                ],

                // Generate corresponding .eslintrc-auto-import.json file.
                // eslint globals Docs - https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals
                eslintrc: {
                    enabled: true, // Default `false`
                    filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
                    globalsPropValue: true // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
                }
            }) as PluginOption,
            Icons({
                compiler: 'jsx',
                jsx: 'react',
                autoInstall: true,
                customCollections: {
                    oxygen: FileSystemIconLoader('src/renderer/common/assets/svg', (svg) =>
                        svg.replace(/^svg /, '<svg fill="currentColor"')
                    )
                }
            })
        ],
        resolve: {
            alias: {
                $: fileURLToPath(new URL('./src/renderer/common', import.meta.url)),
                '#': fileURLToPath(new URL('./src/renderer/frame', import.meta.url)),
                '-': fileURLToPath(new URL('./src/renderer/independentFrame', import.meta.url)),
                '%': fileURLToPath(new URL('./src/renderer/menu', import.meta.url)),
                '@': fileURLToPath(new URL('./src/renderer/main', import.meta.url))
            }
        }
    }
})
