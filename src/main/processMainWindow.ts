import { getMaximize, saveMaximize, saveWindowBounds } from './dataStore/main'
import { BrowserWindow, WebContentsView } from 'electron'

export const processMainWindow = (
    mainWindow: BrowserWindow,
    menuView: WebContentsView,
    mainView: WebContentsView,
    toolView: WebContentsView
) => {
    mainWindow.contentView.addChildView(menuView)
    mainWindow.contentView.addChildView(mainView)
    mainWindow.contentView.addChildView(toolView)

    if (getMaximize()) {
        mainWindow.maximize()
    }
    mainWindow.removeMenu()

    mainWindow.on('resize', () => {
        const { width, height } = mainWindow.getBounds()
        const menuWidth = global.sharedObject.menuWidth
        menuView.setBounds({
            x: 0,
            y: 41,
            width: width,
            height: height - 41
        })
        mainView.setBounds({
            x: menuWidth,
            y: 41,
            width: width - menuWidth,
            height: height - 41
        })
    })

    mainWindow.on('resized', () => {
        const { width, height } = mainWindow.getBounds()
        saveWindowBounds({ width, height })
    })
    mainWindow.on('maximize', () => saveMaximize(true))
    mainWindow.on('unmaximize', () => saveMaximize(false))
}
