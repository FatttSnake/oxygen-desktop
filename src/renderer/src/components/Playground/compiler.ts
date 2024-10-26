import esbuild, { Loader, OnLoadArgs, Plugin, PluginBuild } from 'esbuild-wasm'
import localforage from 'localforage'
import axios from 'axios'
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url'
import { IFiles, IImportMap } from '@/components/Playground/shared'
import { addReactImport, cssToJs, jsonToJs } from '@/components/Playground/files'

class Compiler {
    private init = false

    fileCache = localforage.createInstance({
        name: 'fileCache'
    })

    constructor() {
        try {
            void esbuild
                .initialize({
                    worker: true,
                    wasmURL: esbuildWasmUrl
                })
                .finally(() => {
                    this.init = true
                })
        } catch (e) {
            this.init = true
        }
    }

    transform = (code: string, loader: Loader) =>
        new Promise<void>((resolve) => {
            if (this.init) {
                resolve()
                return
            }
            const timer = setInterval(() => {
                if (this.init) {
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        }).then(() => {
            return esbuild.transform(code, { loader })
        })

    compile = (files: IFiles, importMap: IImportMap, entryPoint: string) =>
        new Promise<void>((resolve) => {
            if (this.init) {
                resolve()
                return
            }
            const timer = setInterval(() => {
                if (this.init) {
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        }).then(() => {
            return esbuild.build({
                bundle: true,
                entryPoints: [entryPoint],
                format: 'esm',
                metafile: true,
                write: false,
                plugins: [this.fileResolverPlugin(files, importMap, entryPoint)]
            })
        })

    stop = () => {
        void esbuild.stop()
    }

    private fileResolverPlugin = (
        files: IFiles,
        importMap: IImportMap,
        entryPoint: string
    ): Plugin => ({
        name: 'file-resolver-plugin',
        setup: (build: PluginBuild) => {
            build.onResolve({ filter: /.*/ }, (args: esbuild.OnResolveArgs) => {
                if (entryPoint === args.path) {
                    return {
                        namespace: 'OxygenToolbox',
                        path: args.path
                    }
                }
                if (args.path.startsWith('./') && files[args.path.substring(2)]) {
                    return {
                        namespace: 'OxygenToolbox',
                        path: args.path.substring(2)
                    }
                }
                if (args.path.startsWith('./') && files[`${args.path.substring(2)}.tsx`]) {
                    return {
                        namespace: 'OxygenToolbox',
                        path: `${args.path.substring(2)}.tsx`
                    }
                }
                if (args.path.startsWith('./') && files[`${args.path.substring(2)}.jsx`]) {
                    return {
                        namespace: 'OxygenToolbox',
                        path: `${args.path.substring(2)}.jsx`
                    }
                }
                if (args.path.startsWith('./') && files[`${args.path.substring(2)}.ts`]) {
                    return {
                        namespace: 'OxygenToolbox',
                        path: `${args.path.substring(2)}.ts`
                    }
                }
                if (args.path.startsWith('./') && files[`${args.path.substring(2)}.js`]) {
                    return {
                        namespace: 'OxygenToolbox',
                        path: `${args.path.substring(2)}.js`
                    }
                }
                if (/\.\/.*\.css/.test(args.path) && !args.resolveDir) {
                    throw Error(`Css '${args.path}' not found`)
                }

                if (/^https?:\/\/.*/.test(args.path)) {
                    return {
                        namespace: 'default',
                        path: args.path
                    }
                }

                if (
                    args.path.includes('./') ||
                    args.path.includes('../') ||
                    args.path.startsWith('/')
                ) {
                    return {
                        namespace: 'default',
                        path: new URL(args.path, args.resolveDir.substring(1)).href
                    }
                }

                const path = importMap.imports[args.path]

                if (!path) {
                    throw Error(`Import '${args.path}' not found in Import Map`)
                }

                return {
                    namespace: 'default',
                    path
                }
            })

            build.onLoad({ filter: /.*\.css$/ }, (args: OnLoadArgs) => {
                const contents = cssToJs(files[args.path])
                return {
                    loader: 'js',
                    contents
                }
            })

            build.onLoad({ filter: /.*\.json$/ }, (args: OnLoadArgs) => {
                const contents = jsonToJs(files[args.path])
                return {
                    loader: 'js',
                    contents
                }
            })

            build.onLoad({ filter: /.*/ }, async (args: OnLoadArgs) => {
                if (entryPoint === args.path) {
                    return {
                        loader: 'tsx',
                        contents: addReactImport(files[entryPoint].value)
                    }
                }

                if (files[args.path]) {
                    const contents = addReactImport(files[args.path].value)
                    if (args.path.endsWith('.jsx')) {
                        return {
                            loader: 'jsx',
                            contents
                        }
                    }
                    if (args.path.endsWith('.ts')) {
                        return {
                            loader: 'ts',
                            contents
                        }
                    }
                    if (args.path.endsWith('.js')) {
                        return {
                            loader: 'js',
                            contents
                        }
                    }
                    return {
                        loader: 'tsx',
                        contents
                    }
                }

                const cached = await this.fileCache.getItem<esbuild.OnLoadResult>(args.path)

                if (cached) {
                    return cached
                }

                const axiosResponse = await axios.get<string>(args.path)
                const result: esbuild.OnLoadResult = {
                    loader: 'jsx',
                    contents: axiosResponse.data,
                    resolveDir: (axiosResponse.request as XMLHttpRequest).responseURL
                }

                await this.fileCache.setItem(args.path, result)

                return result
            })
        }
    })
}

export default new Compiler()
