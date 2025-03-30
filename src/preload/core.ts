import { contextBridge, ipcRenderer } from 'electron'

const IpcEvents = {
    window: {
        theme: {
            get: 'window:theme:get',
            update: 'window:theme:update'
        },
        navigate: {
            goto: 'window:navigate:goto'
        }
    },
    sidebar: {
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

const listeners: Record<string, IpcRendererEventListener> = {}

const oxygenApi = {
    platform: process.platform,
    renderer: 'core',

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
        navigate: {
            onGoto: (callback: (value: string) => void) => {
                listeners['window:navigate:goto'] = (_, value: string) => callback(value)
                ipcRenderer.on(IpcEvents.window.navigate.goto, listeners['window:navigate:goto'])
            },
            offGoto: () =>
                ipcRenderer.off(IpcEvents.window.navigate.goto, listeners['window:navigate:goto'])
        }
    },
    sidebar: {
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
                )
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
    }
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
