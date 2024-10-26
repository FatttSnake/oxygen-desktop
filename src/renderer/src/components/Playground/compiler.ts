import esbuild, {
    Loader,
    OnLoadArgs,
    OnLoadResult,
    OnResolveArgs,
    OnResolveResult,
    Plugin,
    PluginBuild
} from 'esbuild-wasm'
import localforage from 'localforage'
import axios from 'axios'
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url'
import { IFile, IFiles, IImportMap } from '@/components/Playground/shared'
import {
    addReactImport,
    cssToJs,
    cssToJsFromFile,
    jsonToJs,
    jsonToJsFromFile
} from '@/components/Playground/files'

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

    private waitInit = async () => {
        if (!this.init) {
            await new Promise<void>((resolve) => {
                const checkInit = () => {
                    if (this.init) {
                        resolve()
                    } else {
                        setTimeout(checkInit, 100)
                    }
                }
                checkInit()
            })
        }
    }

    transform = async (code: string, loader: Loader) => {
        await this.waitInit()
        return esbuild.transform(code, { loader })
    }

    compile = async (files: IFiles, importMap: IImportMap, entryPoint: string) => {
        await this.waitInit()
        return esbuild.build({
            bundle: true,
            entryPoints: [entryPoint],
            format: 'esm',
            metafile: true,
            write: false,
            plugins: [this.fileResolverPlugin(files, importMap)]
        })
    }

    compileCss = async (cssCode: string, basePath: string) => {
        await this.waitInit()
        return esbuild.build({
            bundle: true,
            entryPoints: [basePath],
            write: false,
            plugins: [this.cssCodeResolverPlugin(cssCode, basePath)]
        })
    }

    stop = () => {
        void esbuild.stop()
    }

    private fileResolverPlugin = (files: IFiles, importMap: IImportMap): Plugin => ({
        name: 'file-resolver-plugin',
        setup: (build: PluginBuild) => {
            build.onResolve({ filter: /.*/ }, (args: OnResolveArgs): OnResolveResult => {
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

                let path = importMap[args.path]
                let tempPath = args.path
                while (!path && tempPath.includes('/')) {
                    tempPath = tempPath.substring(0, tempPath.lastIndexOf('/'))
                    if (importMap[tempPath]) {
                        const suffix = args.path.replace(tempPath, '')
                        const importUrl = new URL(importMap[tempPath])
                        path = `${importUrl.origin}${importUrl.pathname}${suffix}${importUrl.search}`
                    }
                }
                if (!path) {
                    throw Error(`Import '${args.path}' not found in Import Map`)
                }
                const pathUrl = new URL(path)
                const externals = pathUrl.searchParams.get('external')?.split(',') ?? []
                Object.keys(importMap).forEach((item) => {
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

            build.onLoad({ filter: /.*\.css$/ }, (args: OnLoadArgs): OnLoadResult => {
                const contents = cssToJsFromFile(files[args.path])
                return {
                    loader: 'js',
                    contents
                }
            })

            build.onLoad({ filter: /.*\.json$/ }, (args: OnLoadArgs): OnLoadResult => {
                const contents = jsonToJsFromFile(files[args.path])
                return {
                    loader: 'js',
                    contents
                }
            })

            build.onLoad(
                { namespace: 'oxygen', filter: /.*/ },
                (args: OnLoadArgs): OnLoadResult | undefined => {
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
                }
            )

            build.onLoad({ filter: /.*/ }, async (args: OnLoadArgs): Promise<OnLoadResult> => {
                const cached = await this.fileCache.getItem<OnLoadResult>(args.path)

                if (cached) {
                    return cached
                }

                const axiosResponse = await axios.get<ArrayBuffer>(args.path, {
                    responseType: 'arraybuffer'
                })
                const contentType = axiosResponse.headers['content-type'] as string
                const utf8Decoder = new TextDecoder('utf-8')
                const result: OnLoadResult = {
                    loader: (() => {
                        if (
                            contentType.includes('javascript') ||
                            contentType.includes('css') ||
                            contentType.includes('json')
                        ) {
                            return 'js'
                        }
                        return 'base64'
                    })(),
                    contents: await (async () => {
                        if (contentType.includes('css')) {
                            return cssToJs(
                                (
                                    await this.compileCss(
                                        utf8Decoder.decode(axiosResponse.data),
                                        args.path
                                    )
                                ).outputFiles[0].text
                            )
                        }
                        if (contentType.includes('json')) {
                            return jsonToJs(utf8Decoder.decode(axiosResponse.data))
                        }
                        return new Uint8Array(axiosResponse.data)
                    })(),
                    resolveDir: args.path
                }

                await this.fileCache.setItem(args.path, result)

                return result
            })
        }
    })

    private cssCodeResolverPlugin = (cssCode: string, basePath: string): Plugin => ({
        name: 'css-code-resolver-plugin',
        setup: (build: PluginBuild) => {
            build.onResolve({ filter: /.*/ }, (args: OnResolveArgs): OnResolveResult => {
                if (args.kind === 'entry-point') {
                    return {
                        namespace: 'default',
                        path: basePath
                    }
                }
                return {
                    namespace: 'default',
                    path: args.resolveDir.length
                        ? new URL(args.path, args.resolveDir.substring(1)).href
                        : new URL(args.path, basePath).href
                }
            })

            build.onLoad({ filter: /.*/ }, async (args: OnLoadArgs): Promise<OnLoadResult> => {
                if (args.path === basePath) {
                    return {
                        loader: 'css',
                        contents: cssCode,
                        resolveDir: basePath
                    }
                }
                const cached = await this.fileCache.getItem<OnLoadResult>(args.path)

                if (cached) {
                    return cached
                }

                const axiosResponse = await axios.get<ArrayBuffer>(args.path, {
                    responseType: 'arraybuffer'
                })
                const contentType = axiosResponse.headers['content-type'] as string
                const utf8Decoder = new TextDecoder('utf-8')
                const result: OnLoadResult = {
                    loader: (() => {
                        if (contentType.includes('css')) {
                            return 'js'
                        }
                        return 'dataurl'
                    })(),
                    contents: await (async () => {
                        if (contentType.includes('css')) {
                            return cssToJs(
                                (
                                    await this.compileCss(
                                        utf8Decoder.decode(axiosResponse.data),
                                        args.path
                                    )
                                ).outputFiles[0].text
                            )
                        }
                        return new Uint8Array(axiosResponse.data)
                    })(),
                    resolveDir: args.path
                }

                await this.fileCache.setItem(args.path, result)

                return result
            })
        }
    })
}

export default new Compiler()
