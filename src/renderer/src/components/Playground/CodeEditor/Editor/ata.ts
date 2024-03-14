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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ts = await import('https://esm.sh/typescript@5.3.3')
    const ata = setupTypeAcquisition({
        projectName: 'monaco-ts',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        typescript: ts,
        logger: console,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        fetcher: (input, init) => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return fetch(input, init)
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
