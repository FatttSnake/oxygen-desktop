import { Notification } from 'electron'

declare global {
    interface WindowControlsOverlay {
        getTitlebarAreaRect(): DOMRect
        visible: boolean
    }

    interface Navigator {
        windowControlsOverlay?: WindowControlsOverlay
    }

    type Renderer = 'frame' | 'menu' | 'main' | 'settings' | 'tool'

    interface OxygenAPI {
        platform: NodeJS.Platform
        renderer: Renderer
        window: {
            theme: {
                get: () => Promise<WindowTheme>
                onUpdate: (callback: (theme: WindowTheme) => void) => void
                update: (theme: WindowTheme) => void
            }
            titleBarOverlay: {
                setColor: (color: string, symbolColor: string) => void
            }
            tab: {
                create: (url: string) => void
                list: () => Promise<TabInstance[]>
                onUpdate: (callback: (tabs: TabInstance[]) => void) => void
                update: (tabs: TabInstance[]) => void
                onSwitch: (callback: (key: string) => void) => void
                switch: (key: string) => Promise<boolean>
                close: (key: string) => void
                independent: (key: string) => void
            }
        }
        sidebar: {
            width: {
                update: (width: number) => void
            }
            collapse: {
                get: () => Promise<boolean>
                update: (value: boolean) => void
                onUpdate: (callback: (value: boolean) => void) => void
            }
        }
        mainView: {
            url: {
                onOpen: (callback: (url: string) => void) => void
            }
        }
    }

    class Notify extends Notification {}

    declare const oxygenApi: OxygenAPI
}
