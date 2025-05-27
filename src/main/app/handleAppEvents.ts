import path from 'node:path'
import { app, BrowserWindow } from 'electron'
import { optimizer } from '@electron-toolkit/utils'
import WindowManager from '#/app/windowManager'

const handleProtocol = () => {
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
}

export default () => {
    handleProtocol()

    app.on('activate', function () {
        // On macOS, it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) WindowManager.createMainWindow()
    })

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })
}
