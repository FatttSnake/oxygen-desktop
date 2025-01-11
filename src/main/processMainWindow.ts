import { BrowserWindow, WebContentsView } from 'electron'
import { settings } from './dataStore'
import { getGlobalObject } from './common'

export const processMainWindow = (mainWindow: BrowserWindow, menuView: WebContentsView) => {
    if (settings.window.getIsMaximize()) {
        mainWindow.maximize()
    }
    mainWindow.removeMenu()

    mainWindow.on('resize', () => {
        const { width, height } = mainWindow.getContentBounds()
        const menuWidth = getGlobalObject().menuWidth
        menuView.setBounds({
            x: 0,
            y: 41,
            width,
            height: height - 41
        })
        getGlobalObject().mainWindowViews.forEach(({ view, pin }) => {
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
        settings.window.saveBounds({ width, height })
    })
    mainWindow.on('maximize', () => settings.window.saveIsMaximize(true))
    mainWindow.on('unmaximize', () => settings.window.saveIsMaximize(false))
}
