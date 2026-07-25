interface WindowControlsOverlay {
    getTitlebarAreaRect(): DOMRect
    visible: boolean
}

interface Navigator {
    windowControlsOverlay?: WindowControlsOverlay
}

type Renderer = 'frame' | 'core' | 'settings' | 'sign' | 'tool'

type TabType = 'core' | 'settings' | 'sign' | 'tool'

type WindowType = 'main' | 'independent'

interface OxygenAPI {
    platform: NodeJS.Platform
    renderer: Renderer
    windowType?: WindowType
    windowId?: string
    viewId: string
    windowIcon?: string
    windowTitle?: string
    navigateTo?: string
    toolInfo?: string
    app: {
        url: {
            open: (url: string) => void
        }
        version: {
            get: () => Promise<string>
        }
    }
    window: {
        base: {
            close: (key: string) => void
            afterLoad: () => void
            onIcon: (callback: (icon: string) => void) => void
            offIcon: () => void
            onTitle: (callback: (title: string) => void) => void
            offTitle: () => void
        }
        theme: {
            get: () => Promise<WindowTheme>
            onUpdate: (callback: (theme: WindowTheme) => void) => void
            offUpdate: () => void
            update: (theme: WindowTheme) => void
        }
        titleBarOverlay: {
            setColor: (color: string, symbolColor: string) => void
        }
        tab: {
            create: (
                type: TabType,
                args?: Record<string, string | number | boolean>
            ) => Promise<string>
            list: () => Promise<TabInstance[]>
            onUpdate: (callback: (tabs: TabInstance[]) => void) => void
            offUpdate: () => void
            update: (tabs: TabInstance[]) => void
            onSwitch: (callback: (key: string) => void) => void
            offSwitch: () => void
            switch: (key: string) => Promise<boolean>
            close: (key: string) => void
            onClosed: (callback: (key: string) => void) => void
            offClosed: () => void
            independent: (key: string) => void
            icon: (key: string, icon: string) => void
            title: (key: string, title: string) => void
        }
        navigate: {
            onGoto: (callback: (value: string) => void) => void
            offGoto: () => void
        }
    }
    sidebar: {
        width: {
            update: (width: number) => void
        }
        collapse: {
            get: () => Promise<boolean>
            onUpdate: (callback: (value: boolean) => void) => void
            offUpdate: () => void
            update: (value: boolean) => void
        }
        menu: {
            update: () => void
            onUpdate: (callback: () => void) => void
            offUpdate: () => void
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
            offUpdate: () => void
            update: (value?: string) => void
        }
        refreshToken: {
            get: () => Promise<string | undefined>
            onUpdate: (callback: (value?: string) => void) => void
            offUpdate: () => void
            update: (value?: string) => void
        }
        userInfo: {
            get: () => Promise<UserWithPowerInfoVo | undefined>
            onUpdate: (callback: (value?: UserWithPowerInfoVo) => void) => void
            offUpdate: () => void
            update: (value?: UserWithPowerInfoVo) => void
        }
        loginStatus: {
            onUpdate: (callback: (isLogin: boolean) => void) => void
            offUpdate: () => void
            update: (isLogin: boolean) => void
        }
    }
    tool: {
        view: {
            onLoad: (
                callback: (
                    username: string,
                    toolId: string,
                    platform?: Platform,
                    ver?: string,
                    source?: string
                ) => void
            ) => void
            offLoad: () => void
            load: (
                username: string,
                toolId: string,
                platform?: Platform,
                ver?: string,
                source?: string
            ) => void
            render: (dist: string, key?: string) => void
        }
    }
}

declare const oxygenApi: OxygenAPI
