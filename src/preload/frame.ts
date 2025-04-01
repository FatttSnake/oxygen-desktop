import { contextBridge, ipcRenderer } from 'electron'

const IpcEvents = {
    window: {
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

    window: {
        theme: {
            get: (): Promise<WindowTheme> => ipcRenderer.invoke(IpcEvents.window.theme.get),
            onUpdate: (callback: (theme: WindowTheme) => void) => {
                listeners['window:theme:update'] = (_, theme: WindowTheme) => callback(theme)
                ipcRenderer.on(IpcEvents.window.theme.update, listeners['window:theme:update'])
            },
            offUpdate: () =>
                ipcRenderer.off(IpcEvents.window.theme.update, listeners['window:theme:update'])
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
                listeners['window:tab:update'] = (_, tabs: Tab[]) => callback(tabs)
                ipcRenderer.on(IpcEvents.window.tab.update, listeners['window:tab:update'])
            },
            offUpdate: () =>
                ipcRenderer.off(IpcEvents.window.tab.update, listeners['window:tab:update']),
            update: (tabs: Tab[]) => ipcRenderer.send(IpcEvents.window.tab.update, tabs),
            onSwitch: (callback: (key: string) => void) => {
                listeners['window:tab:switch'] = (_, key: string) => callback(key)
                ipcRenderer.on(IpcEvents.window.tab.switch, listeners['window:tab:switch'])
            },
            offSwitch: () =>
                ipcRenderer.off(IpcEvents.window.tab.switch, listeners['window:tab:switch']),
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
                listeners['sidebar:collapse:update'] = (_, value: boolean) => callback(value)
                ipcRenderer.on(
                    IpcEvents.sidebar.collapse.update,
                    listeners['sidebar:collapse:update']
                )
            },
            offUpdate: () =>
                ipcRenderer.off(
                    IpcEvents.sidebar.collapse.update,
                    listeners['sidebar:collapse:update']
                ),
            update: (value: boolean) => ipcRenderer.send(IpcEvents.sidebar.collapse.update, value)
        }
    },
    account: {
        accessToken: {
            get: (): Promise<string | undefined> =>
                ipcRenderer.invoke(IpcEvents.account.accessToken.get),
            onUpdate: (callback: (value?: string) => void) => {
                listeners['account:accessToken:update'] = (_, value?: string) => callback(value)
                ipcRenderer.on(
                    IpcEvents.account.accessToken.update,
                    listeners['account:accessToken:update']
                )
            },
            offUpdate: () =>
                ipcRenderer.off(
                    IpcEvents.account.accessToken.update,
                    listeners['account:accessToken:update']
                ),
            update: (value?: string) =>
                ipcRenderer.send(IpcEvents.account.accessToken.update, value)
        },
        refreshToken: {
            get: (): Promise<string | undefined> =>
                ipcRenderer.invoke(IpcEvents.account.refreshToken.get),
            onUpdate: (callback: (value?: string) => void) => {
                listeners['account:refreshToken:update'] = (_, value?: string) => callback(value)
                ipcRenderer.on(
                    IpcEvents.account.refreshToken.update,
                    listeners['account:refreshToken:update']
                )
            },
            offUpdate: () =>
                ipcRenderer.off(
                    IpcEvents.account.refreshToken.update,
                    listeners['account:refreshToken:update']
                ),
            update: (value?: string) =>
                ipcRenderer.send(IpcEvents.account.refreshToken.update, value)
        },
        userInfo: {
            get: (): Promise<UserWithPowerInfoVo | undefined> =>
                ipcRenderer.invoke(IpcEvents.account.userInfo.get),
            onUpdate: (callback: (value: UserWithPowerInfoVo) => void) => {
                listeners['account:userInfo:update'] = (_, value: UserWithPowerInfoVo) =>
                    callback(value)
                ipcRenderer.on(
                    IpcEvents.account.userInfo.update,
                    listeners['account:userInfo:update']
                )
            },
            offUpdate: () =>
                ipcRenderer.off(
                    IpcEvents.account.userInfo.update,
                    listeners['account:userInfo:update']
                ),
            update: (value?: UserWithPowerInfoVo) =>
                ipcRenderer.send(IpcEvents.account.userInfo.update, value)
        },
        loginStatus: {
            onUpdate: (callback: (isLogin: boolean) => void) => {
                listeners['account:loginStatus:update'] = (_, isLogin: boolean) => callback(isLogin)
                ipcRenderer.on(
                    IpcEvents.account.loginStatus.update,
                    listeners['account:loginStatus:update']
                )
            },
            offUpdate: () =>
                ipcRenderer.off(
                    IpcEvents.account.loginStatus.update,
                    listeners['account:loginStatus:update']
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
                    ver?: string,
                    platform?: Platform,
                    source?: string
                ) => void
            ) => {
                listeners['tool:view:load'] = (
                    _,
                    username: string,
                    toolId: string,
                    ver?: string,
                    platform?: Platform,
                    source?: string
                ) => callback(username, toolId, ver, platform, source)
                ipcRenderer.on(IpcEvents.tool.view.load, listeners['tool:view:load'])
            },
            offLoad: () => ipcRenderer.off(IpcEvents.tool.view.load, listeners['tool:view:load']),
            render: (key: string, dist: string) =>
                ipcRenderer.send(IpcEvents.tool.view.render, key, dist)
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
