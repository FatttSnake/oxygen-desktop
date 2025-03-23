import { contextBridge, ipcRenderer } from 'electron'

const kebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

const getArgv = (key: string) => {
    const value = process.argv.find((arg) => arg.startsWith(`--${kebabCase(key)}=`))?.split('=')[1]
    return value ? decodeURIComponent(value) : undefined
}

const navigateTo = getArgv('navigateTo')

const IpcEvents = {
    app: {
        url: {
            open: 'app:url:open'
        },
        version: {
            get: 'app:version:get'
        }
    },
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

const oxygenApi = {
    platform: process.platform,
    renderer: 'settings',
    navigateTo,

    app: {
        url: {
            open: (url: string) => ipcRenderer.send(IpcEvents.app.url.open, url)
        },
        version: {
            get: (): Promise<string> => ipcRenderer.invoke(IpcEvents.app.version.get)
        }
    },
    window: {
        theme: {
            get: (): Promise<WindowTheme> => ipcRenderer.invoke(IpcEvents.window.theme.get),
            onUpdate: (callback: (theme: WindowTheme) => void) =>
                ipcRenderer.on(IpcEvents.window.theme.update, (_, theme: WindowTheme) =>
                    callback(theme)
                ),
            update: (theme: WindowTheme) => ipcRenderer.send(IpcEvents.window.theme.update, theme)
        },
        navigate: {
            onGoto: (callback: (value: string) => void) =>
                ipcRenderer.on(IpcEvents.window.navigate.goto, (_, value: string) =>
                    callback(value)
                )
        }
    },
    sidebar: {
        collapse: {
            get: (): Promise<boolean> => ipcRenderer.invoke(IpcEvents.sidebar.collapse.get),
            onUpdate: (callback: (value: boolean) => void) =>
                ipcRenderer.on(IpcEvents.sidebar.collapse.update, (_, value: boolean) =>
                    callback(value)
                )
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
