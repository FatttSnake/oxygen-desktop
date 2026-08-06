import { cloneDeep } from 'lodash'
import { getAuthRoute, mapJsonToRoute, setTitle } from '$/util/route'
import tools from '@/router/tools'

export const getRouter = (mode: ConnectivityMode = 'online') => {
    const children =
        mode === 'offline'
            ? [
                  ...tools.filter((tool) => tool.id === 'tools-install'),
                  { path: '*', absolutePath: '*', element: <Navigate to={'/install'} replace /> }
              ]
            : tools

    const root: RouteJsonObject[] = [
        {
            path: '/',
            absolutePath: '/',
            component: lazy(() => import('$/AuthRoute')),
            children: [
                {
                    path: '',
                    absolutePath: '/',
                    id: 'toolsFramework',
                    component: lazy(() => import('@/pages/ToolsFramework')),
                    children: setTitle(children, '氧工具'),
                    name: '工具',
                    auth: false
                },
                {
                    path: '*',
                    absolutePath: '*',
                    element: <Navigate to="/" replace />
                }
            ]
        }
    ]

    return createBrowserRouter(mapJsonToRoute(getAuthRoute(cloneDeep(root))))
}
