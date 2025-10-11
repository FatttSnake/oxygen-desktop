import { contextBridge, ipcRenderer } from 'electron'

const kebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

const getArgv = (key: string) => {
    const value = process.argv.find((arg) => arg.startsWith(`--${kebabCase(key)}=`))?.split('=')[1]
    return value ? decodeURIComponent(value) : undefined
}

const windowType = getArgv('windowType')
const windowId = getArgv('windowId')
const viewId = getArgv('viewId')
const windowIcon = getArgv('windowIcon')
const windowTitle = getArgv('windowTitle')
const toolInfo = getArgv('toolInfo')

const IpcEvents = {
    window: {
        common: {
            close: 'window:common:close',
            afterLoad: 'window:common:afterLoad',
            icon: 'window:common:icon',
            title: 'window:common:title'
        },
        theme: {
            get: 'window:theme:get',
            update: 'window:theme:update'
        },
        titleBarOverlay: {
            setColor: 'window:titleBarOverlay:setColor'
        },
        tab: {
            create: 'window:tab:create',
            list: 'window:tab:list',
            update: 'window:tab:update',
            switch: 'window:tab:switch',
            close: 'window:tab:close',
            independent: 'window:tab:independent',
            icon: 'window:tab:icon',
            title: 'window:tab:title'
        }
    },
    sidebar: {
        width: {
            update: 'sidebar:width:update'
        },
        collapse: {
            get: 'sidebar:collapse:get',
            update: 'sidebar:collapse:update'
        },
        menu: {
            update: 'sidebar:menu:update'
        }
    },
    account: {
        accessToken: {
            get: 'account:accessToken:get',
            update: 'account:accessToken:update'
        },
        refreshToken: {
            get: 'account:refreshToken:get',
            update: 'account:refreshToken:update'
        },
        userInfo: {
            get: 'account:userInfo:get',
            update: 'account:userInfo:update'
        },
        loginStatus: {
            update: 'account:loginStatus:update'
        }
    },
    tool: {
        view: {
            load: 'tool:view:load',
            render: 'tool:view:render'
        }
    }
}

const listeners: Record<string, IpcRendererEventListener> = {}

const oxygenApi = {
    platform: process.platform,
    renderer: 'frame',
    windowType,
    windowId,
    viewId,
    windowIcon,
    windowTitle,
    toolInfo,

    window: {
        common: {
            close: (key: string) => ipcRenderer.send(IpcEvents.window.common.close, key),
            afterLoad: () => ipcRenderer.send(IpcEvents.window.common.afterLoad, windowId),
            onIcon: (callback: (icon: string) => void) => {
                listeners[IpcEvents.window.common.icon] = (_, icon: string) => callback(icon)
                ipcRenderer.on(
                    IpcEvents.window.common.icon,
                    listeners[IpcEvents.window.common.icon]
                )
            },
            offIcon: () =>
                ipcRenderer.off(
                    IpcEvents.window.common.icon,
                    listeners[IpcEvents.window.common.icon]
                ),
            onTitle: (callback: (title: string) => void) => {
                listeners[IpcEvents.window.common.title] = (_, title: string) => callback(title)
                ipcRenderer.on(
                    IpcEvents.window.common.title,
                    listeners[IpcEvents.window.common.title]
                )
            },
            offTitle: () =>
                ipcRenderer.off(
                    IpcEvents.window.common.title,
                    listeners[IpcEvents.window.common.title]
                )
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
                )
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
            independent: (key: string) => ipcRenderer.send(IpcEvents.window.tab.independent, key),
            icon: (key: string, icon: string) =>
                ipcRenderer.send(IpcEvents.window.tab.icon, key, icon),
            title: (key: string, title: string) =>
                ipcRenderer.send(IpcEvents.window.tab.title, key, title)
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
                )
        }
    },
    account: {
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
            load: (
                username: string,
                toolId: string,
                ver?: string,
                platform?: Platform,
                source?: string
            ) =>
                ipcRenderer.send(IpcEvents.tool.view.load, username, toolId, ver, platform, source),
            onLoad: (
                callback: (
                    username: string,
                    toolId: string,
                    ver?: string,
                    platform?: Platform,
                    source?: string
                ) => void
            ) => {
                listeners[IpcEvents.tool.view.load] = (
                    _,
                    username: string,
                    toolId: string,
                    ver?: string,
                    platform?: Platform,
                    source?: string
                ) => callback(username, toolId, ver, platform, source)
                ipcRenderer.on(IpcEvents.tool.view.load, listeners[IpcEvents.tool.view.load])
            },
            offLoad: () =>
                ipcRenderer.off(IpcEvents.tool.view.load, listeners[IpcEvents.tool.view.load]),
            render: (dist: string, key?: string) =>
                ipcRenderer.send(IpcEvents.tool.view.render, dist, key)
        }
    }
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
