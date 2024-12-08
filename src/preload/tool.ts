import { contextBridge, Notification } from 'electron'

const oxygenApi = {
    platform: process.platform,
    renderer: 'tool'
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('Notification', Notification)
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
