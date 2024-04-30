import Icon from '@ant-design/icons'
import * as echarts from 'echarts/core'
import { getTimesBetweenTwoTimes } from '@/util/datetime'
import { r_sys_statistics_online } from '@/services/system'
import FlexBox from '@/components/common/FlexBox'
import { getTooltipTimeFormatter, lineEChartsBaseOption } from '@/pages/System/Statistics/shared'
import StatisticsCard from '@/components/system/StatisticsCard'

const OnlineInfo = () => {
    const onlineInfoDivRef = useRef<HTMLDivElement>(null)
    const onlineInfoEChartsRef = useRef<echarts.EChartsType | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [currentOnlineCount, setCurrentOnlineCount] = useState(-1)
    const [scope, setScope] = useState('WEEK')

    useEffect(() => {
        const chartResizeObserver = new ResizeObserver(() => {
            onlineInfoEChartsRef.current?.resize()
        })

        onlineInfoDivRef.current && chartResizeObserver.observe(onlineInfoDivRef.current)

        return () => {
            onlineInfoDivRef.current && chartResizeObserver.unobserve(onlineInfoDivRef.current)
        }
    }, [isLoading])

    useEffect(() => {
        getOnlineInfo()
    }, [])

    const handleOnScopeChange = (value: string) => {
        setScope(value)
        getOnlineInfo(value)
    }

    const handleOnRefresh = () => {
        getOnlineInfo()
    }

    const getOnlineInfo = (_scope: string = scope) => {
        if (isLoading) {
            return
        }

        setIsLoading(true)
        setCurrentOnlineCount(-1)

        void r_sys_statistics_online({ scope: _scope }).then((res) => {
            const response = res.data
            if (response.success) {
                const data = response.data
                if (data) {
                    setIsLoading(false)

                    setCurrentOnlineCount(data.current)

                    setTimeout(() => {
                        const dataList = getTimesBetweenTwoTimes(
                            data.history[0].time,
                            data.history[data.history.length - 1].time,
                            _scope === 'DAY'
                                ? 'minute'
                                : _scope === 'WEEK'
                                  ? 'minute'
                                  : _scope === 'MONTH'
                                    ? 'hour'
                                    : 'day'
                        ).map((time) => {
                            const records = data.history
                                .filter(
                                    (value) =>
                                        value.time.substring(
                                            0,
                                            _scope === 'DAY'
                                                ? 16
                                                : _scope === 'WEEK'
                                                  ? 16
                                                  : _scope === 'MONTH'
                                                    ? 13
                                                    : 10
                                        ) ===
                                        time.substring(
                                            0,
                                            _scope === 'DAY'
                                                ? 16
                                                : _scope === 'WEEK'
                                                  ? 16
                                                  : _scope === 'MONTH'
                                                    ? 13
                                                    : 10
                                        )
                                )
                                .map((item) => Number(item.record))
                            return [
                                time.substring(
                                    0,
                                    _scope === 'DAY'
                                        ? 16
                                        : _scope === 'WEEK'
                                          ? 16
                                          : _scope === 'MONTH'
                                            ? 13
                                            : 10
                                ),
                                records.length ? Math.max(...records) : 0
                            ]
                        })

                        onlineInfoEChartsRef.current = echarts.init(
                            onlineInfoDivRef.current,
                            null,
                            { renderer: 'svg' }
                        )

                        onlineInfoEChartsRef.current?.setOption({
                            ...lineEChartsBaseOption,
                            tooltip: {
                                ...lineEChartsBaseOption.tooltip,
                                formatter: getTooltipTimeFormatter(
                                    _scope === 'DAY'
                                        ? 'yyyy-MM-DD HH:mm'
                                        : _scope === 'WEEK'
                                          ? 'yyyy-MM-DD HH:mm'
                                          : _scope === 'MONTH'
                                            ? 'yyyy-MM-DD HH时'
                                            : 'yyyy-MM-DD'
                                )
                            },
                            xAxis: {
                                ...lineEChartsBaseOption.xAxis
                            },
                            series: [
                                {
                                    name: '在线人数',
                                    type: 'line',
                                    smooth: true,
                                    symbol: 'none',
                                    areaStyle: {},
                                    data: dataList
                                }
                            ]
                        })
                    })
                }
            }
        })
    }

    return (
        <StatisticsCard
            icon={IconOxygenOnline}
            title={
                <>
                    <FlexBox gap={10} direction={'horizontal'}>
                        <span style={{ whiteSpace: 'nowrap' }}>在线用户</span>
                        <AntdTag>
                            {currentOnlineCount === -1 ? '获取中...' : `当前 ${currentOnlineCount}`}
                        </AntdTag>
                    </FlexBox>
                </>
            }
            loading={isLoading}
            expand={
                <>
                    <AntdSelect
                        value={scope}
                        onChange={handleOnScopeChange}
                        disabled={isLoading}
                        style={{ width: '8em' }}
                    >
                        <AntdSelect.Option key={'DAY'}>最近24小时</AntdSelect.Option>
                        <AntdSelect.Option key={'WEEK'}>最近7天</AntdSelect.Option>
                        <AntdSelect.Option key={'MONTH'}>最近30天</AntdSelect.Option>
                        <AntdSelect.Option key={'QUARTER'}>最近3个月</AntdSelect.Option>
                        <AntdSelect.Option key={'YEAR'}>最近12个月</AntdSelect.Option>
                        <AntdSelect.Option key={'TWO_YEARS'}>最近2年</AntdSelect.Option>
                        <AntdSelect.Option key={'THREE_YEARS'}>最近3年</AntdSelect.Option>
                        <AntdSelect.Option key={'FIVE_YEARS'}>最近5年</AntdSelect.Option>
                        <AntdSelect.Option key={'ALL'}>全部</AntdSelect.Option>
                    </AntdSelect>
                    <AntdButton title={'刷新'} onClick={handleOnRefresh} disabled={isLoading}>
                        <Icon component={IconOxygenRefresh} />
                    </AntdButton>
                </>
            }
        >
            <FlexBox className={'card-content'} direction={'horizontal'}>
                <div className={'big-chart'} ref={onlineInfoDivRef} />
            </FlexBox>
        </StatisticsCard>
    )
}

export default OnlineInfo
