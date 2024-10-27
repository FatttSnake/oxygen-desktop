import Icon from '@ant-design/icons'
import '@/assets/css/components/common/fullscreen-loading-mask.less'
import { COLOR_FONT_MAIN } from '@/constants/common.constants'
import FitFullscreen from '@/components/common/FitFullscreen'

const FullscreenLoadingMask = () => {
    const loadingIcon = (
        <>
            <Icon
                component={IconOxygenLoading}
                style={{ fontSize: 24, color: COLOR_FONT_MAIN }}
                spin
            />
        </>
    )
    return (
        <>
            <FitFullscreen>
                <div className={'fullscreen-loading-mask'}>
                    <AntdSpin indicator={loadingIcon} />
                </div>
            </FitFullscreen>
        </>
    )
}

export default FullscreenLoadingMask
