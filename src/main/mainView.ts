import { join } from 'path'
import { BrowserWindow, shell, WebContentsView } from 'electron'
import { is } from '@electron-toolkit/utils'
import { addTab } from './common'

export const initMainView = (mainWindow: BrowserWindow, mainView: WebContentsView) => {
    const { width, height } = mainWindow.getContentBounds()
    mainView.setBounds({
        x: 0,
        y: 40,
        width,
        height: height - 40
    })

    mainView.webContents.setWindowOpenHandler((details) => {
        void shell.openExternal(details.url)
        return { action: 'deny' }
    })

    mainView.webContents.on('did-finish-load', () => {
        mainWindow.show()
        if (is.dev) {
            mainView.webContents.openDevTools()
        }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        void mainView.webContents.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        // void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
        void mainView.webContents.loadURL(
            `local://oxygen.fatweb.top/${join(__dirname, '../renderer/index.html')}`
        )
    }

    addTab(mainWindow, mainView, 'mainView', 'Oxygen Toolbox', true, true)

    mainWindow.contentView.addChildView(mainView)
}
