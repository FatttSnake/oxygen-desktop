import { IpcEvents } from '#/constants'
import { settings } from '#/dataStore'
import WindowManager from '#/app/windowManager'

class ConfigManager {
    private static instance: ConfigManager
    private mode: ConnectivityMode = 'loading'
    private config: SystemConfig | null = null
    private error: Error | null = null
    private probing = false

    static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager()
        }

        return ConfigManager.instance
    }

    start(): void {
        const cached = settings.config.getCache()
        if (cached) {
            this.config = cached
            this.notify()
        }
        void this.probe()
    }

    getState(): ConfigState {
        return {
            mode: this.mode,
            config: this.config,
            error: this.error
        }
    }

    getMode(): ConnectivityMode {
        return this.mode
    }

    async reload(): Promise<ConfigState> {
        await this.probe()
        return this.getState()
    }

    private async probe(): Promise<void> {
        if (this.probing) {
            return
        }
        this.probing = true
        try {
            const config = await this.fetchRemoteConfig()
            this.config = config
            this.mode = 'online'
            this.error = null
            settings.config.saveCache(config)
        } catch (error) {
            this.mode = 'offline'
            this.error = error instanceof Error ? error : new Error(String(error))
        } finally {
            this.probing = false
            this.notify()
        }
    }

    private async fetchRemoteConfig(): Promise<RemoteConfig> {
        try {
            const remoteUrl = new URL('/config', import.meta.env.VITE_API_URL)

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 3e4)

            const response = await fetch(remoteUrl, {
                signal: controller.signal,
                cache: 'no-cache'
            })
            clearTimeout(timeoutId)

            if (!response.ok) {
                throw new Error(`Failed to load remote config: ${response.status}`)
            }
            const config = await response.json()

            this.validateRemoteConfig(config)
            return config as RemoteConfig
        } catch (error) {
            console.error('Failed to load remote config:', error)
            throw error
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private validateRemoteConfig(config: any): asserts config is RemoteConfig {
        const REQUIRED_CONFIG_FIELDS: (keyof RemoteConfig)[] = [
            'systemName',
            'desktopProtocol',
            'applicationProtocol',
            'tokenExpiryBufferMs',
            'tokenExpiryCheckIntervalMs',
            'turnstileSiteKey',
            'homeUrl',
            'getAndroidAppUrl'
        ]

        for (const field of REQUIRED_CONFIG_FIELDS) {
            if (config[field] === undefined || config[field] === null) {
                throw new Error(`Missing remote config field: ${field}`)
            }
        }
    }

    private notify(): void {
        const state = this.getState()
        WindowManager.windows.forEach((windowInfo) =>
            windowInfo.forEachWebContents((item) => item.send(IpcEvents.app.config.update, state))
        )
    }
}

export default ConfigManager.getInstance()
