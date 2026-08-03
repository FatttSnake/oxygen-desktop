import { ipcRenderer } from 'electron'
import { IpcEvents } from '%/constants'

export const kebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

export const getArgv = (key: string) => {
    const value = process.argv.find((arg) => arg.startsWith(`--${kebabCase(key)}=`))?.split('=')[1]
    return value ? decodeURIComponent(value) : undefined
}

export const createApi = (
    windowId?: string,
    listeners: Record<string, IpcRendererEventListener> = {}
) => ({
    app: {
        url: {
            open: (url: string) => ipcRenderer.send(IpcEvents.app.url.open, url)
        },
        version: {
            get: (): Promise<string> => ipcRenderer.invoke(IpcEvents.app.version.get)
        }
    },
    window: {
        base: {
            close: (key: string) => ipcRenderer.send(IpcEvents.window.base.close, key),
            afterLoad: () => ipcRenderer.send(IpcEvents.window.base.afterLoad, windowId),
            onIcon: (callback: (icon: string) => void) => {
                listeners[IpcEvents.window.base.icon] = (_, icon: string) => callback(icon)
                ipcRenderer.on(IpcEvents.window.base.icon, listeners[IpcEvents.window.base.icon])
            },
            offIcon: () =>
                ipcRenderer.off(IpcEvents.window.base.icon, listeners[IpcEvents.window.base.icon]),
            onTitle: (callback: (title: string) => void) => {
                listeners[IpcEvents.window.base.title] = (_, title: string) => callback(title)
                ipcRenderer.on(IpcEvents.window.base.title, listeners[IpcEvents.window.base.title])
            },
            offTitle: () =>
                ipcRenderer.off(IpcEvents.window.base.title, listeners[IpcEvents.window.base.title])
        },
        theme: {
            get: (): Promise<WindowTheme> => ipcRenderer.invoke(IpcEvents.window.theme.get),
            onUpdate: (callback: (theme: WindowTheme) => void) => {
                listeners[IpcEvents.window.theme.update] = (_, theme: WindowTheme) =>
                    callback(theme)
                ipcRenderer.on(
                    IpcEvents.window.theme.update,
                    listeners[IpcEvents.window.theme.update]
                )
            },
            offUpdate: () =>
                ipcRenderer.off(
                    IpcEvents.window.theme.update,
                    listeners[IpcEvents.window.theme.update]
                ),
            update: (theme: WindowTheme) => ipcRenderer.send(IpcEvents.window.theme.update, theme)
        },
        titleBarOverlay: {
            setColor: (color: string, symbolColor: string) =>
                ipcRenderer.send(IpcEvents.window.titleBarOverlay.setColor, color, symbolColor)
        },
        tab: {
            create: (type: TabType, args?: Record<string, string | number | boolean>) =>
                ipcRenderer.invoke(IpcEvents.window.tab.create, type, args),
            list: (): Promise<Tab[]> => ipcRenderer.invoke(IpcEvents.window.tab.list),
            onUpdate: (callback: (tabs: Tab[]) => void) => {
                listeners[IpcEvents.window.tab.update] = (_, tabs: Tab[]) => callback(tabs)
                ipcRenderer.on(IpcEvents.window.tab.update, listeners[IpcEvents.window.tab.update])
            },
            offUpdate: () =>
                ipcRenderer.off(
                    IpcEvents.window.tab.update,
                    listeners[IpcEvents.window.tab.update]
                ),
            update: (tabs: Tab[]) => ipcRenderer.send(IpcEvents.window.tab.update, tabs),
            onSwitch: (callback: (key: string) => void) => {
                listeners[IpcEvents.window.tab.switch] = (_, key: string) => callback(key)
                ipcRenderer.on(IpcEvents.window.tab.switch, listeners[IpcEvents.window.tab.switch])
            },
            offSwitch: () =>
                ipcRenderer.off(
                    IpcEvents.window.tab.switch,
                    listeners[IpcEvents.window.tab.switch]
                ),
            switch: (key: string): Promise<boolean> =>
                ipcRenderer.invoke(IpcEvents.window.tab.switch, key),
            close: (key: string) => ipcRenderer.send(IpcEvents.window.tab.close, key),
            onClosed: (callback: (value: string) => void) => {
                listeners[IpcEvents.window.tab.closed] = (_, value: string) => callback(value)
                ipcRenderer.on(IpcEvents.window.tab.closed, listeners[IpcEvents.window.tab.closed])
            },
            offClosed: () =>
                ipcRenderer.off(
                    IpcEvents.window.tab.closed,
                    listeners[IpcEvents.window.tab.closed]
                ),
            independent: (key: string) => ipcRenderer.send(IpcEvents.window.tab.independent, key),
            icon: (key: string, icon: string) =>
                ipcRenderer.send(IpcEvents.window.tab.icon, key, icon),
            title: (key: string, title: string) =>
                ipcRenderer.send(IpcEvents.window.tab.title, key, title)
        },
        navigate: {
            onGoto: (callback: (value: string) => void) => {
                listeners[IpcEvents.window.navigate.goto] = (_, value: string) => callback(value)
                ipcRenderer.on(
                    IpcEvents.window.navigate.goto,
                    listeners[IpcEvents.window.navigate.goto]
                )
            },
            offGoto: () =>
                ipcRenderer.off(
                    IpcEvents.window.navigate.goto,
                    listeners[IpcEvents.window.navigate.goto]
                )
        }
    },
    sidebar: {
        width: {
            update: (width: number) => ipcRenderer.send(IpcEvents.sidebar.width.update, width)
        },
        collapse: {
            get: (): Promise<boolean> => ipcRenderer.invoke(IpcEvents.sidebar.collapse.get),
            onUpdate: (callback: (value: boolean) => void) => {
                listeners[IpcEvents.sidebar.collapse.update] = (_, value: boolean) =>
                    callback(value)
                ipcRenderer.on(
                    IpcEvents.sidebar.collapse.update,
                    listeners[IpcEvents.sidebar.collapse.update]
                )
            },
            offUpdate: () =>
                ipcRenderer.off(
                    IpcEvents.sidebar.collapse.update,
                    listeners[IpcEvents.sidebar.collapse.update]
                ),
            update: (value: boolean) => ipcRenderer.send(IpcEvents.sidebar.collapse.update, value)
        },
        menu: {
            onUpdate: (callback: () => void) => {
                listeners[IpcEvents.sidebar.menu.update] = () => callback()
                ipcRenderer.on(
                    IpcEvents.sidebar.menu.update,
                    listeners[IpcEvents.sidebar.menu.update]
                )
            },
            offUpdate: () =>
                ipcRenderer.off(
                    IpcEvents.sidebar.menu.update,
                    listeners[IpcEvents.sidebar.menu.update]
                ),
            update: () => ipcRenderer.send(IpcEvents.sidebar.menu.update)
        }
    },
    account: {
        loginAccount: {
            get: (): Promise<string | undefined> =>
                ipcRenderer.invoke(IpcEvents.account.loginAccount.get),
            update: (value?: string) =>
                ipcRenderer.send(IpcEvents.account.loginAccount.update, value)
        },
        accessToken: {
            get: (): Promise<string | undefined> =>
                ipcRenderer.invoke(IpcEvents.account.accessToken.get),
            onUpdate: (callback: (value?: string) => void) => {
                listeners[IpcEvents.account.accessToken.update] = (_, value?: string) =>
                    callback(value)
                ipcRenderer.on(
                    IpcEvents.account.accessToken.update,
                    listeners[IpcEvents.account.accessToken.update]
                )
            },
            offUpdate: () =>
                ipcRenderer.off(
                    IpcEvents.account.accessToken.update,
                    listeners[IpcEvents.account.accessToken.update]
                ),
            update: (value?: string) =>
                ipcRenderer.send(IpcEvents.account.accessToken.update, value)
        },
        refreshToken: {
            get: (): Promise<string | undefined> =>
                ipcRenderer.invoke(IpcEvents.account.refreshToken.get),
            onUpdate: (callback: (value?: string) => void) => {
                listeners[IpcEvents.account.refreshToken.update] = (_, value?: string) =>
                    callback(value)
                ipcRenderer.on(
                    IpcEvents.account.refreshToken.update,
                    listeners[IpcEvents.account.refreshToken.update]
                )
            },
            offUpdate: () =>
                ipcRenderer.off(
                    IpcEvents.account.refreshToken.update,
                    listeners[IpcEvents.account.refreshToken.update]
                ),
            update: (value?: string) =>
                ipcRenderer.send(IpcEvents.account.refreshToken.update, value)
        },
        csrfToken: {
            get: (): Promise<string | undefined> =>
                ipcRenderer.invoke(IpcEvents.account.csrfToken.get),
            onUpdate: (callback: (value?: string) => void) => {
                listeners[IpcEvents.account.csrfToken.update] = (_, value?: string) =>
                    callback(value)
                ipcRenderer.on(
                    IpcEvents.account.csrfToken.update,
                    listeners[IpcEvents.account.csrfToken.update]
                )
            },
            offUpdate: () =>
                ipcRenderer.off(
                    IpcEvents.account.csrfToken.update,
                    listeners[IpcEvents.account.csrfToken.update]
                ),
            update: (value?: string) => ipcRenderer.send(IpcEvents.account.csrfToken.update, value)
        },
        userInfo: {
            get: (): Promise<UserWithPowerInfoVo | undefined> =>
                ipcRenderer.invoke(IpcEvents.account.userInfo.get),
            onUpdate: (callback: (value: UserWithPowerInfoVo) => void) => {
                listeners[IpcEvents.account.userInfo.update] = (_, value: UserWithPowerInfoVo) =>
                    callback(value)
                ipcRenderer.on(
                    IpcEvents.account.userInfo.update,
                    listeners[IpcEvents.account.userInfo.update]
                )
            },
            offUpdate: () =>
                ipcRenderer.off(
                    IpcEvents.account.userInfo.update,
                    listeners[IpcEvents.account.userInfo.update]
                ),
            update: (value?: UserWithPowerInfoVo) =>
                ipcRenderer.send(IpcEvents.account.userInfo.update, value)
        },
        loginStatus: {
            onUpdate: (callback: (isLogin: boolean) => void) => {
                listeners[IpcEvents.account.loginStatus.update] = (_, isLogin: boolean) =>
                    callback(isLogin)
                ipcRenderer.on(
                    IpcEvents.account.loginStatus.update,
                    listeners[IpcEvents.account.loginStatus.update]
                )
            },
            offUpdate: () =>
                ipcRenderer.off(
                    IpcEvents.account.loginStatus.update,
                    listeners[IpcEvents.account.loginStatus.update]
                ),
            update: (isLogin: boolean) =>
                ipcRenderer.send(IpcEvents.account.loginStatus.update, isLogin)
        }
    },
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
            ) => {
                listeners[IpcEvents.tool.view.load] = (
                    _,
                    username: string,
                    toolId: string,
                    platform?: Platform,
                    ver?: string,
                    source?: string
                ) => callback(username, toolId, platform, ver, source)
                ipcRenderer.on(IpcEvents.tool.view.load, listeners[IpcEvents.tool.view.load])
            },
            offLoad: () =>
                ipcRenderer.off(IpcEvents.tool.view.load, listeners[IpcEvents.tool.view.load]),
            load: (
                username: string,
                toolId: string,
                platform?: Platform,
                ver?: string,
                source?: string
            ) =>
                ipcRenderer.send(IpcEvents.tool.view.load, username, toolId, platform, ver, source),
            render: (dist: string, key?: string) =>
                ipcRenderer.send(IpcEvents.tool.view.render, dist, key),
            devtools: (key: string): Promise<boolean> =>
                ipcRenderer.invoke(IpcEvents.tool.view.devtools, key)
        }
    }
})
