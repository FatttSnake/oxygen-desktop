import { ChangeEvent, KeyboardEvent } from 'react'
import Icon from '@ant-design/icons'
import {
    r_sys_tool_delete,
    r_sys_tool_get,
    r_sys_tool_get_one,
    r_sys_tool_off_shelve,
    r_sys_tool_pass,
    r_sys_tool_reject
} from '@/services/system'
import {
    COLOR_BACKGROUND,
    COLOR_ERROR_SECONDARY,
    COLOR_PRODUCTION,
    DATABASE_DELETE_SUCCESS,
    DATABASE_SELECT_SUCCESS,
    DATABASE_UPDATE_SUCCESS,
    TOOL_NOT_UNDER_REVIEW
} from '@/constants/common.constants'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import compiler from '@/components/Playground/compiler'
import { IImportMap } from '@/components/Playground/shared'
import { base64ToFiles, IMPORT_MAP_FILE_NAME, strToBase64 } from '@/components/Playground/files'
import Permission from '@/components/common/Permission'

const Tools = () => {
    const navigate = useNavigate()
    const [modal, contextHolder] = AntdModal.useModal()
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
    const [toolData, setToolData] = useState<ToolVo[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchType, setSearchType] = useState('ALL')
    const [searchValue, setSearchValue] = useState('')
    const [isUseRegex, setIsUseRegex] = useState(false)
    const [isRegexLegal, setIsRegexLegal] = useState(true)
    const [form] = AntdForm.useForm<{ pass: boolean }>()

    const dataColumns: _ColumnsType<ToolVo> = [
        {
            dataIndex: 'icon',
            title: '图标',
            render: (value) => (
                <AntdAvatar
                    src={
                        <AntdImage
                            preview={{ mask: <Icon component={IconOxygenEye}></Icon> }}
                            src={`data:image/svg+xml;base64,${value}`}
                            alt={'Avatar'}
                        />
                    }
                    style={{ background: COLOR_BACKGROUND }}
                />
            ),
            width: '0',
            align: 'center'
        },
        {
            title: '名称',
            render: (_, record) => (
                <AntdTooltip title={record.description}>{record.name}</AntdTooltip>
            )
        },
        { dataIndex: 'toolId', title: '工具 ID' },
        { dataIndex: 'ver', title: '版本' },
        {
            title: '作者',
            render: (_, record) => `${record.author.userInfo.nickname}(${record.author.username})`
        },
        {
            dataIndex: 'keywords',
            title: '关键词',
            render: (value: string[]) => value.map((item) => <AntdTag>{item}</AntdTag>)
        },
        {
            dataIndex: 'categories',
            title: '类别',
            render: (value: { name: string }[]) =>
                value.map((item) => <AntdTag>{item.name}</AntdTag>)
        },
        {
            dataIndex: 'review',
            title: '状态',
            width: '4em',
            render: (value) => {
                switch (value) {
                    case 'NONE':
                        return <AntdTag>编码</AntdTag>
                    case 'PROCESSING':
                        return <AntdTag color={'purple'}>审核</AntdTag>
                    case 'REJECT':
                        return <AntdTag color={'yellow'}>驳回</AntdTag>
                    case 'PASS':
                        return <AntdTag color={'green'}>通过</AntdTag>
                    default:
                        return <></>
                }
            },
            filters: [
                { text: '编码', value: 'NONE' },
                { text: '审核', value: 'PROCESSING' },
                { text: '驳回', value: 'REJECT' },
                { text: '通过', value: 'PASS' }
            ]
        },
        {
            title: '操作',
            width: '12em',
            align: 'center',
            render: (_, record) => (
                <>
                    <AntdSpace size={'middle'}>
                        <a
                            style={{ color: COLOR_PRODUCTION }}
                            onClick={handleOnViewBtnClick(record)}
                        >
                            查看
                        </a>
                        <Permission operationCode={['system:tool:modify:tool']}>
                            {record.review === 'PROCESSING' && (
                                <a
                                    style={{ color: COLOR_PRODUCTION }}
                                    onClick={handleOnReviewBtnClick(record)}
                                >
                                    审核
                                </a>
                            )}
                            {record.review === 'PASS' && (
                                <a
                                    style={{ color: COLOR_PRODUCTION }}
                                    onClick={handleOnOffShelveBtnClick(record)}
                                >
                                    下架
                                </a>
                            )}
                        </Permission>
                        <Permission operationCode={['system:tool:delete:tool']}>
                            <a
                                style={{ color: COLOR_PRODUCTION }}
                                onClick={handleOnDeleteBtnClick(record)}
                            >
                                删除
                            </a>
                        </Permission>
                    </AntdSpace>{' '}
                </>
            )
        }
    ]

    const handleOnTableChange = (
        pagination: _TablePaginationConfig,
        filters: Record<string, _FilterValue | null>,
        sorter: _SorterResult<ToolVo> | _SorterResult<ToolVo>[]
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
            setToolData([])
        }
    }

    const handleOnViewBtnClick = (value: ToolVo) => {
        return () => {
            navigate(`/system/tools/code/${value.id}`)
        }
    }

    const handleOnReviewBtnClick = (value: ToolVo) => {
        return () => {
            form.setFieldValue('pass', undefined)
            void modal.confirm({
                title: '审核',
                centered: true,
                maskClosable: true,
                footer: (_, { OkBtn, CancelBtn }) => (
                    <>
                        <OkBtn />
                        <CancelBtn />
                    </>
                ),
                content: (
                    <AntdForm form={form}>
                        <AntdForm.Item
                            name={'pass'}
                            style={{ marginTop: 10 }}
                            rules={[{ required: true }]}
                        >
                            <AntdRadio.Group>
                                <AntdRadio value={true}>通过</AntdRadio>
                                <AntdRadio value={false}>驳回</AntdRadio>
                            </AntdRadio.Group>
                        </AntdForm.Item>
                    </AntdForm>
                ),
                onOk: () =>
                    form.validateFields().then(() => {
                        return new Promise<void>((resolve) => {
                            switch (form.getFieldValue('pass')) {
                                case true:
                                    void message.loading({
                                        content: '加载工具中……',
                                        key: 'LOADING_TOOL',
                                        duration: 0
                                    })
                                    void r_sys_tool_get_one(value.id)
                                        .then((res) => {
                                            message.destroy('LOADING_TOOL')
                                            const response = res.data
                                            switch (response.code) {
                                                case DATABASE_SELECT_SUCCESS:
                                                    void message.loading({
                                                        content: '编译中……',
                                                        key: 'COMPILING',
                                                        duration: 0
                                                    })
                                                    try {
                                                        const toolVo = response.data!
                                                        const files = base64ToFiles(
                                                            toolVo.source.data!
                                                        )
                                                        const importMap = JSON.parse(
                                                            files[IMPORT_MAP_FILE_NAME].value
                                                        ) as IImportMap
                                                        void compiler
                                                            .compile(
                                                                files,
                                                                importMap,
                                                                toolVo.entryPoint
                                                            )
                                                            .then((result) => {
                                                                message.destroy('COMPILING')
                                                                void message.loading({
                                                                    content: '发布中……',
                                                                    key: 'UPLOADING',
                                                                    duration: 0
                                                                })
                                                                void r_sys_tool_pass(value.id, {
                                                                    dist: strToBase64(
                                                                        result.outputFiles[0].text
                                                                    )
                                                                })
                                                                    .then((res) => {
                                                                        message.destroy('UPLOADING')
                                                                        const response = res.data
                                                                        switch (response.code) {
                                                                            case DATABASE_UPDATE_SUCCESS:
                                                                                void message.success(
                                                                                    '发布成功'
                                                                                )
                                                                                getTool()
                                                                                break
                                                                            case TOOL_NOT_UNDER_REVIEW:
                                                                                void message.warning(
                                                                                    '工具处于非审核状态'
                                                                                )
                                                                                break
                                                                            default:
                                                                                void message.error(
                                                                                    '发布失败，请稍后重试'
                                                                                )
                                                                        }
                                                                    })
                                                                    .catch(() => {
                                                                        message.destroy('UPLOADING')
                                                                    })
                                                                    .finally(() => {
                                                                        resolve()
                                                                    })
                                                            })
                                                    } catch (e) {
                                                        resolve()
                                                        message.destroy('COMPILING')
                                                        void message.error(
                                                            '编译失败，请检查代码后重试'
                                                        )
                                                    }
                                                    break
                                                default:
                                                    resolve()
                                                    void message.error('加载工具失败，稍后重试')
                                            }
                                        })
                                        .catch(() => {
                                            message.destroy('LOADING_TOOL')
                                            resolve()
                                        })
                                    break
                                default:
                                    void r_sys_tool_reject(value.id)
                                        .then((res) => {
                                            const response = res.data
                                            switch (response.code) {
                                                case DATABASE_UPDATE_SUCCESS:
                                                    void message.success('更新成功')
                                                    resolve()
                                                    break
                                                case TOOL_NOT_UNDER_REVIEW:
                                                    void message.warning('工具处于非审核状态')
                                                    resolve()
                                                    break
                                                default:
                                                    void message.error('更新失败，请稍后重试')
                                                    resolve()
                                            }
                                        })
                                        .finally(() => {
                                            getTool()
                                        })
                            }
                        })
                    })
            })
        }
    }

    const handleOnOffShelveBtnClick = (value: ToolVo) => {
        return () => {
            modal
                .confirm({
                    title: '确定下架',
                    maskClosable: true,
                    content: `确定下架工具 ${value.author.username}:${value.toolId}:${value.ver} 吗？`
                })
                .then(
                    (confirmed) => {
                        if (confirmed) {
                            setIsLoading(true)

                            void r_sys_tool_off_shelve(value.id)
                                .then((res) => {
                                    const response = res.data
                                    if (response.code === DATABASE_UPDATE_SUCCESS) {
                                        void message.success('下架成功')
                                        setTimeout(() => {
                                            getTool()
                                        })
                                    } else {
                                        void message.error('下架失败，请稍后重试')
                                    }
                                })
                                .finally(() => {
                                    setIsLoading(false)
                                })
                        }
                    },
                    () => {}
                )
        }
    }

    const handleOnDeleteBtnClick = (value: ToolVo) => {
        return () => {
            modal
                .confirm({
                    title: '确定删除',
                    maskClosable: true,
                    content: `确定删除工具 ${value.author.username}:${value.toolId}:${value.ver} 吗？`
                })
                .then(
                    (confirmed) => {
                        if (confirmed) {
                            setIsLoading(true)

                            void r_sys_tool_delete(value.id)
                                .then((res) => {
                                    const response = res.data
                                    if (response.code === DATABASE_DELETE_SUCCESS) {
                                        void message.success('删除成功')
                                        setTimeout(() => {
                                            getTool()
                                        })
                                    } else {
                                        void message.error('删除失败，请稍后重试')
                                    }
                                })
                                .finally(() => {
                                    setIsLoading(false)
                                })
                        }
                    },
                    () => {}
                )
        }
    }

    const handleOnSearchValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)

        if (isUseRegex) {
            try {
                RegExp(e.target.value)
                setIsRegexLegal(!(e.target.value.includes('{}') || e.target.value.includes('[]')))
            } catch (e) {
                setIsRegexLegal(false)
            }
        } else {
            setIsRegexLegal(true)
        }
    }

    const handleOnSearchValueKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            getTool()
        }
    }

    const handleOnSearchTypeChange = (value: string) => {
        setSearchType(value)
    }

    const handleOnUseRegexChange = (e: _CheckboxChangeEvent) => {
        setIsUseRegex(e.target.checked)
        if (e.target.checked) {
            try {
                RegExp(searchValue)
                setIsRegexLegal(!(searchValue.includes('{}') || searchValue.includes('[]')))
            } catch (e) {
                setIsRegexLegal(false)
            }
        } else {
            setIsRegexLegal(true)
        }
    }

    const handleOnQueryBtnClick = () => {
        getTool()
    }

    const getTool = () => {
        if (isLoading) {
            return
        }

        if (!isRegexLegal) {
            void message.error('非法正则表达式')
            return
        }
        setIsLoading(true)

        void r_sys_tool_get({
            currentPage: tableParams.pagination?.current,
            pageSize: tableParams.pagination?.pageSize,
            sortField:
                tableParams.sortField && tableParams.sortOrder
                    ? (tableParams.sortField as string)
                    : undefined,
            sortOrder:
                tableParams.sortField && tableParams.sortOrder ? tableParams.sortOrder : undefined,
            searchType,
            searchValue: searchValue.trim().length ? searchValue : undefined,
            searchRegex: isUseRegex ? isUseRegex : undefined,
            ...tableParams.filters
        })
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        setToolData(response.data!.records)
                        setTableParams({
                            ...tableParams,
                            pagination: {
                                ...tableParams.pagination,
                                total: response.data!.total
                            }
                        })
                        break
                    default:
                        void message.error('获取失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        getTool()
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
                        <AntdSelect
                            value={searchType}
                            onChange={handleOnSearchTypeChange}
                            style={{ width: '6em' }}
                            dropdownStyle={{ textAlign: 'center' }}
                        >
                            <AntdSelect.Option value={'ALL'}>全部</AntdSelect.Option>
                            <AntdSelect.Option value={'NAME'}>名称</AntdSelect.Option>
                            <AntdSelect.Option value={'TOOL_ID'}>工具 ID</AntdSelect.Option>
                            <AntdSelect.Option value={'NICKNAME'}>昵称</AntdSelect.Option>
                            <AntdSelect.Option value={'USERNAME'}>用户名</AntdSelect.Option>
                            <AntdSelect.Option value={'KEYWORD'}>关键词</AntdSelect.Option>
                        </AntdSelect>
                    }
                    suffix={
                        <>
                            {!isRegexLegal && (
                                <span style={{ color: COLOR_ERROR_SECONDARY }}>非法表达式</span>
                            )}
                            <AntdCheckbox checked={isUseRegex} onChange={handleOnUseRegexChange}>
                                <AntdTooltip title={'正则表达式'}>.*</AntdTooltip>
                            </AntdCheckbox>
                        </>
                    }
                    allowClear
                    value={searchValue}
                    onChange={handleOnSearchValueChange}
                    onKeyDown={handleOnSearchValueKeyDown}
                    status={isRegexLegal ? undefined : 'error'}
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
                dataSource={toolData}
                columns={dataColumns}
                pagination={tableParams.pagination}
                loading={isLoading}
                onChange={handleOnTableChange}
            />
        </Card>
    )

    return (
        <>
            <FitFullscreen>
                <HideScrollbar
                    style={{ padding: 20 }}
                    isShowVerticalScrollbar
                    autoHideWaitingTime={1000}
                >
                    <FlexBox gap={20}>
                        {toolbar}
                        {table}
                    </FlexBox>
                </HideScrollbar>
            </FitFullscreen>
            {contextHolder}
        </>
    )
}

export default Tools
