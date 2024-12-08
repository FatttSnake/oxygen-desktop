import { BaseWindow, ipcMain, WebContentsView } from 'electron'

export const processIpc = (
    mainWindow: BaseWindow,
    _frameView: WebContentsView,
    menuView: WebContentsView,
    mainView: WebContentsView,
    _toolView: WebContentsView
) => {
    ipcMain.on('window:titleBarOverlay:setColor', (_, color: string, symbolColor: string) => {
        if (['win32', 'linux'].includes(process.platform)) {
            mainWindow.setTitleBarOverlay({ color, symbolColor, height: 35 })
        }
    })

    ipcMain.on('menuView:width:update', (_, menuWidth: number) => {
        global.sharedObject.menuWidth = menuWidth
        const { width, height } = mainWindow.getBounds()
        menuView.setBounds({
            x: 0,
            y: 36,
            width: width,
            height: height - 36
        })
        mainView.setBounds({
            x: menuWidth,
            y: 36,
            width: width - menuWidth,
            height: height - 36
        })
    })
}
