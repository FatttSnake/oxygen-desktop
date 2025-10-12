import { join } from 'path'
import fs from 'fs'
import url from 'node:url'
import { app, protocol, net } from 'electron'
import { electronApp } from '@electron-toolkit/utils'
import handleAppEvents, { initializeApplication } from '#/app/handleAppEvents'
import handleIpcEvents from '#/app/handleIpcEvents'

// Application singleton execution
if (!app.requestSingleInstanceLock()) {
    app.quit()
}

protocol.registerSchemesAsPrivileged([
    {
        scheme: 'local',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true
        }
    }
])

handleAppEvents()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    protocol.handle('local', (request) => {
        const { host } = new URL(request.url)
        if (host === 'oxygen.fatweb.top') {
            let filePath = request.url.slice('local://oxygen.fatweb.top/'.length)
            if (fs.existsSync(filePath)) {
                return net.fetch(url.pathToFileURL(filePath).toString())
            }

            filePath = join(join(__dirname, '../renderer'), filePath)
            if (fs.existsSync(filePath)) {
                return net.fetch(url.pathToFileURL(filePath).toString())
            }

            return net.fetch(
                url.pathToFileURL(join(__dirname, '../renderer/index.html')).toString()
            )
        } else {
            const filePath = request.url.slice('local://'.length)
            return net.fetch(url.pathToFileURL(filePath).toString())
        }
    })

    // Set app user model id for windows
    electronApp.setAppUserModelId('top.fatweb')

    handleIpcEvents()

    initializeApplication()
})
