import { BrowserWindow, nativeTheme } from 'electron'
import { settings } from './dataStore'
import { forEachViews, getGlobalObject } from './common'

export const processMainWindow = (mainWindow: BrowserWindow) => {
    if (settings.window.getIsMaximize()) {
        mainWindow.maximize()
    }
    switch (settings.window.getTheme()) {
        case 'FOLLOW_SYSTEM':
            nativeTheme.themeSource = 'system'
            break
        case 'LIGHT':
            nativeTheme.themeSource = 'light'
            break
        case 'DARK':
            nativeTheme.themeSource = 'dark'
    }
    mainWindow.removeMenu()

    mainWindow.on('resize', () => {
        const { width, height } = mainWindow.getContentBounds()
        const menuWidth = getGlobalObject().menuWidth
        forEachViews(({ view, padding, pin }) => {
            view.setBounds({
                x: (pin ? 0 : menuWidth) + padding,
                y: 40 + padding,
                width: (pin ? width : width - menuWidth) - padding * 2,
                height: height - 40 - padding * 2
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
