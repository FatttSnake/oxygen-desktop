import { contextBridge } from 'electron'
import { getArgv } from '%/functions'

const viewId = getArgv('viewId')

const oxygenApi = {
    platform: process.platform,
    renderer: 'tool',
    viewId
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
