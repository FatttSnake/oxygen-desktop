import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Frame from '#/Frame'
import Settings from '%/Settings'
import Core from '@/Core'
import Sign from '+/Sign'

const getComponent = () => {
    switch (oxygenApi.renderer) {
        case 'frame':
            return <Frame />
        case 'settings':
            return <Settings />
        case 'sign':
            return <Sign />
        default:
            return <Core />
    }
}

createRoot(document.getElementById('root')!).render(<StrictMode>{getComponent()}</StrictMode>)
