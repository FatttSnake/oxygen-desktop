import { PropsWithChildren, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import styles from '@/assets/css/components/system/statistics-card.module.less'
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
        <Card className={styles.root} style={{ overflow: 'visible' }}>
            <FlexBox className={styles.statisticsCard}>
                <FlexBox direction={'horizontal'} className={styles.head}>
                    <Icon component={props.icon} className={styles.icon} />
                    <div className={styles.title}>{props.title}</div>
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
