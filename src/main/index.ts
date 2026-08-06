import { extname, join } from 'path'
import fs from 'fs'
import url from 'node:url'
import { app, protocol, net } from 'electron'
import { electronApp } from '@electron-toolkit/utils'
import { WindowConstants } from '#/constants'
import { initializeLogger } from '#/util/logger'
import handleAppEvents, { initializeApplication } from '#/app/handleAppEvents'

initializeLogger()

app.setName(WindowConstants.APPLICATION_NAME)

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
        const rendererRoot = join(__dirname, '../renderer')
        const isFile = (path: string): boolean => {
            try {
                return fs.statSync(path).isFile()
            } catch {
                return false
            }
        }
        const safeDecode = (value: string): string => {
            try {
                return decodeURIComponent(value)
            } catch {
                return value
            }
        }
        const ASSET_EXTENSIONS = new Set([
            'js',
            'mjs',
            'css',
            'map',
            'png',
            'jpg',
            'jpeg',
            'gif',
            'webp',
            'svg',
            'ico',
            'avif',
            'woff',
            'woff2',
            'ttf',
            'eot',
            'otf',
            'mp4',
            'webm',
            'mp3',
            'wav',
            'json',
            'wasm'
        ])

        const { host, pathname } = new URL(request.url)
        if (host === 'oxygen.fatweb.top') {
            const filePath = safeDecode(pathname.slice(1))

            if (filePath && isFile(filePath)) {
                return net.fetch(url.pathToFileURL(filePath).toString())
            }

            const resolved = join(rendererRoot, filePath)
            if (isFile(resolved)) {
                return net.fetch(url.pathToFileURL(resolved).toString())
            }

            if (ASSET_EXTENSIONS.has(extname(filePath).slice(1).toLowerCase())) {
                const segments = filePath.split(/[\\/]+/).filter(Boolean)
                while (segments.length > 1) {
                    segments.shift()
                    const candidate = join(rendererRoot, ...segments)
                    if (isFile(candidate)) {
                        return net.fetch(url.pathToFileURL(candidate).toString())
                    }
                }
                return new Response('Not Found', { status: 404 })
            }

            return net.fetch(url.pathToFileURL(join(rendererRoot, 'index.html')).toString())
        } else {
            const filePath = request.url.slice('local://'.length)
            return net.fetch(url.pathToFileURL(filePath).toString())
        }
    })

    // Set app user model id for windows
    electronApp.setAppUserModelId('top.fatweb')

    initializeApplication()
})
