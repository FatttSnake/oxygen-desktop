import styles from '@/assets/css/pages/system-framework.module.less'
import { getSystemRouteJson } from '@/router/system'
import FitFullscreen from '@/components/common/FitFullscreen'
import Sidebar from '@/components/common/Sidebar'
import FullscreenLoadingMask from '@/components/common/FullscreenLoadingMask'

const SystemFramework = () => {
    return (
        <>
            <FitFullscreen className={`${styles.root} flex-horizontal`}>
                <div className={styles.leftPanel}>
                    <Sidebar title={'系统配置'}>
                        <Sidebar.Scroll>
                            <Sidebar.ItemList>
                                {getSystemRouteJson().map((route) => {
                                    return (
                                        route.menu &&
                                        route.name && (
                                            <Sidebar.Item
                                                end={route.id === 'system' ? true : undefined}
                                                path={route.absolutePath}
                                                icon={route.icon}
                                                text={route.name}
                                                key={route.id}
                                            >
                                                {route.children?.map(
                                                    (subRoute) =>
                                                        subRoute.menu &&
                                                        subRoute.name && (
                                                            <Sidebar.Item
                                                                end
                                                                path={subRoute.absolutePath}
                                                                text={subRoute.name}
                                                                key={subRoute.id}
                                                            />
                                                        )
                                                )}
                                            </Sidebar.Item>
                                        )
                                    )
                                })}
                            </Sidebar.ItemList>
                        </Sidebar.Scroll>
                    </Sidebar>
                </div>
                <div className={styles.rightPanel}>
                    <Suspense
                        fallback={
                            <>
                                <FullscreenLoadingMask />
                            </>
                        }
                    >
                        <Outlet />
                    </Suspense>
                </div>
            </FitFullscreen>
        </>
    )
}

export default SystemFramework
