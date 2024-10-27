import '@/assets/css/pages/user-framework.less'
import user from '@/router/user'
import { hasPathPermission } from '@/util/auth'
import FitFullscreen from '@/components/common/FitFullscreen'
import Sidebar from '@/components/common/Sidebar'
import FullscreenLoadingMask from '@/components/common/FullscreenLoadingMask'

const UserFramework = () => {
    return (
        <>
            <FitFullscreen data-component={'user-framework'} className={'flex-horizontal'}>
                <div className={'left-panel'}>
                    <Sidebar
                        title={'个人中心'}
                        bottomFixed={
                            <Sidebar.ItemList>
                                {hasPathPermission('/system') && (
                                    <Sidebar.Item
                                        path={'/system'}
                                        icon={IconOxygenSetting}
                                        text={'系统配置'}
                                    />
                                )}
                                <Sidebar.Item
                                    path={'/'}
                                    icon={IconOxygenTool}
                                    text={'回到氧工具'}
                                />
                            </Sidebar.ItemList>
                        }
                    >
                        <Sidebar.ItemList>
                            {user.map((value) => {
                                return (
                                    value.menu && (
                                        <Sidebar.Item
                                            end={value.id === 'user' && true}
                                            path={value.absolutePath}
                                            icon={value.icon}
                                            text={value.name}
                                            key={value.id}
                                        />
                                    )
                                )
                            })}
                        </Sidebar.ItemList>
                    </Sidebar>
                </div>
                <div className={'right-panel'}>
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

export default UserFramework
