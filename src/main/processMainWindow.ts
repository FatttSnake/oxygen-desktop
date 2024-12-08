import { getMaximize, saveMaximize, saveWindowBounds } from './dataStore/main'
import { BaseWindow, WebContentsView } from 'electron'

export const processMainWindow = (
    mainWindow: BaseWindow,
    frameView: WebContentsView,
    menuView: WebContentsView,
    mainView: WebContentsView,
    toolView: WebContentsView
) => {
    mainWindow.contentView.addChildView(frameView)
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
        frameView.setBounds({
            x: 0,
            y: 0,
            width,
            height: 36
        })
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

    mainWindow.on('resized', () => {
        const { width, height } = mainWindow.getBounds()
        saveWindowBounds({ width, height })
    })
    mainWindow.on('maximize', () => saveMaximize(true))
    mainWindow.on('unmaximize', () => saveMaximize(false))
}
