import { contextBridge, ipcRenderer } from 'electron'

const IpcEvents = {
    window: {
        theme: {
            get: 'window:theme:get',
            update: 'window:theme:update'
        },
        tab: {
            switch: 'window:tab:switch',
            close: 'window:tab:close'
        }
    },
    account: {
        loginAccount: {
            get: 'account:loginAccount:get',
            update: 'account:loginAccount:update'
        },
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
    renderer: 'sign',

    window: {
        theme: {
            get: (): Promise<WindowTheme> => ipcRenderer.invoke(IpcEvents.window.theme.get),
            onUpdate: (callback: (theme: WindowTheme) => void) =>
                ipcRenderer.on(IpcEvents.window.theme.update, (_, theme: WindowTheme) =>
                    callback(theme)
                )
        },
        tab: {
            switch: (key: string): Promise<boolean> =>
                ipcRenderer.invoke(IpcEvents.window.tab.switch, key),
            close: (key: string) => ipcRenderer.send(IpcEvents.window.tab.close, key)
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
