import App from '$/App'
import { getRouter } from '@/router'

const Core = () => {
    return <App getRouterFunc={getRouter} />
}

export default Core
