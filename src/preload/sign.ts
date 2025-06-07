import { contextBridge, ipcRenderer } from 'electron'

const kebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

const getArgv = (key: string) => {
    const value = process.argv.find((arg) => arg.startsWith(`--${kebabCase(key)}=`))?.split('=')[1]
    return value ? decodeURIComponent(value) : undefined
}

const viewId = getArgv('viewId')

const IpcEvents = {
    window: {
        theme: {
            get: 'window:theme:get',
            update: 'window:theme:update'
        },
        tab: {
            switch: 'window:tab:switch',
            close: 'window:tab:close'
        },
        navigate: {
            goto: 'window:navigate:goto'
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

const listeners: Record<string, IpcRendererEventListener> = {}

const oxygenApi = {
    platform: process.platform,
    renderer: 'sign',
    viewId,

    window: {
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
        tab: {
            switch: (key: string): Promise<boolean> =>
                ipcRenderer.invoke(IpcEvents.window.tab.switch, key),
            close: (key: string) => ipcRenderer.send(IpcEvents.window.tab.close, key)
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
    }
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
