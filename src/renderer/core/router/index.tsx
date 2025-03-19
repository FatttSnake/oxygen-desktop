import _ from 'lodash'
import { getAuthRoute, mapJsonToRoute, setTitle } from '$/util/route'
import system from '@/router/system'
import tools from '@/router/tools'

const root: RouteJsonObject[] = [
    {
        path: '/',
        absolutePath: '/',
        component: lazy(() => import('$/AuthRoute')),
        children: [
            {
                path: 'system',
                absolutePath: '/system',
                id: 'systemFramework',
                component: lazy(() => import('@/pages/SystemFramework')),
                children: setTitle(system, '系统配置'),
                name: '系统配置',
                auth: true,
                permission: true
            },
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

export const getRouter = () => createBrowserRouter(mapJsonToRoute(getAuthRoute(_.cloneDeep(root))))
