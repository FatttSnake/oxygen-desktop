type Platform = 'WEB' | 'DESKTOP' | 'ANDROID'

interface ImportMetaEnv {
    readonly VITE_PLATFORM: Platform
    readonly VITE_PROTOCOL: string
    readonly VITE_API_URL: string
    readonly VITE_API_TOKEN_URL: string
    readonly VITE_TURNSTILE_SITE_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
