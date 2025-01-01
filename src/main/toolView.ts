import { BrowserWindow, shell, WebContentsView } from 'electron'
import { is } from '@electron-toolkit/utils'

export const initToolView = (_: BrowserWindow, toolView: WebContentsView) => {
    toolView.webContents.setWindowOpenHandler((details) => {
        void shell.openExternal(details.url)
        return { action: 'deny' }
    })

    toolView.webContents.on('did-finish-load', () => {
        if (is.dev) {
            // toolView.webContents.openDevTools()
        }
    })

    void toolView.webContents.loadURL('https://google.com/ncr')
    toolView.setBounds({ x: 0, y: 0, width: 400, height: 400 })
    toolView.setVisible(false)
}
