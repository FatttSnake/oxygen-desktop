import esbuild, { Loader, OnLoadArgs, Plugin, PluginBuild } from 'esbuild-wasm'
import localforage from 'localforage'
import axios from 'axios'
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url'
import { IFile, IFiles, IImportMap } from '@/components/Playground/shared'
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
                plugins: [this.fileResolverPlugin(files, importMap)]
            })
        })

    stop = () => {
        void esbuild.stop()
    }

    private fileResolverPlugin = (files: IFiles, importMap: IImportMap): Plugin => ({
        name: 'file-resolver-plugin',
        setup: (build: PluginBuild) => {
            build.onResolve({ filter: /.*/ }, (args: esbuild.OnResolveArgs) => {
                if (args.kind === 'entry-point') {
                    return {
                        namespace: 'oxygen',
                        path: args.path
                    }
                }
                if (/^https?:\/\/.*/.test(args.path)) {
                    return {
                        namespace: 'default',
                        path: args.path
                    }
                }

                if (
                    args.path.startsWith('./') &&
                    (!args.resolveDir.length || args.resolveDir in files)
                ) {
                    const suffix = ['', '.tsx', '.jsx', '.ts', '.js'].find((suffix) => {
                        return files[`${args.path.substring(2)}${suffix}`]
                    })
                    if (suffix !== undefined) {
                        return {
                            namespace: 'oxygen',
                            path: `${args.path.substring(2)}${suffix}`
                        }
                    }
                }
                if (['./', '../', '/'].some((prefix) => args.path.startsWith(prefix))) {
                    return {
                        namespace: 'default',
                        path: new URL(args.path, args.resolveDir.substring(1)).href
                    }
                }

                let path = importMap.imports[args.path]
                let tempPath = args.path
                while (!path && tempPath.includes('/')) {
                    tempPath = tempPath.substring(0, tempPath.lastIndexOf('/'))
                    if (importMap.imports[tempPath]) {
                        const suffix = args.path.replace(tempPath, '')
                        const importUrl = new URL(importMap.imports[tempPath])
                        path = `${importUrl.origin}${importUrl.pathname}${suffix}${importUrl.search}`
                    }
                }
                if (!path) {
                    throw Error(`Import '${args.path}' not found in Import Map`)
                }
                const pathUrl = new URL(path)
                const externals = pathUrl.searchParams.get('external')?.split(',') ?? []
                Object.keys(importMap.imports).forEach((item) => {
                    if (!(item in externals)) {
                        externals.push(item)
                    }
                })
                pathUrl.searchParams.set('external', externals.join(','))
                return {
                    namespace: 'default',
                    path: pathUrl.href
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

            build.onLoad({ namespace: 'oxygen', filter: /.*/ }, (args: OnLoadArgs) => {
                let file: IFile | undefined

                void ['', '.tsx', '.jsx', '.ts', '.js'].forEach((suffix) => {
                    file = file || files[`${args.path}${suffix}`]
                })
                if (file) {
                    return {
                        loader: (() => {
                            switch (file.language) {
                                case 'javascript':
                                    return 'jsx'
                                default:
                                    return 'tsx'
                            }
                        })(),
                        contents: addReactImport(file.value)
                    }
                }
            })

            build.onLoad({ filter: /.*/ }, async (args: OnLoadArgs) => {
                const cached = await this.fileCache.getItem<esbuild.OnLoadResult>(args.path)

                if (cached) {
                    return cached
                }

                const axiosResponse = await axios.get<string>(args.path)
                const result: esbuild.OnLoadResult = {
                    loader: 'js',
                    contents: axiosResponse.data,
                    resolveDir: args.path
                }

                await this.fileCache.setItem(args.path, result)

                return result
            })
        }
    })
}

export default new Compiler()
