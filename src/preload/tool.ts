import { contextBridge, Notification } from 'electron'

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('Notification', Notification)
    } catch (error) {
        console.error(error)
    }
}
