import useStyles from '%/assets/css/pages/settings-framework.style'
import FitFullscreen from '$/components/FitFullscreen'
import Sidebar from '$/components/Sidebar'
import FullscreenLoadingMask from '$/components/FullscreenLoadingMask'
import { getBaseSettingsRouteJson } from '%/router/settings'

const SettingsFramework = () => {
    const { styles, cx } = useStyles()
    const location = useLocation()
    const navigate = useNavigate()

    return (
        <FitFullscreen className={cx(styles.root, 'flex-horizontal')}>
            <div className={styles.leftPanel}>
                <Sidebar>
                    <Sidebar.ItemList>
                        {getBaseSettingsRouteJson().map(
                            (route) =>
                                route.menu &&
                                route.name && (
                                    <Sidebar.Item
                                        icon={route.icon}
                                        text={route.name}
                                        key={route.id}
                                        active={
                                            location.pathname === route.absolutePath &&
                                            !route.children?.some(
                                                (item) => location.pathname === item.absolutePath
                                            )
                                        }
                                        onClick={() => navigate(route.absolutePath)}
                                    >
                                        {route.children?.map(
                                            (subRoute) =>
                                                subRoute.menu &&
                                                subRoute.name && (
                                                    <Sidebar.Item
                                                        text={subRoute.name}
                                                        key={subRoute.id}
                                                        active={
                                                            location.pathname ===
                                                            subRoute.absolutePath
                                                        }
                                                        onClick={() =>
                                                            navigate(subRoute.absolutePath)
                                                        }
                                                    />
                                                )
                                        )}
                                    </Sidebar.Item>
                                )
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
