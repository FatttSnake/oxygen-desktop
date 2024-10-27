import '@/assets/css/pages/system/index.less'
import HideScrollbar from '@/components/common/HideScrollbar'
import FitFullscreen from '@/components/common/FitFullscreen'
import FlexBox from '@/components/common/FlexBox'
import Permission from '@/components/common/Permission'
import UrlCard from '@/components/common/UrlCard'

const System = () => {
    return (
        <>
            <FitFullscreen data-component={'system'}>
                <HideScrollbar isShowVerticalScrollbar autoHideWaitingTime={1000}>
                    <FlexBox direction={'horizontal'} className={'root-content'}>
                        <Permission path={'/system/statistics'}>
                            <UrlCard icon={IconOxygenAnalysis} url={'statistics'}>
                                系统概况
                            </UrlCard>
                        </Permission>
                        <Permission path={'/system/settings'}>
                            <UrlCard icon={IconOxygenOption} url={'settings'}>
                                系统设置
                            </UrlCard>
                        </Permission>
                        <Permission operationCode={['system:tool:query:tool']}>
                            <UrlCard icon={IconOxygenTool} url={'tools'}>
                                工具管理
                            </UrlCard>
                        </Permission>
                        <Permission operationCode={['system:tool:query:template']}>
                            <UrlCard icon={IconOxygenTemplate} url={'tools/template'}>
                                模板管理
                            </UrlCard>
                        </Permission>
                        <Permission operationCode={['system:tool:query:base']}>
                            <UrlCard icon={IconOxygenBase} url={'tools/base'}>
                                基板管理
                            </UrlCard>
                        </Permission>
                        <Permission operationCode={['system:tool:query:category']}>
                            <UrlCard icon={IconOxygenCategory} url={'tools/category'}>
                                类别管理
                            </UrlCard>
                        </Permission>
                        <Permission path={'/system/user'}>
                            <UrlCard icon={IconOxygenUser} url={'user'}>
                                用户管理
                            </UrlCard>
                        </Permission>
                        <Permission path={'/system/role'}>
                            <UrlCard icon={IconOxygenRole} url={'role'}>
                                角色管理
                            </UrlCard>
                        </Permission>
                        <Permission path={'/system/group'}>
                            <UrlCard icon={IconOxygenGroup} url={'group'}>
                                群组管理
                            </UrlCard>
                        </Permission>
                        <Permission path={'/system/log'}>
                            <UrlCard icon={IconOxygenLog} url={'log'}>
                                系统日志
                            </UrlCard>
                        </Permission>
                    </FlexBox>
                </HideScrollbar>
            </FitFullscreen>
        </>
    )
}

export default System
