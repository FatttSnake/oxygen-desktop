import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import toolHtml from '$/assets/template/playground/tool.html?raw'

const Frame = lazy(() => import('#/Frame'))
const Core = lazy(() => import('@/Core'))
const Settings = lazy(() => import('%/Settings'))
const Sign = lazy(() => import('+/Sign'))

switch (oxygenApi.renderer) {
    case 'frame':
        createRoot(document.getElementById('root')!).render(
            <StrictMode>
                <Frame />
            </StrictMode>
        )
        break
    case 'core':
        createRoot(document.getElementById('root')!).render(
            <StrictMode>
                <Core />
            </StrictMode>
        )
        break
    case 'settings':
        createRoot(document.getElementById('root')!).render(
            <StrictMode>
                <Settings />
            </StrictMode>
        )
        break
    case 'sign':
        createRoot(document.getElementById('root')!).render(
            <StrictMode>
                <Sign />
            </StrictMode>
        )
        break
    default:
        document.documentElement.innerHTML = toolHtml
}
