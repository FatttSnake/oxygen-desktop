import { MouseEvent } from 'react'
import useStyles from '%/assets/css/pages/system/tools/base.style'
import {
    DATABASE_DELETE_SUCCESS,
    DATABASE_DUPLICATE_KEY,
    DATABASE_INSERT_SUCCESS,
    DATABASE_SELECT_SUCCESS,
    DATABASE_UPDATE_SUCCESS
} from '$/constants/common.constants'
import { checkDesktop, message, modal } from '$/util/common'
import { utcToLocalTime } from '$/util/datetime'
import { navigateToToolBaseEditor } from '$/util/navigation'
import { formatToolBaseVersion } from '$/util/tool'
import {
    r_sys_tool_base_add,
    r_sys_tool_base_delete,
    r_sys_tool_base_get,
    r_sys_tool_base_update
} from '$/services/system'
import FitFullscreen from '$/components/FitFullscreen'
import FlexBox from '$/components/FlexBox'
import HideScrollbar from '$/components/HideScrollbar'
import Card from '$/components/Card'
import Permission from '$/components/Permission'

const { Link } = AntdTypography

const Base = () => {
    const { styles } = useStyles()
    const navigate = useNavigate()
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
    const [addForm] = AntdForm.useForm<ToolBaseAddParam>()
    const addFormValues = AntdForm.useWatch([], addForm)
    const [editForm] = AntdForm.useForm<ToolBaseUpdateParam>()
    const editFormValues = AntdForm.useWatch([], editForm)
    const [isLoading, setIsLoading] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isDrawerEdit, setIsDrawerEdit] = useState(false)
    const [isSubmittable, setIsSubmittable] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [baseData, setBaseData] = useState<ToolBaseWithVersionsVo[]>([])

    const handleOnTableChange = (
        pagination: _TablePaginationConfig,
        filters: Record<string, _FilterValue | null>,
        sorter: _SorterResult<ToolBaseWithVersionsVo> | _SorterResult<ToolBaseWithVersionsVo>[]
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
            setBaseData([])
        }
    }

    const handleOnRowClick = (id: string) => {
        return () => {
            if (!checkDesktop() && baseData.find((item) => item.id === id)?.platform !== 'WEB') {
                void message.warning('此基板需要桌面端环境，请在桌面端编辑')
                return
            }

            navigateToToolBaseEditor(navigate, id)
        }
    }

    const handleOnVersionClick = (id: string, version: string) => {
        navigateToToolBaseEditor(navigate, id, version)
    }

    const handleOnAddBtnClick = () => {
        setIsDrawerEdit(false)
        setIsDrawerOpen(true)
    }

    const baseColumns: _ColumnsType<ToolBaseWithVersionsVo> = [
        {
            title: '名称',
            dataIndex: 'name'
        },
        {
            title: '平台',
            dataIndex: 'platform',
            width: '8em',
            align: 'center',
            render: (value: string) => `${value.slice(0, 1)}${value.slice(1).toLowerCase()}`,
            filters: [
                { text: 'Web', value: 'WEB' },
                { text: 'Desktop', value: 'DESKTOP' },
                { text: 'Android', value: 'ANDROID' }
            ]
        },
        {
            title: '版本',
            dataIndex: 'versions',
            width: '10em',
            align: 'center',
            render: (versions: number[], { id }) =>
                versions.length ? (
                    <AntdDropdown
                        menu={{
                            items: versions.map((version, index) => ({
                                key: version,
                                label: (
                                    <>
                                        <AntdTag
                                            color={index === 0 ? 'success' : 'default'}
                                            style={{ marginInlineEnd: 0 }}
                                        >
                                            {formatToolBaseVersion(version)}
                                        </AntdTag>
                                    </>
                                )
                            })),
                            onClick: ({ key, domEvent }) => {
                                domEvent.stopPropagation()
                                handleOnVersionClick(id, key)
                            }
                        }}
                    >
                        <span>{formatToolBaseVersion(versions[0])}</span>
                    </AntdDropdown>
                ) : (
                    '未编译'
                )
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            width: '15em',
            align: 'center',
            render: (value: string) => utcToLocalTime(value)
        },
        {
            title: '修改时间',
            dataIndex: 'updateTime',
            width: '15em',
            align: 'center',
            render: (value: string) => utcToLocalTime(value)
        },
        {
            title: (
                <AntdSpace style={{ textWrap: 'nowrap' }}>
                    操作
                    <Permission operationCode={['system:tool:add:base']}>
                        (<Link onClick={handleOnAddBtnClick}>新增</Link>)
                    </Permission>
                </AntdSpace>
            ),
            width: '14em',
            align: 'center',
            render: (_, record) => (
                <AntdSpace size={'middle'}>
                    <Permission operationCode={['system:tool:modify:base']}>
                        <Link onClick={handleOnEditBtnClick(record)}>编辑</Link>
                    </Permission>
                    <Permission operationCode={['system:tool:delete:base']}>
                        <Link onClick={handleOnDeleteBtnClick(record)}>删除</Link>
                    </Permission>
                </AntdSpace>
            )
        }
    ]

    const handleOnEditBtnClick = (value: ToolBaseWithVersionsVo) => {
        return (e: MouseEvent) => {
            e.stopPropagation()
            setIsDrawerEdit(true)
            setIsDrawerOpen(true)
            editForm.setFieldValue('id', value.id)
            editForm.setFieldValue('name', value.name)
            void editForm.validateFields()
        }
    }

    const handleOnDeleteBtnClick = (value: ToolBaseWithVersionsVo) => {
        return (e: MouseEvent) => {
            e.stopPropagation()
            modal
                .confirm({
                    centered: true,
                    maskClosable: true,
                    title: '确定删除',
                    content: `确定删除基板 ${value.name} 吗？`
                })
                .then(
                    (confirmed) => {
                        if (confirmed) {
                            setIsLoading(true)

                            r_sys_tool_base_delete(value.id)
                                .then((res) => {
                                    const response = res.data
                                    if (response.code === DATABASE_DELETE_SUCCESS) {
                                        void message.success('删除成功')
                                        setTimeout(() => {
                                            getBase()
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

    const handleOnSubmit = () => {
        if (isSubmitting) {
            return
        }
        setIsSubmitting(true)

        if (isDrawerEdit) {
            r_sys_tool_base_update(editFormValues)
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_UPDATE_SUCCESS:
                            setIsDrawerOpen(false)
                            void message.success('更新成功')
                            getBase()
                            break
                        case DATABASE_DUPLICATE_KEY:
                            void message.error('已存在相同名称的基板')
                            break
                        default:
                            void message.error('更新失败，请稍后重试')
                    }
                })
                .finally(() => {
                    setIsSubmitting(false)
                })
        } else {
            r_sys_tool_base_add(addFormValues)
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_INSERT_SUCCESS:
                            setIsDrawerOpen(false)
                            void message.success('添加成功')
                            addForm.resetFields()
                            getBase()
                            break
                        case DATABASE_DUPLICATE_KEY:
                            void message.error('已存在相同名称的基板')
                            break
                        default:
                            void message.error('添加失败，请稍后重试')
                    }
                })
                .finally(() => {
                    setIsSubmitting(false)
                })
        }
    }

    const handleOnDrawerClose = () => {
        setIsDrawerOpen(false)
    }

    const getBase = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_tool_base_get({
            currentPage: tableParams.pagination?.current,
            pageSize: tableParams.pagination?.pageSize,
            sortField:
                tableParams.sortField && tableParams.sortOrder
                    ? (tableParams.sortField as string)
                    : undefined,
            sortOrder:
                tableParams.sortField && tableParams.sortOrder ? tableParams.sortOrder : undefined,
            ...tableParams.filters
        })
            .then((res) => {
                const response = res.data
                if (response.code === DATABASE_SELECT_SUCCESS) {
                    setBaseData(response.data!.records)
                    setTableParams({
                        ...tableParams,
                        pagination: {
                            ...tableParams.pagination,
                            total: response.data!.total
                        }
                    })
                } else {
                    void message.error('获取失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        ;(isDrawerEdit ? editForm : addForm).validateFields({ validateOnly: true }).then(
            () => {
                setIsSubmittable(true)
            },
            () => {
                setIsSubmittable(false)
            }
        )
    }, [isDrawerOpen, isDrawerEdit, addFormValues, editFormValues])

    useEffect(() => {
        getBase()
    }, [
        JSON.stringify(tableParams.filters),
        JSON.stringify(tableParams.sortField),
        JSON.stringify(tableParams.sortOrder),
        JSON.stringify(tableParams.pagination?.pageSize),
        JSON.stringify(tableParams.pagination?.current)
    ])

    const drawerToolbar = (
        <AntdSpace>
            <AntdButton onClick={handleOnDrawerClose} disabled={isSubmitting}>
                取消
            </AntdButton>
            <AntdButton
                type={'primary'}
                disabled={!isSubmittable}
                loading={isSubmitting}
                onClick={handleOnSubmit}
            >
                提交
            </AntdButton>
        </AntdSpace>
    )

    const addFormComponent = (
        <AntdForm
            key={'addFormComponent'}
            form={addForm}
            disabled={isSubmitting}
            layout={'vertical'}
        >
            <AntdForm.Item
                name={'name'}
                label={'名称'}
                rules={[{ required: true, whitespace: true }]}
            >
                <AntdInput allowClear placeholder={'请输入名称'} />
            </AntdForm.Item>
            <AntdForm.Item name={'platform'} label={'平台'} rules={[{ required: true }]}>
                <AntdSelect placeholder={'请选择平台'}>
                    <AntdSelect.Option key={'WEB'}>Web</AntdSelect.Option>
                    <AntdSelect.Option key={'DESKTOP'}>Desktop</AntdSelect.Option>
                    <AntdSelect.Option key={'ANDROID'}>Android</AntdSelect.Option>
                </AntdSelect>
            </AntdForm.Item>
        </AntdForm>
    )

    const editFormComponent = (
        <AntdForm
            key={'editFormComponent'}
            form={editForm}
            disabled={isSubmitting}
            layout={'vertical'}
        >
            <AntdForm.Item hidden name={'id'} label={'ID'}>
                <AntdInput disabled />
            </AntdForm.Item>
            <AntdForm.Item
                name={'name'}
                label={'名称'}
                rules={[{ required: true, whitespace: true }]}
            >
                <AntdInput allowClear placeholder={'请输入名称'} />
            </AntdForm.Item>
        </AntdForm>
    )

    return (
        <>
            <FitFullscreen>
                <HideScrollbar>
                    <FlexBox direction={'horizontal'} className={styles.root}>
                        <Card>
                            <AntdTable
                                rowKey={(record) => record.id}
                                columns={baseColumns}
                                dataSource={baseData}
                                pagination={tableParams.pagination}
                                loading={isLoading}
                                scroll={{ x: true }}
                                onChange={handleOnTableChange}
                                onRow={({ id }) => ({
                                    style: { cursor: 'pointer' },
                                    onClick: handleOnRowClick(id)
                                })}
                            />
                        </Card>
                    </FlexBox>
                </HideScrollbar>
                <AntdDrawer
                    title={isDrawerEdit ? '编辑基板' : '添加基板'}
                    onClose={handleOnDrawerClose}
                    open={isDrawerOpen}
                    closable={!isSubmitting}
                    maskClosable={!isSubmitting}
                    extra={drawerToolbar}
                >
                    {isDrawerEdit ? editFormComponent : addFormComponent}
                </AntdDrawer>
            </FitFullscreen>
        </>
    )
}

export default Base
