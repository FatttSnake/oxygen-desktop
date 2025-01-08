import { contextBridge, ipcRenderer, Notification } from 'electron'

const IpcEvents = {
    menuView: {
        width: {
            update: 'menuView:width:update'
        }
    }
}

const oxygenApi = {
    platform: process.platform,
    renderer: 'menu',

    updateMenuWidth: (width: number) => ipcRenderer.send(IpcEvents.menuView.width.update, width)
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('Notify', Notification)
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
