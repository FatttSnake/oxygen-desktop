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

export const createATA = async (): Promise<TypeHelper> => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const ts = await import('https://esm.sh/typescript@5.6.3')

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
        typescript: ts,
        logger: console,
        fetcher: (input, init) => {
            try {
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
