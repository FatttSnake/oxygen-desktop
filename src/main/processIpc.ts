import { BaseWindow, ipcMain, WebContentsView } from 'electron'

export const processIpc = (
    mainWindow: BaseWindow,
    _: WebContentsView,
    toolView: WebContentsView
) => {
    ipcMain.on('window:titleBarOverlay:setColor', (_, color: string, symbolColor: string) => {
        if (['win32', 'linux'].includes(process.platform)) {
            mainWindow.setTitleBarOverlay({ color, symbolColor, height: 30 })
        }
    })

    ipcMain.on('toolView:visible:set', (_, visible: boolean) => toolView.setVisible(visible))
    ipcMain.on('toolView:bounds:set', (_, x: number, y: number, width: number, height: number) =>
        toolView.setBounds({
            x,
            y,
            width,
            height
        })
    )
}
