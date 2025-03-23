import useStyles from '%/assets/css/pages/system/statistics/index.style'
import FlexBox from '$/components/FlexBox'
import FitFullscreen from '$/components/FitFullscreen'
import HideScrollbar from '$/components/HideScrollbar'
import Permission from '$/components/Permission'
import OnlineInfo from '%/pages/system/Statistics/OnlineInfo'
import ActiveInfo from '%/pages/system/Statistics/ActiveInfo'
import SoftwareInfo from '%/pages/system/Statistics/SoftwareInfo'
import HardwareInfo from '%/pages/system/Statistics/HardwareInfo'
import CPUInfo from '%/pages/system/Statistics/CPUInfo'
import StorageInfo from '%/pages/system/Statistics/StorageInfo'

const Statistics = () => {
    const { styles } = useStyles()

    return (
        <FitFullscreen>
            <HideScrollbar isShowVerticalScrollbar autoHideWaitingTime={1000}>
                <FlexBox direction={'horizontal'} className={styles.root}>
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
    )
}

export default Statistics
