import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '%/App'

export default () => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <App />
        </StrictMode>
    )
}
