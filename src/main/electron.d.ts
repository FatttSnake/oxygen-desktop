import { BrowserWindow, WebContentsView } from 'electron'

declare global {
    type _BrowserWindow = BrowserWindow

    type _WebContentsView = WebContentsView
}
