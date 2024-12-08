import { Notification } from 'electron'

declare global {
    interface WindowControlsOverlay {
        getTitlebarAreaRect(): DOMRect
        visible: boolean
    }

    interface Navigator {
        windowControlsOverlay?: WindowControlsOverlay
    }

    type Renderer = 'frame' | 'menu' | 'main' | 'tool'

    interface OxygenAPI {
        platform: NodeJS.Platform
        renderer: Renderer
        updateTitleBar: (color: string, symbolColor: string) => void
        updateMenuWidth: (width: number) => void
        onOpenUrl: (callback: (url: string) => void) => void
    }

    class Notify extends Notification {}

    declare const oxygenApi: OxygenAPI
}
