import { contextBridge, ipcRenderer } from 'electron'

const kebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

const getArgv = (key: string) => {
    const value = process.argv.find((arg) => arg.startsWith(`--${kebabCase(key)}=`))?.split('=')[1]
    return value ? decodeURIComponent(value) : undefined
}

const viewId = getArgv('viewId')
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
        },
        tab: {
            create: 'window:tab:create',
            switch: 'window:tab:switch',
            close: 'window:tab:close',
            closed: 'window:tab:closed',
            icon: 'window:tab:icon',
            title: 'window:tab:title'
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
    },
    tool: {
        view: {
            render: 'tool:view:render'
        }
    }
}

const listeners: Record<string, IpcRendererEventListener> = {}

const oxygenApi = {
    platform: process.platform,
    renderer: 'settings',
    viewId,
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
        },
        tab: {
            create: (type: TabType, args?: Record<string, string | number | boolean>) =>
                ipcRenderer.invoke(IpcEvents.window.tab.create, type, args),
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
            icon: (key: string, icon: string) =>
                ipcRenderer.send(IpcEvents.window.tab.icon, key, icon),
            title: (key: string, title: string) =>
                ipcRenderer.send(IpcEvents.window.tab.title, key, title)
        }
    },
    sidebar: {
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
