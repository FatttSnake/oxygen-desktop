import { contextBridge, ipcRenderer, Notification } from 'electron'

const oxygenApi = {
    platform: process.platform,
    renderer: 'menu',

    updateMenuWidth: (width: number) => ipcRenderer.send('menuView:width:update', width)
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('Notify', Notification)
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
