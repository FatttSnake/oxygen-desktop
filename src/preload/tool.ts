import { contextBridge } from 'electron'

const kebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

const getArgv = (key: string) => {
    const value = process.argv.find((arg) => arg.startsWith(`--${kebabCase(key)}=`))?.split('=')[1]
    return value ? decodeURIComponent(value) : undefined
}

const viewId = getArgv('viewId')
const url = getArgv('url')

const oxygenApi = {
    platform: process.platform,
    renderer: 'tool',
    viewId,
    url
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('oxygenApi', oxygenApi)
    } catch (error) {
        console.error(error)
    }
}
