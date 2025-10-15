import { app, Menu } from 'electron/main'
import WindowManager from '#/app/windowManager'

const handleOnOpenMainWindow = () => {
    if (WindowManager.existsMainWindow()) {
        WindowManager.showMainWindow()
    } else {
        WindowManager.createMainWindow()
    }
}

const setupDockMenu = () => {
    const dockMenu = Menu.buildFromTemplate([
        {
            id: 'open-main-window',
            label: 'Open main window',
            click: handleOnOpenMainWindow
        }
    ])

    app.dock?.setMenu(dockMenu)
}

export default () => {
    setupDockMenu()
}
