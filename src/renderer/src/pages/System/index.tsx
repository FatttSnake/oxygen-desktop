import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import VanillaTilt, { TiltOptions } from 'vanilla-tilt'
import '@/assets/css/pages/system/index.scss'
import HideScrollbar from '@/components/common/HideScrollbar'
import FitFullscreen from '@/components/common/FitFullscreen'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'
import Permission from '@/components/common/Permission'

interface CommonCardProps
    extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    icon: IconComponent
    description?: ReactNode
    options?: TiltOptions
    url?: string
}

const CommonCard = forwardRef<HTMLDivElement, CommonCardProps>(
    ({
        style,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ref,
        icon,
        description,
        options = {
            reverse: true,
            max: 8,
            glare: true,
            scale: 1.03
        },
        url,
        children,
        ...props
    }) => {
        const navigate = useNavigate()
        const cardRef = useRef<HTMLDivElement>(null)

        useEffect(() => {
            cardRef.current && VanillaTilt.init(cardRef.current, options)
        }, [options])

        const handleCardOnClick = () => {
            url && navigate(url)
        }

        return (
            <Card
                style={{ overflow: 'visible', ...style }}
                ref={cardRef}
                {...props}
                onClick={handleCardOnClick}
            >
                <FlexBox className={'common-card'}>
                    <Icon component={icon} className={'icon'} />
                    <div className={'text'}>{children}</div>
                    <div className={'description'}>{description}</div>
                </FlexBox>
            </Card>
        )
    }
)

const System = () => {
    return (
        <>
            <FitFullscreen data-component={'system'}>
                <HideScrollbar isShowVerticalScrollbar autoHideWaitingTime={1000}>
                    <FlexBox direction={'horizontal'} className={'root-content'}>
                        <Permission path={'/system/statistics'}>
                            <CommonCard icon={IconOxygenAnalysis} url={'statistics'}>
                                系统概况
                            </CommonCard>
                        </Permission>
                        <Permission path={'/system/settings'}>
                            <CommonCard icon={IconOxygenOption} url={'settings'}>
                                系统设置
                            </CommonCard>
                        </Permission>
                        <Permission operationCode={['system:tool:query:tool']}>
                            <CommonCard icon={IconOxygenTool} url={'tools'}>
                                工具管理
                            </CommonCard>
                        </Permission>
                        <Permission operationCode={['system:tool:query:template']}>
                            <CommonCard icon={IconOxygenTemplate} url={'tools/template'}>
                                模板管理
                            </CommonCard>
                        </Permission>
                        <Permission operationCode={['system:tool:query:base']}>
                            <CommonCard icon={IconOxygenBase} url={'tools/base'}>
                                基板管理
                            </CommonCard>
                        </Permission>
                        <Permission operationCode={['system:tool:query:category']}>
                            <CommonCard icon={IconOxygenCategory} url={'tools/category'}>
                                类别管理
                            </CommonCard>
                        </Permission>
                        <Permission path={'/system/user'}>
                            <CommonCard icon={IconOxygenUser} url={'user'}>
                                用户管理
                            </CommonCard>
                        </Permission>
                        <Permission path={'/system/role'}>
                            <CommonCard icon={IconOxygenRole} url={'role'}>
                                角色管理
                            </CommonCard>
                        </Permission>
                        <Permission path={'/system/group'}>
                            <CommonCard icon={IconOxygenGroup} url={'group'}>
                                群组管理
                            </CommonCard>
                        </Permission>
                        <Permission path={'/system/log'}>
                            <CommonCard icon={IconOxygenLog} url={'log'}>
                                系统日志
                            </CommonCard>
                        </Permission>
                    </FlexBox>
                </HideScrollbar>
            </FitFullscreen>
        </>
    )
}

export default System
