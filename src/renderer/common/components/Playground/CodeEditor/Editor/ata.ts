import typescript from 'typescript'
import { ATABootstrapConfig, setupTypeAcquisition } from '@typescript/ata'

type DelegateListener = Required<{
    [k in keyof ATABootstrapConfig['delegate']]: Set<NonNullable<ATABootstrapConfig['delegate'][k]>>
}>

const createDelegate = (): DelegateListener => {
    return {
        receivedFile: new Set(),
        progress: new Set(),
        errorMessage: new Set(),
        finished: new Set(),
        started: new Set()
    }
}

const delegateListener = createDelegate()

type InferSet<T> = T extends Set<infer U> ? U : never

export interface TypeHelper {
    dispose: () => void
    acquireType: (code: string) => void
    removeListener: <T extends keyof DelegateListener>(
        event: T,
        handler: InferSet<DelegateListener[T]>
    ) => void
    addListener: <T extends keyof DelegateListener>(
        event: T,
        handler: InferSet<DelegateListener[T]>
    ) => void
}

/**
 * Intercept JSDelivr resolve API calls and replace `@latest` with the version
 * pinned in the importMap, so ATA downloads type definitions matching the
 * runtime versions rather than the latest npm release.
 *
 * ATA's resolution chain:
 *   1. data.jsdelivr.com/v1/package/resolve/npm/{pkg}@latest  ←  intercept here
 *   2. data.jsdelivr.com/v1/package/npm/{pkg}@{version}/flat
 *   3. cdn.jsdelivr.net/npm/{pkg}@{version}/package.json
 *   4. cdn.jsdelivr.net/npm/{pkg}@{version}/.d.ts files
 *
 * By rewriting step 1, all subsequent requests automatically use the pinned version.
 *
 * URL patterns:
 *   data.jsdelivr.com/v1/package/resolve/npm/react@latest
 *   data.jsdelivr.com/v1/package/resolve/npm/@mui/material@latest
 *   data.jsdelivr.com/v1/package/resolve/npm/@types/react@latest
 */
const rewriteResolveUrl = (urlStr: string, versionMap: Record<string, string>): string | null => {
    try {
        const url = new URL(urlStr)
        if (url.hostname !== 'data.jsdelivr.com') return null

        // Match the resolve API path and extract the package name.
        // Groups:
        //   1 — full package name (react / @mui/material / @types/react)
        const pathMatch = url.pathname.match(
            /^\/v1\/package\/resolve\/npm\/((?:@[^/]+\/)?[^@]+)@latest/
        )
        if (!pathMatch) return null

        const packageName = pathMatch[1]

        // Strip @types/ prefix so a versionMap entry for "react" also catches
        // DefinitelyTyped resolve calls for "@types/react".
        const lookupName = packageName.replace(/^@types\//, '')
        const pinnedVersion = versionMap[lookupName]
        if (!pinnedVersion) return null

        // Replace @latest with the pinned version
        url.pathname = url.pathname.replace(/((?:@[^/]+\/)?[^@]+)@latest/, `$1@${pinnedVersion}`)
        return url.toString()
    } catch {
        return null
    }
}

export const createATA = async (versionMap?: Record<string, string>): Promise<TypeHelper> => {
    const maxConcurrentRequests = 50
    let activeRequests = 0
    const requestQueue: Array<() => void> = []
    const fetchWithQueue = (input: RequestInfo | URL, init?: RequestInit | undefined) =>
        new Promise<Response>((resolve, reject) => {
            const attemptRequest = () => {
                if (activeRequests < maxConcurrentRequests) {
                    activeRequests++
                    fetch(input, init)
                        .then((response) => resolve(response))
                        .catch((error) => reject(error))
                        .finally(() => {
                            activeRequests--
                            if (requestQueue.length > 0) {
                                requestQueue.shift()?.()
                            }
                        })
                } else {
                    requestQueue.push(attemptRequest)
                }
            }
            attemptRequest()
        })

    const ata = setupTypeAcquisition({
        projectName: 'monaco-ts',
        typescript,
        logger: console,
        fetcher: async (
            input: RequestInfo | URL,
            init: RequestInit | undefined
        ): Promise<Response> => {
            try {
                // Rewrite the resolve URL if the package is in the importMap's
                // version map, so ATA fetches the pinned version's types.
                if (versionMap && Object.keys(versionMap).length > 0) {
                    const urlStr =
                        typeof input === 'string'
                            ? input
                            : input instanceof URL
                              ? input.href
                              : input.url
                    const rewritten = rewriteResolveUrl(urlStr, versionMap)
                    if (rewritten && rewritten !== urlStr) {
                        return fetchWithQueue(rewritten, init)
                    }
                }
                return fetchWithQueue(input, init)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
            return new Promise(() => {})
        },
        delegate: {
            receivedFile: (code, path) => {
                delegateListener.receivedFile.forEach((fn) => fn(code, path))
            },
            started: () => {
                delegateListener.started.forEach((fn) => fn())
            },
            progress: (downloaded, estimatedTotal) => {
                delegateListener.progress.forEach((fn) => fn(downloaded, estimatedTotal))
            },
            finished: (files) => {
                delegateListener.finished.forEach((fn) => fn(files))
            }
        }
    })

    const acquireType = (code: string) => ata(code)

    const addListener = <T extends keyof DelegateListener>(
        event: T,
        handler: InferSet<DelegateListener[T]>
    ) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        delegateListener[event].add(handler)
    }

    const removeListener = <T extends keyof DelegateListener>(
        event: T,
        handler: InferSet<DelegateListener[T]>
    ) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        delegateListener[event].delete(handler)
    }

    const dispose = () => {
        for (const key in delegateListener) {
            delegateListener[key as keyof DelegateListener].clear()
        }
    }

    return {
        acquireType,
        addListener,
        removeListener,
        dispose
    }
}
