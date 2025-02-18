import { contextBridge, ipcRenderer, Notification } from 'electron'

const IpcEvents = {
    window: {
        theme: {
            get: 'window:theme:get',
            update: 'window:theme:update'
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
