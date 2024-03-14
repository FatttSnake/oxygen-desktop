const user: RouteJsonObject[] = [
    {
        path: '',
        absolutePath: '/user',
        id: 'user',
        component: lazy(() => import('@/pages/User')),
        name: '个人档案',
        icon: lazy(() => import('~icons/oxygen/user')),
        menu: true
    },
    {
        path: '*',
        absolutePath: '*',
        element: <Navigate to="/user" replace />
    }
]

export default user
