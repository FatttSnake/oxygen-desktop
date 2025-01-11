import { BrowserWindow, WebContentsView } from 'electron'
import { IpcEvents } from './constants'

export const getGlobalObject = (): SharedObject => global.sharedObject

export const addTab = (
    mainWindow: BrowserWindow,
    view: WebContentsView,
    viewId: string,
    title: string = '',
    pin = false
): Tab => {
    view.webContents.on('page-title-updated', (_, title) => {
        getGlobalObject().mainWindowViews.forEach((item) => {
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
        getGlobalObject().mainWindowViews.forEach((item) => {
            if (item.key === viewId) {
                item.icon = icon
                handleUpdateTabs(mainWindow)
            }
        })
    })
    getGlobalObject().mainWindowViews.push({
        key: viewId,
        view,
        title,
        pin
    })
    handleUpdateTabs(mainWindow)
    return { key: viewId, title, pin }
}

export const updateTab = (mainWindow: BrowserWindow, tabs: Tab[]) => {
    getGlobalObject().mainWindowViews = tabs
        .map((tab) => getGlobalObject().mainWindowViews.find((item) => item.key === tab.key))
        .filter((item) => item !== undefined)
    handleUpdateTabs(mainWindow)
}

export const switchTab = (mainWindow: BrowserWindow, menuView: WebContentsView, key: string) => {
    getGlobalObject().mainWindowViews.forEach((item) => {
        item.view.setVisible(item.key === key)
    })
    menuView.setVisible(
        getGlobalObject().mainWindowViews.find((item) => item.key === key)?.pin != true
    )
    mainWindow.webContents.send(IpcEvents.window.tab.switch, key)
}

export const removeTab = (mainWindow: BrowserWindow, key: string) => {
    getGlobalObject().mainWindowViews = getGlobalObject().mainWindowViews.filter((item) => {
        if (item.key === key) {
            mainWindow.contentView.removeChildView(item.view)
            item.view.webContents.close()
        }
        return item.key !== key
    })
    handleUpdateTabs(mainWindow)
}

const handleUpdateTabs = (mainWindow: BrowserWindow) => {
    mainWindow.webContents.send(
        IpcEvents.window.tab.update,
        getGlobalObject().mainWindowViews.map(
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
