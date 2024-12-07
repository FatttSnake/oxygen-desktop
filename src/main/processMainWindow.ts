import { getMaximize, saveMaximize, saveWindowBounds } from './dataStore/main'
import { BaseWindow, WebContentsView } from 'electron'

export const processMainWindow = (
    mainWindow: BaseWindow,
    mainView: WebContentsView,
    toolView: WebContentsView
) => {
    mainWindow.contentView.addChildView(mainView)
    mainWindow.contentView.addChildView(toolView)

    if (getMaximize()) {
        mainWindow.maximize()
    }
    mainWindow.removeMenu()

    mainWindow.on('resize', () => {
        const { width, height } = mainWindow.getBounds()
        mainView.setBounds({
            x: 0,
            y: 0,
            width,
            height
        })
    })

    mainWindow.on('resized', () => {
        const { width, height } = mainWindow.getBounds()
        saveWindowBounds({ width, height })
    })
    mainWindow.on('maximize', () => saveMaximize(true))
    mainWindow.on('unmaximize', () => saveMaximize(false))
}
