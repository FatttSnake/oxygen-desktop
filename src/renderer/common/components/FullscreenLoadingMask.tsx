import Icon from '@ant-design/icons'
import useStyles from '$/assets/css/components/fullscreen-loading-mask.style'
import FitFullscreen from '$/components/FitFullscreen'

const FullscreenLoadingMask = () => {
    const { styles, theme } = useStyles()

    const loadingIcon = (
        <Icon component={IconOxygenLoading} style={{ fontSize: 24, color: theme.colorText }} spin />
    )
    return (
        <FitFullscreen>
            <div className={styles.fullscreenLoadingMask}>
                <AntdSpin indicator={loadingIcon} />
            </div>
        </FitFullscreen>
    )
}

export default FullscreenLoadingMask
