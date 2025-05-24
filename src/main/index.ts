import { join } from 'path'
import fs from 'fs'
import path from 'node:path'
import url from 'node:url'
import { app, protocol, net } from 'electron'
import { electronApp } from '@electron-toolkit/utils'
import WindowManager from './windowManager'
import { processApp } from './processApp'
import { processIpcEvents } from './processIpcEvents'

// Application singleton execution
if (!app.requestSingleInstanceLock()) {
    app.quit()
}

// Register protocol client
const args: string[] = []
if (!app.isPackaged) {
    args.push(path.resolve(process.argv[1]))
}
args.push('--')
app.setAsDefaultProtocolClient(import.meta.env.VITE_DESKTOP_PROTOCOL, process.execPath, args)
// app.removeAsDefaultProtocolClient(import.meta.env.VITE_DESKTOP_PROTOCOL, process.execPath, args)

const handleUrl = (url: string) => {
    const { hostname } = new URL(url)
    if (hostname === 'openurl' && WindowManager.existsMainWindow()) {
        // mainView.webContents.send(IpcEvents.mainView.url.open, pathname)
        WindowManager.showMainWindow()
    }
}

// macOS
app.on('open-url', (_, argv) => {
    handleUrl(argv)
})

// Windows
const handleArgv = (argv: string[]) => {
    const prefix = `${import.meta.env.VITE_DESKTOP_PROTOCOL}:`
    const offset = app.isPackaged ? 1 : 2
    const url = argv.find((arg, index) => index >= offset && arg.startsWith(prefix))
    if (url) {
        handleUrl(url)
    }
}
handleArgv(process.argv)
app.on('second-instance', (_, argv) => {
    if (process.platform === 'win32') {
        handleArgv(argv)
    }
})

protocol.registerSchemesAsPrivileged([
    {
        scheme: 'local',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true
        }
    }
])

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    protocol.handle('local', (request) => {
        const { host } = new URL(request.url)
        if (host === 'oxygen.fatweb.top') {
            let filePath = request.url.slice('local://oxygen.fatweb.top/'.length)
            if (fs.existsSync(filePath)) {
                return net.fetch(url.pathToFileURL(filePath).toString())
            }

            filePath = join(join(__dirname, '../renderer'), filePath)
            if (fs.existsSync(filePath)) {
                return net.fetch(url.pathToFileURL(filePath).toString())
            }

            return net.fetch(
                url.pathToFileURL(join(__dirname, '../renderer/index.html')).toString()
            )
        } else {
            const filePath = request.url.slice('local://'.length)
            return net.fetch(url.pathToFileURL(filePath).toString())
        }
    })

    // Set app user model id for windows
    electronApp.setAppUserModelId('top.fatweb')

    processIpcEvents()
    processApp()
    WindowManager.createMainWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
