import { BrowserWindow, WebContentsView } from 'electron'
import { getMaximize, saveMaximize, saveWindowBounds } from './dataStore/main'

export const processMainWindow = (mainWindow: BrowserWindow, menuView: WebContentsView) => {
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
            width,
            height: height - 41
        })
        ;(global.sharedObject as SharedObject).mainWindowViews.forEach(({ view, pin }) => {
            view.setBounds({
                x: pin ? 0 : menuWidth,
                y: 41,
                width: pin ? width : width - menuWidth,
                height: height - 41
            })
        })
    })

    mainWindow.on('resized', () => {
        const { width, height } = mainWindow.getBounds()
        saveWindowBounds({ width, height })
    })
    mainWindow.on('maximize', () => saveMaximize(true))
    mainWindow.on('unmaximize', () => saveMaximize(false))
}
