import { join } from 'path'
import { BrowserWindow, shell, WebContentsView } from 'electron'
import { is } from '@electron-toolkit/utils'
import { getWindowBounds } from './dataStore/main'

export const initMenuView = (_: BrowserWindow, menuView: WebContentsView) => {
    const { width, height } = getWindowBounds()
    menuView.setBounds({
        x: 0,
        y: 41,
        width: width,
        height: height - 41
    })

    menuView.webContents.setWindowOpenHandler((details) => {
        void shell.openExternal(details.url)
        return { action: 'deny' }
    })

    menuView.webContents.on('did-finish-load', () => {
        if (is.dev) {
            // menuView.webContents.openDevTools()
        }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        void menuView.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        // void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
        void menuView.webContents.loadURL(
            `local://oxygen.fatweb.top/${join(__dirname, '../renderer/index.html')}`
        )
    }
}
