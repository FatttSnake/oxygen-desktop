import useStyles from '@/assets/css/pages/system/statistics/common.style'
import { utcToLocalTime } from '@/util/datetime'
import { r_sys_statistics_software } from '@/services/system'
import FlexBox from '@/components/common/FlexBox'
import StatisticsCard from '@/components/system/StatisticsCard'

const SoftwareInfo = () => {
    const { styles } = useStyles()
    const [softwareInfoData, setSoftwareInfoData] = useState<SoftwareInfoVo>()

    useEffect(() => {
        void r_sys_statistics_software().then((res) => {
            const response = res.data
            if (response.success) {
                response.data && setSoftwareInfoData(response.data)
            } else {
                void message.error('获取软件信息失败，请稍后重试')
            }
        })
    }, [])

    return (
        <StatisticsCard
            icon={IconOxygenSoftware}
            title={'软件信息'}
            loading={softwareInfoData === undefined}
        >
            <FlexBox className={styles.content} direction={'horizontal'}>
                <FlexBox className={styles.key}>
                    <div>操作系统</div>
                    <div>位数</div>
                    <div>Java</div>
                    <div>Java 供应商</div>
                    <div>Runtime</div>
                    <div>JVM</div>
                    <div>JVM 供应商</div>
                    <div>操作系统启动时间</div>
                    <div>后端服务器启动时间</div>
                </FlexBox>
                <FlexBox className={styles.value}>
                    <div title={softwareInfoData?.os}>{softwareInfoData?.os}</div>
                    <div title={softwareInfoData?.bitness.toString()}>
                        {softwareInfoData?.bitness}
                    </div>
                    <div
                        title={`${softwareInfoData?.javaVersion} (${softwareInfoData?.javaVersionDate})`}
                    >{`${softwareInfoData?.javaVersion} (${softwareInfoData?.javaVersionDate})`}</div>
                    <div title={softwareInfoData?.javaVendor}>{softwareInfoData?.javaVendor}</div>
                    <div
                        title={`${softwareInfoData?.javaRuntime} (build ${softwareInfoData?.javaRuntimeVersion})`}
                    >{`${softwareInfoData?.javaRuntime} (build ${softwareInfoData?.javaRuntimeVersion})`}</div>
                    <div
                        title={`${softwareInfoData?.jvm} (build ${softwareInfoData?.jvmVersion}, ${softwareInfoData?.jvmInfo})`}
                    >{`${softwareInfoData?.jvm} (build ${softwareInfoData?.jvmVersion}, ${softwareInfoData?.jvmInfo})`}</div>
                    <div title={softwareInfoData?.jvmVendor}>{softwareInfoData?.jvmVendor}</div>
                    <div>
                        {softwareInfoData?.osBootTime &&
                            utcToLocalTime(softwareInfoData?.osBootTime)}
                    </div>
                    <div>
                        {softwareInfoData?.serverStartupTime &&
                            utcToLocalTime(softwareInfoData.serverStartupTime)}
                    </div>
                </FlexBox>
            </FlexBox>
        </StatisticsCard>
    )
}

export default SoftwareInfo
