import { ReactNode } from 'react'
import FullscreenLoadingMask from '$/components/FullscreenLoadingMask'

const ConfigContext = createContext<ConfigState>({
    mode: 'loading',
    config: null,
    error: null
})

interface ConfigProviderProps {
    children: ReactNode
    fallback?: ReactNode
}

export const ConfigProvider = ({ children, fallback }: ConfigProviderProps) => {
    const [state, setState] = useState<ConfigState>({
        mode: 'loading',
        config: null,
        error: null
    })

    useEffect(() => {
        oxygenApi.app.config.get().then((state) => {
            setState(state)
        })
        oxygenApi.app.config.onUpdate((state) => {
            setState(state)
        })

        return () => {
            oxygenApi.app.config.offUpdate()
        }
    }, [])

    if (state.mode === 'loading') {
        return fallback ? fallback : <FullscreenLoadingMask />
    }

    return <ConfigContext.Provider value={state}>{children}</ConfigContext.Provider>
}

export const useConfig = () => {
    const context = useContext(ConfigContext)
    if (!context) {
        throw new Error('useConfig must be used within ConfigProvider')
    }

    return context
}

export const useIsConfigLoaded = (): boolean => {
    const { mode, config } = useConfig()
    return mode !== 'loading' && config !== null
}

export const useReloadConfig = () => {
    return async () => {
        await oxygenApi.app.config.reload()
    }
}

export const useSystemConfig = (): SystemConfig => {
    const { config } = useConfig()
    if (!config) {
        throw new Error('Config not loaded')
    }
    return config
}

export const useConfigValue = <K extends keyof SystemConfig>(key: K): SystemConfig[K] => {
    const { config } = useConfig()
    if (!config) {
        throw new Error(`Config not loaded when accessing ${String(key)}`)
    }
    return config[key]
}

export const useConfigValueSafe = <K extends keyof SystemConfig>(
    key: K
): SystemConfig[K] | undefined => {
    const { config } = useConfig()
    return config?.[key]
}

export function useConfigValues<const K extends readonly (keyof SystemConfig)[]>(
    keys: K
): { [P in keyof K]: SystemConfig[K[P] & keyof SystemConfig] } {
    const { config } = useConfig()
    if (!config) {
        throw new Error('Config not loaded')
    }

    return keys.map((key) => config[key]) as unknown as {
        [P in keyof K]: SystemConfig[K[P] & keyof SystemConfig]
    }
}
