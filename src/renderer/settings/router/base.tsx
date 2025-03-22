import { getAuthRoute } from '$/util/route'

const baseSettings: RouteJsonObject[] = [
    {
        path: 'base/general',
        absolutePath: '/base/general',
        id: 'settings-base-general',
        component: lazy(() => import('%/pages/base/General')),
        name: '常规',
        icon: lazy(() => import('~icons/oxygen/app')),
        menu: true,
        titlePostfix: ' - 常规'
    },
    {
        path: 'base/account',
        absolutePath: '/base/account',
        id: 'settings-base-account',
        component: lazy(() => import('%/pages/base/Account')),
        name: '账户',
        icon: lazy(() => import('~icons/oxygen/user')),
        menu: true,
        auth: true,
        titlePostfix: ' - 账户'
    }
]

export const getBaseSettingsRouteJson = () => getAuthRoute(baseSettings)

export default baseSettings
