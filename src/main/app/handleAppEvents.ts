import path from 'node:path'
import { app, BrowserWindow } from 'electron'
import { optimizer } from '@electron-toolkit/utils'
import WindowManager from '#/app/windowManager'
import { loadTool } from '#/app/services'

let isLoadingUrl = false

const handleUrl = (url: string) => {
    try {
        const { hostname, pathname } = new URL(url)
        switch (hostname) {
            case 'open-tool': {
                const toolInfo: ToolInfo = JSON.parse(atob(pathname.slice(1)))
                const { username, toolId, platform, version } = toolInfo
                if (WindowManager.existsMainWindow()) {
                    WindowManager.showMainWindow()
                    loadTool(username, toolId, version, platform)
                } else {
                    WindowManager.createIndependentWindow(toolInfo)
                }
            }
        }
    } catch (reason) {
        /* empty */
    }
}

const handleArgv = (argv: string[]) => {
    const prefix = `${import.meta.env.VITE_DESKTOP_PROTOCOL}:`
    const offset = app.isPackaged ? 1 : 2
    const url = argv.find((arg, index) => index >= offset && arg.startsWith(prefix))
    if (url) {
        handleUrl(url)
    } else {
        if (WindowManager.existsMainWindow()) {
            WindowManager.showMainWindow()
        } else {
            WindowManager.createMainWindow()
        }
    }
}

const handleProtocol = () => {
    // Register protocol client
    if (!app.isPackaged) {
        const args: string[] = []
        args.push(path.resolve(process.argv[1]))
        // Debug Use
        // args.push('--inspect-brk', '--sourcemap')
        app.setAsDefaultProtocolClient(
            import.meta.env.VITE_DESKTOP_PROTOCOL,
            process.execPath,
            args
        )
    } else {
        app.setAsDefaultProtocolClient(import.meta.env.VITE_DESKTOP_PROTOCOL)
    }

    // macOS
    app.on('open-url', (_, url) => {
        isLoadingUrl = true
        app.whenReady().then(() => {
            handleUrl(url)
            isLoadingUrl = false
        })
    })

    // Windows
    app.on('second-instance', (_, argv) => {
        if (process.platform === 'win32') {
            handleArgv(argv)
        }
    })
}

export const initializeApplication = () => {
    if (isLoadingUrl) {
        return
    }

    handleArgv(process.argv)
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
