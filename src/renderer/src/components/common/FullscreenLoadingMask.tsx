import Icon from '@ant-design/icons'
import styles from '@/assets/css/components/common/fullscreen-loading-mask.module.less'
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
                <div className={styles.fullscreenLoadingMask}>
                    <AntdSpin indicator={loadingIcon} />
                </div>
            </FitFullscreen>
        </>
    )
}

export default FullscreenLoadingMask
