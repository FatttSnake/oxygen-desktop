import '@/assets/css/pages/system/index.scss'
import HideScrollbar from '@/components/common/HideScrollbar'
import FitFullscreen from '@/components/common/FitFullscreen'
import FlexBox from '@/components/common/FlexBox'
import Permission from '@/components/common/Permission'
import SystemCard from '@/components/system/SystemCard.tsx'

const System = () => {
    return (
        <>
            <FitFullscreen data-component={'system'}>
                <HideScrollbar isShowVerticalScrollbar autoHideWaitingTime={1000}>
                    <FlexBox direction={'horizontal'} className={'root-content'}>
                        <Permission path={'/system/statistics'}>
                            <SystemCard icon={IconOxygenAnalysis} url={'statistics'}>
                                系统概况
                            </SystemCard>
                        </Permission>
                        <Permission path={'/system/settings'}>
                            <SystemCard icon={IconOxygenOption} url={'settings'}>
                                系统设置
                            </SystemCard>
                        </Permission>
                        <Permission operationCode={['system:tool:query:tool']}>
                            <SystemCard icon={IconOxygenTool} url={'tools'}>
                                工具管理
                            </SystemCard>
                        </Permission>
                        <Permission operationCode={['system:tool:query:template']}>
                            <SystemCard icon={IconOxygenTemplate} url={'tools/template'}>
                                模板管理
                            </SystemCard>
                        </Permission>
                        <Permission operationCode={['system:tool:query:base']}>
                            <SystemCard icon={IconOxygenBase} url={'tools/base'}>
                                基板管理
                            </SystemCard>
                        </Permission>
                        <Permission operationCode={['system:tool:query:category']}>
                            <SystemCard icon={IconOxygenCategory} url={'tools/category'}>
                                类别管理
                            </SystemCard>
                        </Permission>
                        <Permission path={'/system/user'}>
                            <SystemCard icon={IconOxygenUser} url={'user'}>
                                用户管理
                            </SystemCard>
                        </Permission>
                        <Permission path={'/system/role'}>
                            <SystemCard icon={IconOxygenRole} url={'role'}>
                                角色管理
                            </SystemCard>
                        </Permission>
                        <Permission path={'/system/group'}>
                            <SystemCard icon={IconOxygenGroup} url={'group'}>
                                群组管理
                            </SystemCard>
                        </Permission>
                        <Permission path={'/system/log'}>
                            <SystemCard icon={IconOxygenLog} url={'log'}>
                                系统日志
                            </SystemCard>
                        </Permission>
                    </FlexBox>
                </HideScrollbar>
            </FitFullscreen>
        </>
    )
}

export default System
