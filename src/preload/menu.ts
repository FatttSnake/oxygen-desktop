import { contextBridge, ipcRenderer, Notification } from 'electron'

const IpcEvents = {
    sidebar: {
        collapse: {
            get: 'sidebar:collapse:get',
            update: 'sidebar:collapse:update'
        }
    },
    menuView: {
        width: {
            update: 'menuView:width:update'
        }
    }
}

const oxygenApi = {
    platform: process.platform,
    renderer: 'menu',

    sidebar: {
        collapse: {
            get: (): Promise<boolean> => ipcRenderer.invoke(IpcEvents.sidebar.collapse.get),
            onUpdate: (callback: (value: boolean) => void) =>
                ipcRenderer.on(IpcEvents.sidebar.collapse.update, (_, value: boolean) =>
                    callback(value)
                )
        }
    },

    menuView: {
        width: {
            update: (width: number) => ipcRenderer.send(IpcEvents.menuView.width.update, width)
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
