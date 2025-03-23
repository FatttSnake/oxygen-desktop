import { cloneDeep } from 'lodash'
import { getAuthRoute, mapJsonToRoute, setTitle } from '$/util/route'
import settings from '%/router/settings'

const root: RouteJsonObject[] = [
    {
        path: '/',
        absolutePath: '/',
        component: lazy(() => import('$/AuthRoute')),
        children: [
            {
                path: '',
                absolutePath: '/',
                id: 'settingsFramework',
                component: lazy(() => import('%/pages/SettingsFramework')),
                children: setTitle(settings, '设置')
            },
            {
                path: '*',
                absolutePath: '*',
                element: <Navigate to={'/'} replace />
            }
        ]
    }
]

export const getRouter = () => createBrowserRouter(mapJsonToRoute(getAuthRoute(cloneDeep(root))))
