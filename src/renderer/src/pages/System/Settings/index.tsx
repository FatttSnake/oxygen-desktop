import '@/assets/css/pages/system/settings.less'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'
import Permission from '@/components/common/Permission'
import Base from '@/pages/System/Settings/Base'
import Mail from '@/pages/System/Settings/Mail'
import SensitiveWord from '@/pages/System/Settings/SensitiveWord'
import TwoFactor from '@/pages/System/Settings/TwoFactor'

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
