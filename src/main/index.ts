import { app, shell, BrowserWindow, ipcMain, protocol, net } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../build/icon.ico?asset'
import path from 'node:path'
import url from 'node:url'
import fs from 'fs'
import { getMaximize, getWindowBounds, saveMaximize, saveWindowBounds } from './dataStore/main'

let mainWindow: BrowserWindow

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
        mainWindow.webContents.send('open-url', pathname)
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
            height: 30
        },
        show: false,
        autoHideMenuBar: true,
        icon,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            nodeIntegrationInSubFrames: true
        }
    })
    if (getMaximize()) {
        mainWindow.maximize()
    }
    mainWindow.removeMenu()

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
        if (is.dev) {
            mainWindow.webContents.openDevTools()
        }
    })

    mainWindow.on('resized', () => {
        const { width, height } = mainWindow.getBounds()
        saveWindowBounds({ width, height })
    })
    mainWindow.on('maximize', () => saveMaximize(true))
    mainWindow.on('unmaximize', () => saveMaximize(false))

    mainWindow.webContents.setWindowOpenHandler((details) => {
        void shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        void mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        // void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
        void mainWindow.loadURL(
            `local://oxygen.fatweb.top/${join(__dirname, '../renderer/index.html')}`
        )
    }
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

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // IPC test
    ipcMain.on('window:titleBarOverlay:color', (_, color: string, symbolColor: string) => {
        if (['win32', 'linux'].includes(process.platform)) {
            mainWindow.setTitleBarOverlay({ color, symbolColor, height: 30 })
        }
    })
    createWindow()

    app.on('activate', function () {
        // On macOS, it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
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
import './dataProcess'
