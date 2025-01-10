import { join } from 'path'
import fs from 'fs'
import path from 'node:path'
import url from 'node:url'
import { app, BrowserWindow, WebContentsView, protocol, net } from 'electron'
import { electronApp } from '@electron-toolkit/utils'
import icon from '../../build/icon.ico?asset'
import { IpcEvents } from './constants'
import { getWindowBounds } from './dataStore/main'
import { processApp } from './processApp'
import { processIpcEvents } from './ipcUtils'
import { processMainWindow } from './processMainWindow'
import { initFrameView } from './frameView'
import { initMainView } from './mainView'
import { initMenuView } from './menuView'

global.sharedObject = {
    menuWidth: 0,
    mainWindowViews: [],
    independentWindows: {}
}

let mainWindow: BrowserWindow
let menuView: WebContentsView
let mainView: WebContentsView

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

const handleArgv = (argv: string[]) => {
    const prefix = `${import.meta.env.VITE_DESKTOP_PROTOCOL}:`
    const offset = app.isPackaged ? 1 : 2
    const url = argv.find((arg, index) => index >= offset && arg.startsWith(prefix))
    if (url) {
        handleUrl(url)
    }
}

const handleUrl = (url: string) => {
    const { hostname, pathname } = new URL(url)
    if (hostname === 'openurl' && mainWindow) {
        mainView.webContents.send(IpcEvents.mainView.url.open, pathname)
        mainWindow.show()
    }
}

// Windows
handleArgv(process.argv)
app.on('second-instance', (_, argv) => {
    if (process.platform === 'win32') {
        handleArgv(argv)
    }
})

// macOS
app.on('open-url', (_, argv) => {
    handleUrl(argv)
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

const createWindow = () => {
    const { width, height } = getWindowBounds()
    // Create the browser window.
    mainWindow = new BrowserWindow({
        minWidth: 600,
        minHeight: 400,
        width,
        height,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            height: 40
        },
        show: false,
        autoHideMenuBar: true,
        icon,
        webPreferences: {
            preload: join(__dirname, '../preload/frame.js')
        }
    })

    menuView = new WebContentsView({
        webPreferences: {
            preload: join(__dirname, '../preload/menu.js')
        }
    })

    mainView = new WebContentsView({
        webPreferences: {
            preload: join(__dirname, '../preload/main.js')
        }
    })

    processMainWindow(mainWindow, menuView)
    initFrameView(mainWindow)
    initMenuView(mainWindow, menuView)
    initMainView(mainWindow, mainView)
    processIpcEvents(mainWindow, menuView)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
void app.whenReady().then(() => {
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
    createWindow()

    processApp(createWindow)
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
