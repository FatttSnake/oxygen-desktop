import { contextBridge, Notification } from 'electron'

const oxygenApi = {
    platform: process.platform,
    renderer: 'settings'
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('Notify', Notification)
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
