interface WindowControlsOverlay {
    getTitlebarAreaRect(): DOMRect
    visible: boolean
}

interface Navigator {
    windowControlsOverlay?: WindowControlsOverlay
}

type Renderer = 'frame' | 'core' | 'settings' | 'sign' | 'tool'

type TabType = 'core' | 'settings' | 'sign' | 'tool'

interface OxygenAPI {
    platform: NodeJS.Platform
    renderer: Renderer
    navigateTo?: string
    app: {
        url: {
            open: (url: string) => void
        }
        version: {
            get: () => Promise<string>
        }
    }
    window: {
        theme: {
            get: () => Promise<WindowTheme>
            onUpdate: (callback: (theme: WindowTheme) => void) => void
            update: (theme: WindowTheme) => void
        }
        titleBarOverlay: {
            setColor: (color: string, symbolColor: string) => void
        }
        tab: {
            create: (type: TabType, args?: Record<string, string | number | boolean>) => void
            list: () => Promise<TabInstance[]>
            onUpdate: (callback: (tabs: TabInstance[]) => void) => void
            update: (tabs: TabInstance[]) => void
            onSwitch: (callback: (key: string) => void) => void
            switch: (key: string) => Promise<boolean>
            close: (key: string) => void
            independent: (key: string) => void
        }
        navigate: {
            onGoto: (callback: (value: string) => void) => void
        }
    }
    sidebar: {
        width: {
            update: (width: number) => void
        }
        collapse: {
            get: () => Promise<boolean>
            onUpdate: (callback: (value: boolean) => void) => void
            update: (value: boolean) => void
        }
    }
    account: {
        loginAccount: {
            get: () => Promise<string | undefined>
            update: (value?: string) => void
        }
        accessToken: {
            get: () => Promise<string | undefined>
            onUpdate: (callback: (value?: string) => void) => void
            update: (value?: string) => void
        }
        refreshToken: {
            get: () => Promise<string | undefined>
            onUpdate: (callback: (value?: string) => void) => void
            update: (value?: string) => void
        }
        userInfo: {
            get: () => Promise<UserWithPowerInfoVo | undefined>
            onUpdate: (callback: (value?: UserWithPowerInfoVo) => void) => void
            update: (value?: UserWithPowerInfoVo) => void
        }
        loginStatus: {
            onUpdate: (callback: (isLogin: boolean) => void) => void
            update: (isLogin: boolean) => void
        }
    }
}

declare const oxygenApi: OxygenAPI
