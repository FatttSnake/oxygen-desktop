import useStyles from '@/assets/css/pages/user-framework.style'
import user from '@/router/user'
import FitFullscreen from '$/components/FitFullscreen'
import Sidebar from '$/components/Sidebar'
import FullscreenLoadingMask from '$/components/FullscreenLoadingMask'
import Permission from '$/components/Permission'

const UserFramework = () => {
    const { styles, cx } = useStyles()
    const location = useLocation()
    const navigate = useNavigate()

    return (
        <FitFullscreen className={cx(styles.root, 'flex-horizontal')}>
            <div className={styles.leftPanel}>
                <Sidebar
                    bottomFixed={
                        <Sidebar.ItemList>
                            <Permission path={'/system'}>
                                <Sidebar.Item
                                    icon={IconOxygenSetting}
                                    text={'系统配置'}
                                    active={location.pathname === '/system'}
                                    onClick={() => navigate('/system')}
                                />
                            </Permission>
                            <Sidebar.Item
                                icon={IconOxygenTool}
                                text={'回到氧工具'}
                                active={location.pathname === '/'}
                                onClick={() => navigate('/')}
                            />
                        </Sidebar.ItemList>
                    }
                >
                    <Sidebar.ItemList>
                        {user.map(
                            (value) =>
                                value.menu && (
                                    <Sidebar.Item
                                        key={value.id}
                                        icon={value.icon}
                                        text={value.name}
                                        active={location.pathname === value.absolutePath}
                                        onClick={() => navigate(value.absolutePath)}
                                    />
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

export default UserFramework
