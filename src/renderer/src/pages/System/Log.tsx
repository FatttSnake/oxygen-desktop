import { ChangeEvent, KeyboardEvent } from 'react'
import dayjs from 'dayjs'
import { COLOR_FONT_SECONDARY, DATABASE_SELECT_SUCCESS } from '@/constants/common.constants'
import { dayjsToUtc, utcToLocalTime } from '@/util/datetime'
import { r_sys_log_get } from '@/services/system'
import FitFullscreen from '@/components/common/FitFullscreen'
import Card from '@/components/common/Card'
import HideScrollbar from '@/components/common/HideScrollbar'
import FlexBox from '@/components/common/FlexBox'

const Log = () => {
    const [logData, setLogData] = useState<SysLogGetVo[]>([])
    const [loading, setLoading] = useState(false)
    const [tableParams, setTableParams] = useState<TableParam>({
        pagination: {
            current: 1,
            pageSize: 20,
            position: ['bottomCenter'],
            showTotal: (total, range) =>
                `第 ${
                    range[0] === range[1] ? `${range[0]}` : `${range[0]}~${range[1]}`
                } 项 共 ${total} 项`
        }
    })
    const [searchRequestUrl, setSearchRequestUrl] = useState('')
    const [timeRange, setTimeRange] = useState<[string, string]>()

    const dataColumns: _ColumnsType<SysLogGetVo> = [
        {
            title: '类型',
            dataIndex: 'logType',
            render: (value) =>
                value === 'ERROR' ? (
                    <AntdTag color={'error'}>{value}</AntdTag>
                ) : (
                    <AntdTag>{value}</AntdTag>
                ),
            align: 'center',
            filters: [
                { text: 'Info', value: 'INFO' },
                { text: 'Login', value: 'LOGIN' },
                { text: 'Logout', value: 'LOGOUT' },
                { text: 'Register', value: 'Register' },
                { text: 'Statistics', value: 'STATISTICS' },
                { text: 'API', value: 'API' },
                { text: 'Error', value: 'ERROR' }
            ]
        },
        {
            title: '操作者',
            dataIndex: 'operateUsername',
            align: 'center',
            render: (value, record) =>
                value ? (
                    <AntdTag color={'purple'}>{`${value}(${record.operateUserId})`}</AntdTag>
                ) : (
                    <AntdTag>Anonymous</AntdTag>
                )
        },
        {
            title: '请求方式',
            dataIndex: 'requestMethod',
            align: 'center',
            filters: [
                { text: 'GET', value: 'GET' },
                { text: 'POST', value: 'POST' },
                { text: 'PUT', value: 'PUT' },
                { text: 'PATCH', value: 'PATCH' },
                { text: 'DELETE', value: 'DELETE' },
                { text: 'HEAD', value: 'HEAD' },
                { text: 'OPTIONS', value: 'OPTIONS' }
            ]
        },
        {
            title: '请求 Url',
            render: (_value, record) =>
                `${record.requestServerAddress}${record.requestUri}${
                    record.requestParams ? `?${record.requestParams}` : ''
                }`,
            onCell: () => ({
                style: {
                    wordBreak: 'break-word'
                }
            })
        },
        {
            title: '请求 IP',
            dataIndex: 'requestIp',
            align: 'center'
        },
        {
            title: '开始时间',
            dataIndex: 'startTime',
            render: (value: string) => utcToLocalTime(value),
            align: 'center',
            sorter: true
        },
        {
            title: '执行时间',
            dataIndex: 'executeTime',
            render: (value, record) => (
                <AntdTooltip
                    title={`${utcToLocalTime(record.startTime)} ~ ${utcToLocalTime(
                        record.endTime
                    )}`}
                >
                    {`${value}ms`}
                </AntdTooltip>
            ),
            align: 'center',
            sorter: true
        },
        {
            title: '异常',
            dataIndex: 'exception',
            render: (value: boolean, record) => (value ? record.exceptionInfo : '无'),
            align: 'center',
            onCell: () => ({
                style: {
                    wordBreak: 'break-word'
                }
            })
        },
        {
            title: '用户代理',
            dataIndex: 'userAgent',
            onCell: () => ({
                style: {
                    wordBreak: 'break-word'
                }
            })
        }
    ]

    const handleOnTableChange = (
        pagination: _TablePaginationConfig,
        filters: Record<string, _FilterValue | null>,
        sorter: _SorterResult<SysLogGetVo> | _SorterResult<SysLogGetVo>[]
    ) => {
        pagination = { ...tableParams.pagination, ...pagination }
        if (Array.isArray(sorter)) {
            setTableParams({
                pagination,
                filters,
                sortField: sorter.map((value) => value.field).join(',')
            })
        } else {
            setTableParams({
                pagination,
                filters,
                sortField: sorter.field,
                sortOrder: sorter.order
            })
        }

        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setLogData([])
        }
    }

    const handleOnSearchUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchRequestUrl(e.target.value)
    }

    const handleOnSearchUrlKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            getLog()
        }
    }

    const handleOnDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            setTimeRange([dayjsToUtc(dates[0]), dayjsToUtc(dates[1])])
        } else {
            setTimeRange(undefined)
        }
    }

    const handleOnQueryBtnClick = () => {
        getLog()
    }

    const getLog = () => {
        if (loading) {
            return
        }

        setLoading(true)

        void r_sys_log_get({
            currentPage: tableParams.pagination?.current,
            pageSize: tableParams.pagination?.pageSize,
            sortField:
                tableParams.sortField && tableParams.sortOrder
                    ? (tableParams.sortField as string)
                    : undefined,
            sortOrder:
                tableParams.sortField && tableParams.sortOrder ? tableParams.sortOrder : undefined,
            searchRequestUrl: searchRequestUrl.trim().length ? searchRequestUrl : undefined,
            searchStartTime: timeRange && timeRange[0],
            searchEndTime: timeRange && timeRange[1],
            ...tableParams.filters
        })
            .then((res) => {
                const response = res.data
                if (response.code === DATABASE_SELECT_SUCCESS) {
                    response.data && setLogData(response.data.records)
                    response.data &&
                        setTableParams({
                            ...tableParams,
                            pagination: {
                                ...tableParams.pagination,
                                total: response.data.total
                            }
                        })
                } else {
                    void message.error('获取失败，请稍后重试')
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        getLog()
    }, [
        JSON.stringify(tableParams.filters),
        JSON.stringify(tableParams.sortField),
        JSON.stringify(tableParams.sortOrder),
        JSON.stringify(tableParams.pagination?.pageSize),
        JSON.stringify(tableParams.pagination?.current)
    ])

    const toolbar = (
        <FlexBox direction={'horizontal'} gap={10}>
            <Card style={{ overflow: 'inherit' }}>
                <AntdInput
                    addonBefore={
                        <span
                            style={{
                                fontSize: '0.9em',
                                color: COLOR_FONT_SECONDARY
                            }}
                        >
                            请求 Url
                        </span>
                    }
                    allowClear
                    value={searchRequestUrl}
                    onChange={handleOnSearchUrlChange}
                    onKeyDown={handleOnSearchUrlKeyDown}
                />
            </Card>
            <Card style={{ overflow: 'inherit', flex: '0 0 auto' }}>
                <AntdDatePicker.RangePicker
                    showTime
                    allowClear
                    changeOnBlur
                    onChange={handleOnDateRangeChange}
                />
            </Card>
            <Card style={{ overflow: 'inherit', flex: '0 0 auto' }}>
                <AntdButton onClick={handleOnQueryBtnClick} type={'primary'}>
                    查询
                </AntdButton>
            </Card>
        </FlexBox>
    )

    const table = (
        <Card>
            <AntdTable
                dataSource={logData}
                columns={dataColumns}
                rowKey={(record) => record.id}
                pagination={tableParams.pagination}
                loading={loading}
                onChange={handleOnTableChange}
            />
        </Card>
    )

    return (
        <>
            <FitFullscreen>
                <HideScrollbar
                    style={{ padding: 30 }}
                    isShowVerticalScrollbar
                    autoHideWaitingTime={1000}
                >
                    <FlexBox gap={20}>
                        {toolbar}
                        {table}
                    </FlexBox>
                </HideScrollbar>
            </FitFullscreen>
        </>
    )
}

export default Log
