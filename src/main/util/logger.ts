import { is } from '@electron-toolkit/utils'
import log from 'electron-log/main'
import { app } from 'electron'
import WindowManager from '#/app/windowManager'

const getSource = (webContentsId: number): string | undefined => {
    for (const windowInfo of WindowManager.windows.list()) {
        if (windowInfo.window.webContents.id === webContentsId) {
            return `[${windowInfo.type} - ${windowInfo.key}] frameView`
        }

        for (const viewInfo of windowInfo.listViews()) {
            if (viewInfo.view.webContents.id === webContentsId) {
                return `[${windowInfo.type} - ${windowInfo.key}] ${viewInfo.key}`
            }
        }
    }

    return undefined
}

export const initializeLogger = () => {
    log.initialize()

    log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}{z}] [{level}] [{source}] {text}'
    log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}{z}] [{level}] [{source}] {text}'

    log.variables.source = 'main-process'

    log.errorHandler.startCatching({
        showDialog: is.dev,
        onError: (error) => {
            log.error('Uncaught exception: ', error)
        }
    })

    app.on('web-contents-created', (_, webContents) => {
        webContents.on('console-message', (_event, level, message, line, sourceId) => {
            const source = getSource(webContents.id)
            if (!source) {
                return
            }

            const levelMap: ('debug' | 'info' | 'warn' | 'error')[] = [
                'debug',
                'info',
                'warn',
                'error'
            ]
            const logLevel = levelMap[level] ?? 'info'
            const fileName =
                sourceId
                    ?.replace(/.*\/app.asar\/out\/main/, '%main-code%')
                    ?.replace(/.*\/app.asar\/out\/preload/, '%preload-code%')
                    ?.replace(/.*\/app.asar\/out\/renderer/, '%renderer-code%') || 'Unknown'

            const originalSource = log.variables.source
            log.variables.source = source
            log[logLevel]?.(`[${fileName}: ${line}] ${message}`)
            log.variables.source = originalSource
        })
    })

    log.info('Initialized logger')
}
