import { Navigate } from 'react-router'
import baseSettings from '%/router/base'
import systemSettings from '%/router/system'

const settings: RouteJsonObject[] = [
    ...baseSettings,
    ...systemSettings,
    { path: '*', absolutePath: '*', element: <Navigate to={'/base/general'} replace /> }
]

export default settings
