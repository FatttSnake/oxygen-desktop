import { Notification } from 'electron'

declare global {
    interface WindowControlsOverlay {
        getTitlebarAreaRect(): DOMRect
        visible: boolean
    }

    interface Navigator {
        windowControlsOverlay?: WindowControlsOverlay
    }

    type Renderer = 'main' | 'tool' | 'mask'

    interface OxygenAPI {
        platform: NodeJS.Platform
        renderer: Renderer
        updateTitleBar: (color: string, symbolColor: string) => void
        onOpenUrl: (callback: (url: string) => void) => void
        setToolViewVisible: (visible: boolean) => void
        setToolViewBounds: (x: number, y: number, width: number, height: number) => void
    }

    class Notify extends Notification {}

    declare const oxygenApi: OxygenAPI
}
