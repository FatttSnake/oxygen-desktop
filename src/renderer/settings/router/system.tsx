import { getAuthRoute } from '$/util/route'

const systemSettings: RouteJsonObject[] = [
    {
        path: 'system/statistics',
        absolutePath: '/system/statistics',
        id: 'settings-system-statistics',
        component: lazy(() => import('%/pages/system/Statistics')),
        name: '概况',
        icon: lazy(() => import('~icons/oxygen/chart')),
        menu: true,
        auth: true,
        permission: true,
        titlePostfix: ' - 系统概况'
    },
    {
        path: 'system/settings',
        absolutePath: '/system/settings',
        id: 'settings-system-settings',
        component: lazy(() => import('%/pages/system/Settings')),
        name: '配置',
        icon: lazy(() => import('~icons/oxygen/option')),
        menu: true,
        auth: true,
        permission: true,
        titlePostfix: ' - 系统配置'
    },
    {
        path: 'system/tools',
        absolutePath: '/system/tools',
        id: 'settings-system-tools',
        name: '工具',
        icon: lazy(() => import('~icons/oxygen/tool')),
        menu: true,
        auth: true,
        permission: true,
        children: [
            {
                path: '',
                absolutePath: '/system/tools',
                id: 'tools-system-tools-index',
                component: lazy(() => import('%/pages/system/Tools')),
                name: '管理',
                menu: true,
                auth: true,
                permission: true,
                operationCode: 'system:tool:query:tool',
                titlePostfix: ' - 工具管理'
            },
            {
                path: 'code/:id',
                absolutePath: '/system/tools/code',
                id: 'tools-system-tools-code',
                component: lazy(() => import('%/pages/system/Tools/Code')),
                operationCode: 'system:tool:query:tool',
                titlePostfix: ' - 工具源码'
            },
            {
                path: 'template',
                absolutePath: '/system/tools/template',
                id: 'tools-system-tools-template',
                component: lazy(() => import('%/pages/system/Tools/Template')),
                name: '模板',
                menu: true,
                auth: true,
                permission: true,
                operationCode: 'system:tool:query:template',
                titlePostfix: ' - 工具模板'
            },
            {
                path: 'template/:id',
                absolutePath: '/system/tools/template',
                id: 'tools-system-tools-template-editor',
                component: lazy(() => import('%/pages/system/Tools/TemplateEditor.tsx')),
                name: '模板编辑器',
                operationCode: 'system:tool:query:template',
                titlePostfix: ' - 工具模板编辑器'
            },
            {
                path: 'base',
                absolutePath: '/system/tools/base',
                id: 'tools-system-tools-base',
                component: lazy(() => import('%/pages/system/Tools/Base')),
                name: '基板',
                menu: true,
                auth: true,
                permission: true,
                operationCode: 'system:tool:query:base',
                titlePostfix: ' - 工具基板'
            },
            {
                path: 'base/:id',
                absolutePath: '/system/tools/base',
                id: 'tools-system-tools-base-editor',
                component: lazy(() => import('%/pages/system/Tools/BaseEditor')),
                name: '基板编辑器',
                operationCode: 'system:tool:query:base',
                titlePostfix: ' - 工具基板编辑器'
            },
            {
                path: 'base/:id/:version',
                absolutePath: '/system/tools/base',
                id: 'tools-system-tools-base-preview',
                component: lazy(() => import('%/pages/system/Tools/BasePreview')),
                name: '基板预览',
                operationCode: 'system:tool:query:base',
                titlePostfix: ' - 工具基板预览'
            },
            {
                path: 'category',
                absolutePath: '/system/tools/category',
                id: 'tools-system-tools-category',
                component: lazy(() => import('%/pages/system/Tools/Category')),
                name: '类别',
                menu: true,
                auth: true,
                permission: true,
                operationCode: 'system:tool:query:category',
                titlePostfix: ' - 工具类别'
            }
        ]
    },
    {
        path: 'system/user',
        absolutePath: '/system/user',
        id: 'settings-system-user',
        component: lazy(() => import('%/pages/system/User')),
        name: '用户',
        icon: lazy(() => import('~icons/oxygen/user')),
        menu: true,
        auth: true,
        permission: true,
        titlePostfix: ' - 用户管理'
    },
    {
        path: 'system/role',
        absolutePath: '/system/role',
        id: 'settings-system-role',
        component: lazy(() => import('%/pages/system/Role')),
        name: '角色',
        icon: lazy(() => import('~icons/oxygen/role')),
        menu: true,
        auth: true,
        permission: true,
        titlePostfix: ' - 角色管理'
    },
    {
        path: 'system/group',
        absolutePath: '/system/group',
        id: 'settings-system-group',
        component: lazy(() => import('%/pages/system/Group')),
        name: '群组',
        icon: lazy(() => import('~icons/oxygen/group')),
        menu: true,
        auth: true,
        permission: true,
        titlePostfix: ' - 群组管理'
    },
    {
        path: 'system/log',
        absolutePath: '/system/log',
        id: 'settings-system-log',
        component: lazy(() => import('%/pages/system/Log')),
        name: '日志',
        icon: lazy(() => import('~icons/oxygen/log')),
        menu: true,
        auth: true,
        permission: true,
        titlePostfix: ' - 系统日志'
    }
]

export const getSystemSettingsRouteJson = () => getAuthRoute(systemSettings)

export default systemSettings
