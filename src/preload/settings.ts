import { contextBridge, ipcRenderer, Notification } from 'electron'

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
        }
    },
    sidebar: {
        collapse: {
            get: 'sidebar:collapse:get',
            update: 'sidebar:collapse:update'
        }
    }
}

const oxygenApi = {
    platform: process.platform,
    renderer: 'settings',

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
    }
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('Notify', Notification)
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
