/// <reference types="./electron" />

type Platform = 'WEB' | 'DESKTOP' | 'ANDROID'

interface ImportMetaEnv {
    readonly VITE_PLATFORM: Platform
    readonly VITE_DESKTOP_PROTOCOL: string
    readonly VITE_APP_PROTOCOL: string
    readonly VITE_UI_URL: string
    readonly VITE_API_URL: string
    readonly VITE_API_TOKEN_URL: string
    readonly VITE_TURNSTILE_SITE_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

interface SharedObject {
    menuWidth: number
    mainWindowViews: {
        key: string
        view: _WebContentsView
        icon?: string
        title: string
        pin?: boolean
        persistent?: boolean
    }[]
    independentWindows: Record<string, _BrowserWindow>
}

interface Tab {
    key: string
    icon?: string
    title: string
    pin?: boolean
    persistent?: boolean
}

interface WindowBounds {
    width: number
    height: number
}

type WindowTheme = 'FOLLOW_SYSTEM' | 'LIGHT' | 'DARK'

interface SideBarMenuItem {
    authorUsername: string
    icon: string
    platform: Platform
    toolId: string
    toolName: string
    version: string
}

interface StoreSchema {
    window_bounds: WindowBounds
    window_isMaximize: boolean
    window_theme: WindowTheme
    sidebar_isCollapsed: boolean
    sidebar_menuItems: SideBarMenuItem[]
}
