import _ from 'lodash'
import system from '@/router/system'
import user from '@/router/user'
import tools from '@/router/tools'
import { getAuthRoute, mapJsonToRoute, setTitle } from '@/util/route'

const lazySignPage = lazy(() => import('@/pages/Sign'))

const root: RouteJsonObject[] = [
    {
        path: '/',
        absolutePath: '/',
        component: lazy(() => import('@/AuthRoute')),
        children: [
            {
                path: 'register',
                absolutePath: '/register',
                id: 'register',
                component: lazySignPage
            },
            {
                path: 'verify',
                absolutePath: '/verify',
                id: 'verify',
                component: lazySignPage
            },
            {
                path: 'forget',
                absolutePath: '/forget',
                id: 'forget',
                component: lazySignPage
            },
            {
                path: 'login',
                absolutePath: '/login',
                id: 'login',
                component: lazySignPage
            },
            {
                path: 'loading',
                absolutePath: '/loading',
                id: 'loading',
                component: lazy(() => import('@/components/common/FullscreenLoadingMask'))
            },
            {
                path: 'user',
                absolutePath: '/user',
                id: 'userFramework',
                component: lazy(() => import('@/pages/UserFramework')),
                children: setTitle(user, '个人中心'),
                name: '个人中心',
                auth: true
            },
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
