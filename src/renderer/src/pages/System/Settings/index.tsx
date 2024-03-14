import { PropsWithChildren, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import '@/assets/css/pages/system/settings.scss'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'
import LoadingMask from '@/components/common/LoadingMask'
import Permission from '@/components/common/Permission'
import Base from '@/pages/System/Settings/Base'
import Mail from '@/pages/System/Settings/Mail'
import SensitiveWord from '@/pages/System/Settings/SensitiveWord'
import TwoFactor from '@/pages/System/Settings/TwoFactor.tsx'

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
        <Card>
            <FlexBox className={'settings-card'}>
                <FlexBox direction={'horizontal'} className={'head'}>
                    <Icon component={props.icon} className={'icon'} />
                    <div className={'title'}>{props.title}</div>
                    {!props.loading && (
                        <Permission operationCode={props.modifyOperationCode}>
                            {props.expand}
                            <AntdButton onClick={props.onReset} title={'重置'}>
                                <Icon component={IconOxygenBack} />
                            </AntdButton>
                            <AntdButton className={'bt-save'} onClick={props.onSave} title={'保存'}>
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

const Settings = () => {
    return (
        <>
            <FitFullscreen data-component={'system-settings'}>
                <HideScrollbar isShowVerticalScrollbar autoHideWaitingTime={1000}>
                    <FlexBox direction={'horizontal'} className={'root-content'}>
                        <FlexBox className={'root-col'}>
                            <Permission operationCode={['system:settings:query:base']}>
                                <Base />
                            </Permission>
                            <Permission operationCode={['system:settings:query:sensitive']}>
                                <SensitiveWord />
                            </Permission>
                        </FlexBox>
                        <FlexBox className={'root-col'}>
                            <Permission operationCode={['system:settings:query:mail']}>
                                <Mail />
                            </Permission>
                            <Permission operationCode={['system:settings:query:two-factor']}>
                                <TwoFactor />
                            </Permission>
                        </FlexBox>
                    </FlexBox>
                </HideScrollbar>
            </FitFullscreen>
        </>
    )
}

export default Settings
