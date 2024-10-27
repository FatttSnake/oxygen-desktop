import { PropsWithChildren, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import styles from '@/assets/css/components/system/setting-card.module.less'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'
import Permission from '@/components/common/Permission'
import LoadingMask from '@/components/common/LoadingMask'

interface SettingsCardProps extends PropsWithChildren {
    icon: IconComponent
    title: string
    loading?: boolean
    modifyOperationCode?: string[]
    expand?: ReactNode
    onReset?: () => void
    onSave?: () => void
}
export const SettingsCard = (props: SettingsCardProps) => {
    return (
        <Card className={styles.root}>
            <FlexBox className={styles.settingsCard}>
                <FlexBox direction={'horizontal'} className={styles.head}>
                    <Icon component={props.icon} className={styles.icon} />
                    <div className={styles.title}>{props.title}</div>
                    {!props.loading && (
                        <Permission operationCode={props.modifyOperationCode}>
                            {props.expand}
                            <AntdButton onClick={props.onReset} title={'重置'}>
                                <Icon component={IconOxygenBack} />
                            </AntdButton>
                            <AntdButton
                                className={styles.btSave}
                                onClick={props.onSave}
                                title={'保存'}
                            >
                                <Icon component={IconOxygenSave} />
                            </AntdButton>
                        </Permission>
                    )}
                </FlexBox>
                <LoadingMask
                    maskContent={<AntdSkeleton active paragraph={{ rows: 6 }} />}
                    hidden={!props.loading}
                >
                    {props.children}
                </LoadingMask>
            </FlexBox>
        </Card>
    )
}

export default SettingsCard
