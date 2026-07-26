import esbuild, {
    Loader,
    OnLoadArgs,
    OnLoadResult,
    OnResolveArgs,
    OnResolveResult,
    Plugin,
    PluginBuild
} from 'esbuild-wasm'
import wasmURL from 'esbuild-wasm/esbuild.wasm?url'
import localforage from 'localforage'
import axios from 'axios'
import { IFile, IFileTree, IImportMap } from '$/components/Playground/shared'
import { addReactImport, cssToJs, flattenFileTree, jsonToJs } from '$/components/Playground/files'

const NAMESPACE_OXYGEN = 'oxygen'
const NAMESPACE_DEFAULT = 'default'
const FILE_SUFFIXES = ['.tsx', '.jsx', '.ts', '.js', '.css', '.json', '']
const INDEX_FILE_NAMES = ['/index.tsx', '/index.jsx', '/index.ts', '/index.js']

/**
 * Extract the directory portion from a file path.
 * Returns empty string for root-level files.
 */
const dirname = (path: string): string => {
    const idx = path.lastIndexOf('/')
    return idx >= 0 ? path.slice(0, idx) : ''
}

/**
 * Resolve a relative import path (./foo or ../foo) against a base directory.
 * Returns the resolved path WITHOUT extension checks.
 */
const resolveRelative = (importPath: string, resolveDir: string): string => {
    // Strip leading / and trailing /
    const base = resolveDir.replace(/^\/+|\/+$/g, '')
    const url = new URL(importPath, `file:///${base}/`)
    // Strip leading / and trailing /
    return url.pathname.replace(/^\/+|\/+$/g, '')
}

/**
 * Try to find a file entry by path, appending common suffixes if needed.
 */
const findFileEntry = (
    fileMap: Map<string, IFile>,
    path: string
): { fullPath: string; file: IFile } | null => {
    // Try direct match first
    if (fileMap.has(path)) {
        return { fullPath: path, file: fileMap.get(path)! }
    }

    // Try appending suffixes
    for (const suffix of FILE_SUFFIXES) {
        const candidate = `${path}${suffix}`
        if (fileMap.has(candidate)) {
            return { fullPath: candidate, file: fileMap.get(candidate)! }
        }
    }

    // Try as directory with index file
    for (const indexName of INDEX_FILE_NAMES) {
        const candidate = `${path}${indexName}`
        if (fileMap.has(candidate)) {
            return { fullPath: candidate, file: fileMap.get(candidate)! }
        }
    }

    return null
}

/**
 * Find the entry point path in the file map.
 * Tries: exact match → with suffix dedup → search by basename.
 */
const resolveEntryPath = (fileMap: Map<string, IFile>, entryPoint: string): string => {
    const found = findFileEntry(fileMap, entryPoint)
    if (found) {
        return found.fullPath
    }

    // Search by basename (file name without directory)
    for (const [path] of fileMap) {
        const basename = path.split('/').pop()!
        if (basename === entryPoint) {
            return path
        }
        for (const suffix of FILE_SUFFIXES) {
            if (`${basename}${suffix}` === entryPoint) {
                return path
            }
        }
    }

    throw new Error(`Entry point "${entryPoint}" not found in file tree`)
}

class Compiler {
    private initPromise: Promise<void> | null = null
    private initialized = false

    compileCache = localforage.createInstance({
        name: 'compileCache'
    })

    constructor() {
        this.initPromise = esbuild
            .initialize({
                worker: true,
                wasmURL
            })
            .catch(() => {
                // esbuild may already be initialized by another instance;
                // treat as success since subsequent calls will use the shared state.
            })
            .finally(() => {
                this.initialized = true
            })
    }

    private ensureInitialized = async () => {
        if (!this.initialized) {
            await this.initPromise
        }
    }

    transform = async (code: string, loader: Loader) => {
        await this.ensureInitialized()
        return esbuild.transform(code, { loader, target: 'es2015' })
    }

    compile = async (
        fileTree: IFileTree,
        importMap: IImportMap,
        entryPointPath: string,
        onStatus?: (state: 'processing' | 'finish', message: string) => void
    ) => {
        await this.ensureInitialized()
        onStatus?.('processing', 'Resolving file tree…')

        const fileMap = flattenFileTree(fileTree)
        const entryPath = resolveEntryPath(fileMap, entryPointPath)
        onStatus?.('processing', `Compiling ${entryPath}…`)

        return esbuild.build({
            bundle: true,
            entryPoints: [entryPath],
            format: 'esm',
            target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
            metafile: true,
            write: false,
            plugins: [this.fileResolverPlugin(fileMap, importMap, onStatus)]
        })
    }

    compileCss = async (cssCode: string, basePath: string) => {
        await this.ensureInitialized()
        return esbuild.build({
            bundle: true,
            entryPoints: [basePath],
            write: false,
            plugins: [this.cssCodeResolverPlugin(cssCode, basePath)]
        })
    }

    /**
     * Dispose the esbuild instance.
     * After calling this, create a new Compiler to compile again.
     */
    stop = () => {
        void esbuild.stop()
        this.initialized = false
        this.initPromise = null
    }

    // ──────────────────────────── file resolver ────────────────────────────

    private fileResolverPlugin = (
        fileMap: Map<string, IFile>,
        importMap: IImportMap,
        onStatus?: (state: 'processing' | 'finish', message: string) => void
    ): Plugin => ({
        name: 'file-resolver-plugin',
        setup: (build: PluginBuild) => {
            build.onStart(() => {
                onStatus?.('processing', 'Processing imports…')
            })

            build.onEnd(() => {
                onStatus?.('finish', 'Compilation completed')
            })

            build.onResolve({ filter: /.*/ }, (args: OnResolveArgs): OnResolveResult => {
                // 1. Entry point — passthrough to oxygen namespace
                if (args.kind === 'entry-point') {
                    onStatus?.('processing', `  resolve ${args.path}`)
                    return { namespace: NAMESPACE_OXYGEN, path: args.path }
                }

                // 2. Absolute URL — fetch from network
                if (/^https?:\/\//.test(args.path)) {
                    return { namespace: NAMESPACE_DEFAULT, path: args.path }
                }

                // 3. Relative import — try file tree first, then via importer URL
                if (args.path.startsWith('./') || args.path.startsWith('../')) {
                    if (args.namespace === NAMESPACE_OXYGEN || !args.importer) {
                        const resolvedDir = resolveRelative(args.path, args.resolveDir || '')
                        const found = findFileEntry(fileMap, resolvedDir)
                        if (found) {
                            onStatus?.('processing', `  resolve ${found.fullPath}`)
                            return { namespace: NAMESPACE_OXYGEN, path: found.fullPath }
                        }
                        if (!args.importer) {
                            throw new Error(`Cannot resolve import '${args.path}'`)
                        }
                    }
                    // default namespace files: resolve via importer URL (preserves scheme)
                    const url = new URL(args.path, getImporterBaseUrl(args.importer)).href
                    onStatus?.('processing', `Resolve ${url}`)
                    return { namespace: NAMESPACE_DEFAULT, path: url }
                }

                // 4. Root-relative path (/foo) — resolve via importer's origin
                if (args.path.startsWith('/')) {
                    const origin = getImporterOrigin(args.importer)
                    if (origin) {
                        const url = new URL(args.path, origin).href
                        onStatus?.('processing', `Resolve ${url}`)
                        return { namespace: NAMESPACE_DEFAULT, path: url }
                    }
                    // Fallback: try resolveDir as a local path
                    if (args.resolveDir && !/^https?:\/\//.test(args.resolveDir)) {
                        const url = new URL(args.path, `file:///${appendSlash(args.resolveDir)}`)
                            .href
                        onStatus?.('processing', `Resolve ${url}`)
                        return { namespace: NAMESPACE_DEFAULT, path: url }
                    }
                    throw new Error(`Cannot resolve absolute import '${args.path}' without a base`)
                }

                // 5. Bare import (e.g. 'react', 'lodash') — resolve via import map
                const result = this.resolveBareImport(args.path, importMap)
                onStatus?.('processing', `Resolve ${args.path} → ${result.path}`)
                return result
            })

            // ── onLoad: oxygen namespace (in-memory files) ──
            // CSS files: wrap in a style-injection script
            build.onLoad(
                { namespace: NAMESPACE_OXYGEN, filter: /.*\.css$/ },
                (args: OnLoadArgs): OnLoadResult | undefined => {
                    const found = findFileEntry(fileMap, args.path)
                    if (found) {
                        onStatus?.('processing', `Compile ${found.fullPath}`)
                        return {
                            loader: 'js',
                            contents: cssToJs(found.file.content, found.file.fileName),
                            resolveDir: dirname(found.fullPath)
                        }
                    }
                    return undefined
                }
            )
            // JSON files: wrap in export default
            build.onLoad(
                { namespace: NAMESPACE_OXYGEN, filter: /.*\.json$/ },
                (args: OnLoadArgs): OnLoadResult | undefined => {
                    const found = findFileEntry(fileMap, args.path)
                    if (found) {
                        onStatus?.('processing', `Compile ${found.fullPath}`)
                        return {
                            loader: 'js',
                            contents: jsonToJs(found.file.content),
                            resolveDir: dirname(found.fullPath)
                        }
                    }
                    return undefined
                }
            )
            // TSX / JSX / TS / JS files: inject React import if missing
            build.onLoad(
                { namespace: NAMESPACE_OXYGEN, filter: /.*/ },
                (args: OnLoadArgs): OnLoadResult | undefined => {
                    const found = findFileEntry(fileMap, args.path)
                    if (found) {
                        onStatus?.('processing', `Compile ${found.fullPath}`)
                        return {
                            loader: found.file.language === 'javascript' ? 'jsx' : 'tsx',
                            contents: addReactImport(found.file.content),
                            resolveDir: dirname(found.fullPath)
                        }
                    }
                    return undefined
                }
            )

            // ── onLoad: default namespace (remote / CDN files) ──
            build.onLoad({ filter: /.*/ }, async (args: OnLoadArgs): Promise<OnLoadResult> => {
                const cached = await this.compileCache.getItem<OnLoadResult>(args.path)
                if (cached) {
                    onStatus?.('processing', `Cached ${args.path}`)
                    return cached
                }

                onStatus?.('processing', `Fetch ${args.path}`)

                const axiosResponse = await axios.get<ArrayBuffer>(args.path, {
                    responseType: 'arraybuffer'
                })
                const contentType = (axiosResponse.headers['content-type'] as string) || ''
                const isCSS = contentType.includes('css')
                const isJSON = contentType.includes('json')
                const utf8Decoder = new TextDecoder('utf-8')

                const result: OnLoadResult = {
                    loader: (() => {
                        if (isCSS || isJSON || contentType.includes('javascript')) {
                            return 'js'
                        }
                        return 'base64'
                    })(),
                    contents: await (async () => {
                        if (isCSS) {
                            const compiled = await this.compileCss(
                                utf8Decoder.decode(axiosResponse.data),
                                args.path
                            )
                            return cssToJs(compiled.outputFiles[0].text)
                        }
                        if (isJSON) {
                            return jsonToJs(utf8Decoder.decode(axiosResponse.data))
                        }
                        return new Uint8Array(axiosResponse.data)
                    })(),
                    resolveDir: ''
                }

                await this.compileCache.setItem(args.path, result)
                return result
            })
        }
    })

    // ── bare import resolution ──

    private resolveBareImport = (importPath: string, importMap: IImportMap): OnResolveResult => {
        // Look up the import path directly in the import map
        let url = importMap[importPath]

        // Walk up the path segments to find a prefix match
        if (!url) {
            let prefix = importPath
            while (!url && prefix.includes('/')) {
                prefix = prefix.slice(0, prefix.lastIndexOf('/'))
                if (importMap[prefix]) {
                    const suffix = importPath.slice(prefix.length)
                    const baseUrl = new URL(importMap[prefix])
                    url = `${baseUrl.origin}${baseUrl.pathname}${suffix}${baseUrl.search}`
                }
            }
        }

        if (!url) {
            throw new Error(`Import '${importPath}' not found in import map`)
        }

        // Mark all import-map keys as external so esbuild preserves bare
        // imports for those modules (they'll be resolved again later).
        const urlObj = new URL(url)
        const declaredExternal =
            urlObj.searchParams.get('external')?.split(',').filter(Boolean) ?? []
        const externals = Object.keys(importMap).filter((item) => !declaredExternal.includes(item))
        if (externals.length > 0) {
            urlObj.searchParams.set('external', externals.join(','))
        }

        return {
            namespace: NAMESPACE_DEFAULT,
            path: urlObj.href
        }
    }

    // ──────────────────────────── CSS resolver ─────────────────────────────

    private cssCodeResolverPlugin = (cssCode: string, basePath: string): Plugin => ({
        name: 'css-code-resolver-plugin',
        setup: (build: PluginBuild) => {
            build.onResolve({ filter: /.*/ }, (args: OnResolveArgs): OnResolveResult => {
                if (args.kind === 'entry-point') {
                    return { namespace: NAMESPACE_DEFAULT, path: basePath }
                }
                const baseUrl = getImporterBaseUrl(args.importer || basePath)
                return {
                    namespace: NAMESPACE_DEFAULT,
                    path: new URL(args.path, baseUrl).href
                }
            })

            build.onLoad({ filter: /.*/ }, async (args: OnLoadArgs): Promise<OnLoadResult> => {
                if (args.path === basePath) {
                    return {
                        loader: 'css',
                        contents: cssCode,
                        resolveDir: ''
                    }
                }

                const cached = await this.compileCache.getItem<OnLoadResult>(args.path)
                if (cached) {
                    return cached
                }

                const axiosResponse = await axios.get<ArrayBuffer>(args.path, {
                    responseType: 'arraybuffer'
                })
                const contentType = (axiosResponse.headers['content-type'] as string) || ''
                const utf8Decoder = new TextDecoder('utf-8')

                const isCSS = contentType.includes('css')
                const result: OnLoadResult = {
                    loader: isCSS ? 'js' : 'dataurl',
                    contents: isCSS
                        ? cssToJs(
                              (
                                  await this.compileCss(
                                      utf8Decoder.decode(axiosResponse.data),
                                      args.path
                                  )
                              ).outputFiles[0].text
                          )
                        : new Uint8Array(axiosResponse.data),
                    resolveDir: ''
                }

                await this.compileCache.setItem(args.path, result)
                return result
            })
        }
    })
}

// ──────────────────────────── helpers ─────────────────────────────

/** Ensure a URL/path ends with / so `new URL(rel, base)` treats base as directory. */
const appendSlash = (url: string): string => {
    return url.endsWith('/') ? url : `${url}/`
}

/** Get the directory URL of the importer file (e.g. `https://esm.sh/foo/` for `https://esm.sh/foo/bar`). */
const getImporterBaseUrl = (importer: string): string => {
    const idx = importer.lastIndexOf('/')
    return idx >= 0 ? importer.slice(0, idx + 1) : `${importer}/`
}

/** Get the origin from an importer URL, or empty string if it's not a valid URL. */
const getImporterOrigin = (importer: string): string => {
    try {
        return new URL(importer).origin
    } catch {
        return ''
    }
}

export default new Compiler()
