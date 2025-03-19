import useStyles from '%/assets/css/pages/settings-framework.style'
import FitFullscreen from '$/components/FitFullscreen'
import Sidebar from '$/components/Sidebar'
import FullscreenLoadingMask from '$/components/FullscreenLoadingMask'
import { getBaseSettingsRouteJson } from '%/router/base'
import { getSystemSettingsRouteJson } from '%/router/system'

const SettingsFramework = () => {
    const { styles, cx } = useStyles()
    const location = useLocation()
    const navigate = useNavigate()

    const mapRouterJsonObject = (route: RouteJsonObject[]) =>
        route.map(
            (route) =>
                route.menu &&
                route.name && (
                    <Sidebar.Item
                        icon={route.icon}
                        text={route.name}
                        key={route.id}
                        active={
                            location.pathname === route.absolutePath &&
                            !route.children?.some((item) => location.pathname === item.absolutePath)
                        }
                        onClick={() => navigate(route.absolutePath)}
                    />
                )
        )

    return (
        <FitFullscreen className={cx(styles.root, 'flex-horizontal')}>
            <div className={styles.leftPanel}>
                <Sidebar>
                    <Sidebar.ItemList>
                        <Sidebar.Group title={'应用'}>
                            {mapRouterJsonObject(getBaseSettingsRouteJson())}
                        </Sidebar.Group>
                        <Sidebar.Group title={'系统'}>
                            {mapRouterJsonObject(getSystemSettingsRouteJson())}
                        </Sidebar.Group>
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
