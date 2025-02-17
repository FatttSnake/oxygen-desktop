import { getAuthRoute } from '$/util/route'
import { Navigate } from 'react-router'

const baseSettings: RouteJsonObject[] = [
    {
        path: 'base/general',
        absolutePath: '/settings/base/general',
        id: 'settings-base-general',
        component: lazy(() => import('%/pages/base/General')),
        name: '常规',
        icon: lazy(() => import('~icons/oxygen/setting')),
        menu: true,
        titlePostfix: ' - 常规'
    },
    {
        path: '*',
        absolutePath: '*',
        element: <Navigate to={'/settings/base/general'} />
    }
]

const systemSettings: RouteJsonObject[] = []

export const getBaseSettingsRouteJson = () => getAuthRoute(baseSettings)
export const getSystemSettingsRouteJson = () => getAuthRoute(systemSettings)

const settings: RouteJsonObject[] = [
    ...baseSettings,
    ...systemSettings,
    { path: '*', absolutePath: '*', element: <Navigate to={'/settings/base'} replace /> }
]

export default settings
