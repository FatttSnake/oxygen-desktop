import { PropsWithChildren, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import '@/assets/css/components/system/statistics-card.scss'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'
import LoadingMask from '@/components/common/LoadingMask'

interface StatisticsCardProps extends PropsWithChildren {
    icon: IconComponent
    title: ReactNode
    loading?: boolean
    expand?: ReactNode
}

export const StatisticsCard = (props: StatisticsCardProps) => {
    return (
        <Card data-component={'component-statistics-card'} style={{ overflow: 'visible' }}>
            <FlexBox className={'statistics-card'}>
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

export default StatisticsCard
