import { getWindowBounds } from './dataStore/main'
import { BaseWindow, shell, WebContentsView } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'

export const initFrameView = (_: BaseWindow, frameView: WebContentsView) => {
    const { width } = getWindowBounds()
    frameView.setBounds({
        x: 0,
        y: 0,
        width,
        height: 31
    })

    frameView.webContents.setWindowOpenHandler((details) => {
        void shell.openExternal(details.url)
        return { action: 'deny' }
    })

    frameView.webContents.on('did-finish-load', () => {
        if (is.dev) {
            frameView.webContents.openDevTools()
        }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        void frameView.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        // void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
        void frameView.webContents.loadURL(
            `local://oxygen.fatweb.top/${join(__dirname, '../renderer/index.html')}`
        )
    }
}
