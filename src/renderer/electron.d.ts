import { Notification } from 'electron'
import { Tab } from '#/components/TabList.tsx'

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
        window: {
            titleBarOverlay: {
                setColor: (color: string, symbolColor: string) => void
            }
            tab: {
                create: (url: string) => void
                list: () => Promise<Tab[]>
                onUpdate: (callback: (tabs: Tab[]) => void) => void
                update: (tabs: Tab[]) => void
                onSwitch: (callback: (key: string) => void) => void
                switch: (key: string) => void
                close: (key: string) => void
                independent: (key: string) => void
            }
        }

        sidebar: {
            collapse: {
                get: () => boolean
                update: (value: boolean) => void
                onUpdate: (callback: (value: boolean) => void) => void
            }
        }

        menuView: {
            width: {
                update: (width: number) => void
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
