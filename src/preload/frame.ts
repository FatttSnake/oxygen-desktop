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
            independent: 'window:tab:independent'
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
    }
}

const oxygenApi = {
    platform: process.platform,
    renderer: 'frame',

    window: {
        theme: {
            get: (): Promise<WindowTheme> => ipcRenderer.invoke(IpcEvents.window.theme.get),
            onUpdate: (callback: (theme: WindowTheme) => void) =>
                ipcRenderer.on(IpcEvents.window.theme.update, (_, theme: WindowTheme) =>
                    callback(theme)
                )
        },
        titleBarOverlay: {
            setColor: (color: string, symbolColor: string) =>
                ipcRenderer.send(IpcEvents.window.titleBarOverlay.setColor, color, symbolColor)
        },
        tab: {
            create: (type: TabType, args?: Record<string, string | number | boolean>) =>
                ipcRenderer.send(IpcEvents.window.tab.create, type, args),
            list: (): Promise<Tab[]> => ipcRenderer.invoke(IpcEvents.window.tab.list),
            onUpdate: (callback: (tabs: Tab[]) => void) =>
                ipcRenderer.on(IpcEvents.window.tab.update, (_, tabs: Tab[]) => callback(tabs)),
            update: (tabs: Tab[]) => ipcRenderer.send(IpcEvents.window.tab.update, tabs),
            onSwitch: (callback: (key: string) => void) =>
                ipcRenderer.on(IpcEvents.window.tab.switch, (_, key: string) => callback(key)),
            switch: (key: string): Promise<boolean> =>
                ipcRenderer.invoke(IpcEvents.window.tab.switch, key),
            close: (key: string) => ipcRenderer.send(IpcEvents.window.tab.close, key),
            independent: (key: string) => ipcRenderer.send(IpcEvents.window.tab.independent, key)
        }
    },
    sidebar: {
        width: {
            update: (width: number) => ipcRenderer.send(IpcEvents.sidebar.width.update, width)
        },
        collapse: {
            get: (): Promise<boolean> => ipcRenderer.invoke(IpcEvents.sidebar.collapse.get),
            onUpdate: (callback: (value: boolean) => void) =>
                ipcRenderer.on(IpcEvents.sidebar.collapse.update, (_, value: boolean) =>
                    callback(value)
                ),
            update: (value: boolean) => ipcRenderer.send(IpcEvents.sidebar.collapse.update, value)
        }
    },
    account: {
        accessToken: {
            get: (): Promise<string | undefined> =>
                ipcRenderer.invoke(IpcEvents.account.accessToken.get),
            onUpdate: (callback: (value?: string) => void) =>
                ipcRenderer.on(IpcEvents.account.accessToken.update, (_, value?: string) =>
                    callback(value)
                ),
            update: (value?: string) =>
                ipcRenderer.send(IpcEvents.account.accessToken.update, value)
        },
        refreshToken: {
            get: (): Promise<string | undefined> =>
                ipcRenderer.invoke(IpcEvents.account.refreshToken.get),
            onUpdate: (callback: (value?: string) => void) =>
                ipcRenderer.on(IpcEvents.account.refreshToken.update, (_, value?: string) =>
                    callback(value)
                ),
            update: (value?: string) =>
                ipcRenderer.send(IpcEvents.account.refreshToken.update, value)
        },
        userInfo: {
            get: (): Promise<UserWithPowerInfoVo | undefined> =>
                ipcRenderer.invoke(IpcEvents.account.userInfo.get),
            onUpdate: (callback: (value: UserWithPowerInfoVo) => void) =>
                ipcRenderer.on(IpcEvents.account.userInfo.update, (_, value: UserWithPowerInfoVo) =>
                    callback(value)
                ),
            update: (value?: UserWithPowerInfoVo) =>
                ipcRenderer.send(IpcEvents.account.userInfo.update, value)
        },
        loginStatus: {
            onUpdate: (callback: (isLogin: boolean) => void) =>
                ipcRenderer.on(IpcEvents.account.loginStatus.update, (_, isLogin: boolean) =>
                    callback(isLogin)
                ),
            update: (isLogin: boolean) =>
                ipcRenderer.send(IpcEvents.account.loginStatus.update, isLogin)
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
