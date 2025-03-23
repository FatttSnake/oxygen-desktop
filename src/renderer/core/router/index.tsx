import { cloneDeep } from 'lodash'
import { getAuthRoute, mapJsonToRoute, setTitle } from '$/util/route'
import tools from '@/router/tools'

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
                children: setTitle(tools, '氧工具'),
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

export const getRouter = () => createBrowserRouter(mapJsonToRoute(getAuthRoute(cloneDeep(root))))
