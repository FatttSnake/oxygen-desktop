import { join } from 'path'
import { BrowserWindow, shell, WebContentsView } from 'electron'
import { is } from '@electron-toolkit/utils'

export const initMenuView = (mainWindow: BrowserWindow, menuView: WebContentsView) => {
    const { width, height } = mainWindow.getContentBounds()
    menuView.setBounds({
        x: 0,
        y: 40,
        width: width,
        height: height - 40
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

    mainWindow.contentView.addChildView(menuView)
}
