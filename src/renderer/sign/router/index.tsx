import { cloneDeep } from 'lodash'
import { getAuthRoute, mapJsonToRoute } from '$/util/route'

const lazySignPage = lazy(() => import('+/pages'))

const root: RouteJsonObject[] = [
    {
        path: '/',
        absolutePath: '/',
        component: lazy(() => import('$/AuthRoute')),
        children: [
            {
                path: 'login',
                absolutePath: '/login',
                id: 'login',
                component: lazySignPage,
                title: '登录'
            },
            {
                path: 'register',
                absolutePath: '/register',
                id: 'register',
                component: lazySignPage,
                title: '注册'
            },
            {
                path: 'verify',
                absolutePath: '/verify',
                id: 'verify',
                component: lazySignPage,
                title: '验证邮箱'
            },
            {
                path: 'forget',
                absolutePath: '/forget',
                id: 'forget',
                component: lazySignPage,
                title: '忘记密码'
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
