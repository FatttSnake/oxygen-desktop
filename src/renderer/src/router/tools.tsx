export const tools: RouteJsonObject[] = [
    {
        path: '',
        absolutePath: '/',
        id: 'tools',
        component: lazy(() => import('@/pages/Tools')),
        name: '主页',
        icon: lazy(() => import('~icons/oxygen/home')),
        menu: true,
        auth: false
    },
    {
        path: 'store',
        absolutePath: '/store',
        id: 'tools-store',
        component: lazy(() => import('@/pages/Tools/Store')),
        name: '工具商店',
        titlePostfix: ' - 商店',
        icon: lazy(() => import('~icons/oxygen/store')),
        menu: true
    },
    {
        path: 'store/:username',
        absolutePath: '/store',
        id: 'tools-view-user',
        component: lazy(() => import('@/pages/Tools/User')),
        name: '开发者'
    },
    {
        path: 'create',
        absolutePath: '/create',
        id: 'tools-create',
        component: lazy(() => import('@/pages/Tools/Create')),
        name: '创建工具',
        titlePostfix: ' - 创建新工具',
        icon: lazy(() => import('~icons/oxygen/newProject')),
        menu: false,
        auth: true
    },
    {
        path: 'view/:username/:toolId/:ver',
        absolutePath: '/view',
        id: 'tools-view-ver',
        component: lazy(() => import('@/pages/Tools/View')),
        name: '查看'
    },
    {
        path: 'view/:username/:toolId',
        absolutePath: '/view',
        id: 'tools-view',
        component: lazy(() => import('@/pages/Tools/View')),
        name: '查看'
    },
    {
        path: 'edit/:toolId',
        absolutePath: '/edit',
        id: 'tools-edit',
        component: lazy(() => import('@/pages/Tools/Edit')),
        name: '编辑',
        auth: true
    },
    {
        path: 'source/:username/:toolId/:ver',
        absolutePath: '/source',
        id: 'tools-source-ver',
        component: lazy(() => import('@/pages/Tools/Source')),
        name: '源码',
        auth: true
    },
    {
        path: 'source/:username/:toolId',
        absolutePath: '/source',
        id: 'tools-source',
        component: lazy(() => import('@/pages/Tools/Source')),
        name: '源码',
        auth: true
    },
    {
        path: '*',
        absolutePath: '*',
        element: <Navigate to="/" replace />
    }
]

export default tools
