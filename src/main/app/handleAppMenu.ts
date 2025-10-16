import { app, Menu, MenuItemConstructorOptions } from 'electron/main'
import WindowManager from '#/app/windowManager'

const handleOnOpenMainWindow = () => {
    if (WindowManager.existsMainWindow()) {
        WindowManager.showMainWindow()
    } else {
        WindowManager.createMainWindow()
    }
}

const setupApplicationMenu = () => {
    const isMac = process.platform === 'darwin'
    const applicationMenu = Menu.buildFromTemplate([
        ...(isMac
            ? [
                  {
                      role: 'appMenu'
                  }
              ]
            : []),
        {
            label: 'File',
            submenu: [
                { label: 'Open Main Window', click: handleOnOpenMainWindow },
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },
        {
            role: 'editMenu'
        },
        {
            role: 'windowMenu'
        },
        {
            role: 'help',
            submenu: []
        }
    ] as MenuItemConstructorOptions[])

    Menu.setApplicationMenu(applicationMenu)
}

const setupDockMenu = () => {
    const dockMenu = Menu.buildFromTemplate([
        {
            id: 'open-main-window',
            label: 'Open Main Window',
            click: handleOnOpenMainWindow
        }
    ])

    app.dock?.setMenu(dockMenu)
}

export default () => {
    setupApplicationMenu()
    setupDockMenu()
}
