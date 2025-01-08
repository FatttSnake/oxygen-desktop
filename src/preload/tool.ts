import { contextBridge, Notification } from 'electron'

const viewId = process.argv.find((arg) => arg.startsWith('--view-id='))?.split('=')[1]
const url = process.argv.find((arg) => arg.startsWith('--url='))?.split('=')[1]

const oxygenApi = {
    platform: process.platform,
    renderer: 'tool',
    viewId,
    url
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('Notify', Notification)
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
