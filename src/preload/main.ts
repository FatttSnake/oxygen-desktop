import { contextBridge, Notification, ipcRenderer } from 'electron'

const IpcEvents = {
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
    },
    mainView: {
        url: {
            open: 'mainView:url:open'
        }
    }
}

const oxygenApi = {
    platform: process.platform,
    renderer: 'main',

    window: {
        theme: {
            get: (): Promise<WindowTheme> => ipcRenderer.invoke(IpcEvents.window.theme.get),
            onUpdate: (callback: (theme: WindowTheme) => void) =>
                ipcRenderer.on(IpcEvents.window.theme.update, (_, theme: WindowTheme) =>
                    callback(theme)
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
    mainView: {
        url: {
            onOpen: (callback: (url: string) => void) =>
                ipcRenderer.on(IpcEvents.mainView.url.open, (_, url: string) => callback(url))
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
