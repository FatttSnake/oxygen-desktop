import _ from 'lodash'
import { getAuthRoute, mapJsonToRoute, setTitle } from '$/util/route'
import settings from '%/router/settings'

const root: RouteJsonObject[] = [
    {
        path: '/',
        absolutePath: '/',
        component: lazy(() => import('%/AuthRoute')),
        children: [
            {
                path: 'settings',
                absolutePath: '/settings',
                id: 'settingsFramework',
                component: lazy(() => import('%/pages/SettingsFramework')),
                children: setTitle(settings, '设置'),
                name: '设置'
            },
            {
                path: '*',
                absolutePath: '*',
                element: <Navigate to={'/'} replace />
            }
        ]
    }
]

export const getRouter = () => createBrowserRouter(mapJsonToRoute(getAuthRoute(_.cloneDeep(root))))
