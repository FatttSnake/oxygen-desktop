import { cloneDeep } from 'lodash'
import { getAuthRoute, mapJsonToRoute, setTitle } from '$/util/route'
import settings from '%/router/settings'

export const getRouter = (mode: ConnectivityMode = 'online') => {
    const children =
        mode === 'offline'
            ? [
                  ...settings.filter((tool) => tool.id === 'settings-base-general'),
                  {
                      path: '*',
                      absolutePath: '*',
                      element: <Navigate to={'/base/general'} replace />
                  }
              ]
            : settings

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
                    children: setTitle(children, '设置')
                },
                {
                    path: '*',
                    absolutePath: '*',
                    element: <Navigate to={'/'} replace />
                }
            ]
        }
    ]

    return createBrowserRouter(mapJsonToRoute(getAuthRoute(cloneDeep(root))))
}
