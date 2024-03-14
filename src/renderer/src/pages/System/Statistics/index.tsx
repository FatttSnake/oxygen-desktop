import { PropsWithChildren, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import '@/assets/css/pages/system/statistics.scss'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import LoadingMask from '@/components/common/LoadingMask'
import Permission from '@/components/common/Permission'
import OnlineInfo from '@/pages/System/Statistics/OnlineInfo'
import ActiveInfo from '@/pages/System/Statistics/ActiveInfo'
import SoftwareInfo from '@/pages/System/Statistics/SoftwareInfo'
import HardwareInfo from '@/pages/System/Statistics/HardwareInfo'
import CPUInfo from '@/pages/System/Statistics/CPUInfo'
import StorageInfo from '@/pages/System/Statistics/StorageInfo'

interface CommonCardProps extends PropsWithChildren {
    icon: IconComponent
    title: ReactNode
    loading?: boolean
    expand?: ReactNode
}

export const CommonCard = (props: CommonCardProps) => {
    return (
        <Card style={{ overflow: 'visible' }}>
            <FlexBox className={'common-card'}>
                <FlexBox direction={'horizontal'} className={'head'}>
                    <Icon component={props.icon} className={'icon'} />
                    <div className={'title'}>{props.title}</div>
                    {props.expand}
                </FlexBox>
                <LoadingMask
                    hidden={!props.loading}
                    maskContent={<AntdSkeleton active paragraph={{ rows: 6 }} />}
                >
                    {props.children}
                </LoadingMask>
            </FlexBox>
        </Card>
    )
}

const Statistics = () => {
    return (
        <>
            <FitFullscreen data-component={'system-statistics'}>
                <HideScrollbar isShowVerticalScrollbar autoHideWaitingTime={1000}>
                    <FlexBox direction={'horizontal'} className={'root-content'}>
                        <Permission operationCode={['system:statistics:query:usage']}>
                            <OnlineInfo />
                            <ActiveInfo />
                        </Permission>
                        <Permission operationCode={['system:statistics:query:base']}>
                            <HardwareInfo />
                            <SoftwareInfo />
                        </Permission>
                        <Permission operationCode={['system:statistics:query:real']}>
                            <CPUInfo />
                            <StorageInfo />
                        </Permission>
                    </FlexBox>
                </HideScrollbar>
            </FitFullscreen>
        </>
    )
}

export default Statistics
