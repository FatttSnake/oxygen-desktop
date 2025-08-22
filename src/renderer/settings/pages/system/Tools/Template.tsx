import { MouseEvent, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import useStyles from '%/assets/css/pages/system/tools/template.style'
import {
    DATABASE_DELETE_SUCCESS,
    DATABASE_DUPLICATE_KEY,
    DATABASE_INSERT_SUCCESS,
    DATABASE_SELECT_SUCCESS,
    DATABASE_UPDATE_SUCCESS
} from '$/constants/common.constants'
import { checkDesktop, message, modal } from '$/util/common'
import { utcToLocalTime } from '$/util/datetime'
import { navigateToToolTemplateEditor } from '$/util/navigation'
import { formatToolBaseVersion } from '$/util/tool'
import {
    r_sys_tool_template_update,
    r_sys_tool_template_delete,
    r_sys_tool_template_add,
    r_sys_tool_template_get,
    r_sys_tool_base_get_list
} from '$/services/system'
import FitFullscreen from '$/components/FitFullscreen'
import FlexBox from '$/components/FlexBox'
import HideScrollbar from '$/components/HideScrollbar'
import Card from '$/components/Card'
import Permission from '$/components/Permission'

const { Link } = AntdTypography

const Template = () => {
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
    const [addForm] = AntdForm.useForm<ToolTemplateAddParam & { selectedToolBase: string[] }>()
    const addFormValues = AntdForm.useWatch([], addForm)
    const [editForm] = AntdForm.useForm<ToolTemplateUpdateParam>()
    const editFormValues = AntdForm.useWatch([], editForm)
    const [isLoading, setIsLoading] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isDrawerEdit, setIsDrawerEdit] = useState(false)
    const [baseData, setBaseData] = useState<ToolBaseVo[]>([])
    const [isLoadingBaseData, setIsLoadingBaseData] = useState(false)
    const [isSubmittable, setIsSubmittable] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [templateData, setTemplateData] = useState<ToolTemplateVo[]>([])

    const handleOnTableChange = (
        pagination: _TablePaginationConfig,
        filters: Record<string, _FilterValue | null>,
        sorter: _SorterResult<ToolTemplateVo> | _SorterResult<ToolTemplateVo>[]
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
            setTemplateData([])
        }
    }

    const handleOnRowClick = (id: string) => {
        return () => {
            if (
                !checkDesktop() &&
                templateData.find((item) => item.id === id)?.platform !== 'WEB'
            ) {
                void message.warning('此模板需要桌面端环境，请在桌面端编辑')
                return
            }

            navigateToToolTemplateEditor(navigate, id)
        }
    }

    const handleOnAddBtnClick = () => {
        setIsDrawerEdit(false)
        setIsDrawerOpen(true)
        if (!baseData || !baseData.length) {
            getBaseData()
        }
    }

    const templateColumns: _ColumnsType<ToolTemplateVo> = [
        {
            title: '名称',
            dataIndex: 'name'
        },
        {
            title: '平台',
            dataIndex: 'platform',
            render: (value: string) => `${value.slice(0, 1)}${value.slice(1).toLowerCase()}`,
            filters: [
                { text: 'Web', value: 'WEB' },
                { text: 'Desktop', value: 'DESKTOP' },
                { text: 'Android', value: 'ANDROID' }
            ]
        },
        {
            title: '基板',
            dataIndex: ['base', 'name'],
            render: (value: string, record) => (
                <AntdSpace>
                    {value}
                    <AntdTag>{formatToolBaseVersion(record.base.version)}</AntdTag>
                </AntdSpace>
            )
        },
        {
            title: '入口',
            dataIndex: 'entryPoint'
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            width: '7em',
            align: 'center',
            render: (value: string) => utcToLocalTime(value)
        },
        {
            title: '修改时间',
            dataIndex: 'updateTime',
            width: '7em',
            align: 'center',
            render: (value: string) => utcToLocalTime(value)
        },
        {
            title: '状态',
            dataIndex: 'enable',
            width: '5em',
            align: 'center',
            render: (value) =>
                value ? <AntdTag color={'success'}>启用</AntdTag> : <AntdTag>禁用</AntdTag>
        },
        {
            title: (
                <AntdSpace style={{ textWrap: 'nowrap' }}>
                    操作
                    <Permission operationCode={['system:tool:add:template']}>
                        (<Link onClick={handleOnAddBtnClick}>新增</Link>)
                    </Permission>
                </AntdSpace>
            ),
            width: '8em',
            align: 'center',
            render: (_, record) => (
                <AntdSpace size={'middle'}>
                    <Permission operationCode={['system:tool:modify:template']}>
                        <Link onClick={handleOnEditBtnClick(record)}>编辑</Link>
                    </Permission>
                    <Permission operationCode={['system:tool:delete:template']}>
                        <Link onClick={handleOnDeleteBtnClick(record)}>删除</Link>
                    </Permission>
                </AntdSpace>
            )
        }
    ]

    const handleOnEditBtnClick = (value: ToolTemplateVo) => {
        return (e: MouseEvent) => {
            e.stopPropagation()
            setIsDrawerEdit(true)
            setIsDrawerOpen(true)
            editForm.setFieldValue('id', value.id)
            editForm.setFieldValue('name', value.name)
            editForm.setFieldValue('entryPoint', value.entryPoint)
            editForm.setFieldValue('enable', value.enable)
            void editForm.validateFields()
        }
    }

    const handleOnDeleteBtnClick = (value: ToolTemplateVo) => {
        return (e: MouseEvent) => {
            e.stopPropagation()
            modal
                .confirm({
                    centered: true,
                    maskClosable: true,
                    title: '确定删除',
                    content: `确定删除模板 ${value.name} 吗？`
                })
                .then(
                    (confirmed) => {
                        if (confirmed) {
                            setIsLoading(true)

                            r_sys_tool_template_delete(value.id)
                                .then((res) => {
                                    const response = res.data
                                    if (response.code === DATABASE_DELETE_SUCCESS) {
                                        void message.success('删除成功')
                                        setTimeout(() => {
                                            getTemplate()
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
            r_sys_tool_template_update(editFormValues)
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_UPDATE_SUCCESS:
                            setIsDrawerOpen(false)
                            void message.success('更新成功')
                            getTemplate()
                            break
                        case DATABASE_DUPLICATE_KEY:
                            void message.error('已存在相同名称的模板')
                            break
                        default:
                            void message.error('更新失败，请稍后重试')
                    }
                })
                .finally(() => {
                    setIsSubmitting(false)
                })
        } else {
            const baseId = addFormValues.selectedToolBase[1]
            r_sys_tool_template_add({
                ...addFormValues,
                baseId,
                baseVersion: baseData.find(({ id }) => id === baseId)!.version
            })
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_INSERT_SUCCESS:
                            setIsDrawerOpen(false)
                            void message.success('添加成功')
                            addForm.resetFields()
                            getTemplate()
                            break
                        case DATABASE_DUPLICATE_KEY:
                            void message.error('已存在相同名称的模板')
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

    const getTemplate = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        r_sys_tool_template_get({
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
                    setTemplateData(response.data!.records)
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

    const getBaseData = () => {
        if (isLoadingBaseData && isDrawerEdit) {
            return
        }
        setIsLoadingBaseData(true)

        r_sys_tool_base_get_list()
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        setBaseData(response.data!)
                        break
                    default:
                        void message.error('获取基板列表失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoadingBaseData(false)
            })
    }

    const baseDataGroupByPlatform = () => {
        interface Node {
            label: ReactNode
            value: string
            children?: Node[]
        }

        return baseData.reduce<Node[]>((prev, curr) => {
            const platformLabel = `${curr.platform.slice(0, 1)}${curr.platform.slice(1).toLowerCase()}`
            const existingPlatformIndex = prev.findIndex((item) => item.value === curr.platform)

            if (existingPlatformIndex !== -1) {
                const existingPlatform = prev[existingPlatformIndex]
                return [
                    ...prev.slice(0, existingPlatformIndex),
                    {
                        ...existingPlatform,
                        children: [
                            ...(existingPlatform.children || []),
                            {
                                label: (
                                    <AntdSpace>
                                        {curr.name}
                                        <AntdTag color={'blue'}>
                                            {formatToolBaseVersion(curr.version)}
                                        </AntdTag>
                                    </AntdSpace>
                                ),
                                value: curr.id
                            }
                        ]
                    },
                    ...prev.slice(existingPlatformIndex + 1)
                ]
            }
            return [
                ...prev,
                {
                    label: platformLabel,
                    value: curr.platform,
                    children: [
                        {
                            label: (
                                <AntdSpace>
                                    {curr.name}
                                    <AntdTag color={'blue'}>
                                        {formatToolBaseVersion(curr.version)}
                                    </AntdTag>
                                </AntdSpace>
                            ),
                            value: curr.id
                        }
                    ]
                }
            ]
        }, [])
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
        getTemplate()
    }, [
        JSON.stringify(tableParams.filters),
        JSON.stringify(tableParams.sortField),
        JSON.stringify(tableParams.sortOrder),
        JSON.stringify(tableParams.pagination?.pageSize),
        JSON.stringify(tableParams.pagination?.current)
    ])

    const drawerToolbar = (
        <AntdSpace>
            {!isDrawerEdit && (
                <AntdTooltip title={'刷新基板列表'}>
                    <AntdButton onClick={getBaseData} disabled={isSubmitting}>
                        <Icon component={IconOxygenRefresh} />
                    </AntdButton>
                </AntdTooltip>
            )}
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
            <AntdForm.Item name={'selectedToolBase'} label={'基板'} rules={[{ required: true }]}>
                <AntdCascader
                    showSearch
                    allowClear={false}
                    options={baseDataGroupByPlatform()}
                    placeholder={'请选择基板'}
                />
            </AntdForm.Item>
            <AntdForm.Item
                name={'entryPoint'}
                label={'入口文件'}
                rules={[{ required: true, whitespace: true }]}
            >
                <AntdInput allowClear placeholder={'请输入入口文件'} />
            </AntdForm.Item>
            <AntdForm.Item name={'enable'} label={'状态'}>
                <AntdSwitch
                    checkedChildren={'启用'}
                    unCheckedChildren={'禁用'}
                    defaultChecked={true}
                />
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
            <AntdForm.Item
                name={'entryPoint'}
                label={'入口文件'}
                rules={[{ required: true, whitespace: true }]}
            >
                <AntdInput allowClear placeholder={'请输入入口文件'} />
            </AntdForm.Item>
            <AntdForm.Item name={'enable'} label={'状态'}>
                <AntdSwitch checkedChildren={'启用'} unCheckedChildren={'禁用'} />
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
                                columns={templateColumns}
                                dataSource={templateData}
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
                    title={isDrawerEdit ? '编辑模板' : '添加模板'}
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

export default Template
