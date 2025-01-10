import { BrowserWindow, WebContentsView } from 'electron'
import { IpcEvents } from './constants'

const handleUpdateTabs = (mainWindow: BrowserWindow) => {
    mainWindow.webContents.send(
        IpcEvents.window.tab.update,
        (global.sharedObject as SharedObject).mainWindowViews.map(
            ({ key, icon, title, pin }) =>
                ({
                    key,
                    icon,
                    title,
                    pin
                }) as Tab
        )
    )
}

export const addTab = (
    mainWindow: BrowserWindow,
    view: WebContentsView,
    viewId: string,
    title: string = '',
    pin = false
): Tab => {
    view.webContents.on('page-title-updated', (_, title) => {
        ;(global.sharedObject as SharedObject).mainWindowViews.forEach((item) => {
            if (item.key === viewId) {
                item.title = title
                handleUpdateTabs(mainWindow)
            }
        })
    })
    view.webContents.on('page-favicon-updated', (_, [icon]) => {
        if (icon.endsWith('favicon.ico')) {
            return
        }
        ;(global.sharedObject as SharedObject).mainWindowViews.forEach((item) => {
            if (item.key === viewId) {
                item.icon = icon
                handleUpdateTabs(mainWindow)
            }
        })
    })
    ;(global.sharedObject as SharedObject).mainWindowViews.push({
        key: viewId,
        view,
        title,
        pin
    })
    handleUpdateTabs(mainWindow)
    return { key: viewId, title, pin }
}

export const updateTab = (mainWindow: BrowserWindow, tabs: Tab[]) => {
    ;(global.sharedObject as SharedObject).mainWindowViews = tabs
        .map((tab) =>
            (global.sharedObject as SharedObject).mainWindowViews.find(
                (item) => item.key === tab.key
            )
        )
        .filter((item) => item !== undefined)
    handleUpdateTabs(mainWindow)
}

export const switchTab = (mainWindow: BrowserWindow, menuView: WebContentsView, key: string) => {
    ;(global.sharedObject as SharedObject).mainWindowViews.forEach((item) => {
        item.view.setVisible(item.key === key)
    })
    menuView.setVisible(
        (global.sharedObject as SharedObject).mainWindowViews.find((item) => item.key === key)
            ?.pin != true
    )
    mainWindow.webContents.send(IpcEvents.window.tab.switch, key)
}

export const removeTab = (mainWindow: BrowserWindow, key: string) => {
    ;(global.sharedObject as SharedObject).mainWindowViews = (
        global.sharedObject as SharedObject
    ).mainWindowViews.filter((item) => {
        if (item.key === key) {
            mainWindow.contentView.removeChildView(item.view)
            item.view.webContents.close()
        }
        return item.key !== key
    })
    handleUpdateTabs(mainWindow)
}
