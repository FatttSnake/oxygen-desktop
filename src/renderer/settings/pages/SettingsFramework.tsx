import useStyles from '%/assets/css/pages/settings-framework.style'
import { useConfig } from '$/components/config/ConfigContext'
import { getLoginStatus } from '$/util/auth'
import FitFullscreen from '$/components/FitFullscreen'
import Sidebar from '$/components/Sidebar'
import FullscreenLoadingMask from '$/components/FullscreenLoadingMask'
import { getBaseSettingsRouteJson } from '%/router/base'
import { getSystemSettingsRouteJson } from '%/router/system'

const SettingsFramework = () => {
    const { styles, cx } = useStyles()
    const location = useLocation()
    const navigate = useNavigate()
    const { mode } = useConfig()
    const isOffline = mode === 'offline'
    const getBase = () =>
        isOffline
            ? getBaseSettingsRouteJson().filter((route) => route.id === 'settings-base-general')
            : getBaseSettingsRouteJson()
    const getSystem = () => (isOffline ? [] : getSystemSettingsRouteJson())

    const mapRouterJsonObject = (route: RouteJsonObject[]) =>
        route.map(
            (route) =>
                route.menu &&
                route.name &&
                (!route.auth || getLoginStatus()) && (
                    <Sidebar.Item
                        icon={route.icon}
                        text={route.name}
                        key={route.id}
                        active={
                            location.pathname === route.absolutePath &&
                            !route.children?.some((item) => location.pathname === item.absolutePath)
                        }
                        onClick={() => navigate(route.absolutePath)}
                    >
                        {route.children?.map(
                            (subRoute) =>
                                subRoute.menu &&
                                subRoute.name &&
                                (!subRoute.auth || getLoginStatus()) && (
                                    <Sidebar.Item
                                        text={subRoute.name}
                                        key={subRoute.id}
                                        active={location.pathname === subRoute.absolutePath}
                                        onClick={() => navigate(subRoute.absolutePath)}
                                    />
                                )
                        )}
                    </Sidebar.Item>
                )
        )

    useEffect(() => {
        oxygenApi.navigateTo && navigate(oxygenApi.navigateTo)
        oxygenApi.window.navigate.onGoto((value) => navigate(value))

        return () => {
            oxygenApi.window.navigate.offGoto()
        }
    }, [])

    return (
        <FitFullscreen className={cx(styles.root, 'flex-horizontal')}>
            <div className={styles.leftPanel}>
                <Sidebar>
                    <Sidebar.ItemList>
                        <Sidebar.Group title={'应用'}>
                            {mapRouterJsonObject(getBase())}
                        </Sidebar.Group>
                        {!isOffline && (
                            <Sidebar.Group title={'系统'}>
                                {mapRouterJsonObject(getSystem())}
                            </Sidebar.Group>
                        )}
                    </Sidebar.ItemList>
                </Sidebar>
            </div>
            <div className={styles.rightPanel}>
                <Suspense fallback={<FullscreenLoadingMask />}>
                    <Outlet />
                </Suspense>
            </div>
        </FitFullscreen>
    )
}

export default SettingsFramework
