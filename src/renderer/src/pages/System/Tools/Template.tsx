import Icon from '@ant-design/icons'
import '@/assets/css/pages/system/tools/template.scss'
import {
    COLOR_PRODUCTION,
    DATABASE_DELETE_SUCCESS,
    DATABASE_DUPLICATE_KEY,
    DATABASE_INSERT_SUCCESS,
    DATABASE_SELECT_SUCCESS,
    DATABASE_UPDATE_SUCCESS
} from '@/constants/common.constants'
import { utcToLocalTime } from '@/util/datetime'
import { hasPermission } from '@/util/auth'
import {
    r_sys_tool_template_update,
    r_sys_tool_template_delete,
    r_sys_tool_template_add,
    r_sys_tool_template_get,
    r_sys_tool_template_get_one,
    r_sys_tool_base_get_list
} from '@/services/system'
import { IFile, IFiles, ITsconfig } from '@/components/Playground/shared'
import {
    base64ToFiles,
    fileNameToLanguage,
    filesToBase64,
    getFilesSize,
    TS_CONFIG_FILE_NAME
} from '@/components/Playground/files'
import FitFullscreen from '@/components/common/FitFullscreen'
import FlexBox from '@/components/common/FlexBox'
import HideScrollbar from '@/components/common/HideScrollbar'
import Card from '@/components/common/Card'
import Permission from '@/components/common/Permission'
import Playground from '@/components/Playground'

const Template = () => {
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            currentLocation.pathname !== nextLocation.pathname && Object.keys(hasEdited).length > 0
    )
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
    const [form] = AntdForm.useForm<ToolTemplateAddEditParam>()
    const formValues = AntdForm.useWatch([], form)
    const [addFileForm] = AntdForm.useForm<{ fileName: string }>()
    const [renameFileForm] = AntdForm.useForm<{ fileName: string }>()
    const [newFormValues, setNewFormValues] = useState<ToolTemplateAddEditParam>()
    const [isLoading, setIsLoading] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isDrawerEdit, setIsDrawerEdit] = useState(false)
    const [baseData, setBaseData] = useState<ToolBaseVo[]>([])
    const [isLoadingBaseData, setIsLoadingBaseData] = useState(false)
    const [isSubmittable, setIsSubmittable] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingTemplateId, setEditingTemplateId] = useState<string>('')
    const [editingFiles, setEditingFiles] = useState<Record<string, IFiles>>({})
    const [editingFileName, setEditingFileName] = useState('')
    const [hasEdited, setHasEdited] = useState<Record<string, boolean>>({})
    const [templateData, setTemplateData] = useState<ToolTemplateVo[]>([])
    const [templateDetailData, setTemplateDetailData] = useState<Record<string, ToolTemplateVo>>({})
    const [templateDetailLoading, setTemplateDetailLoading] = useState<Record<string, boolean>>({})
    const [tsconfig, setTsconfig] = useState<ITsconfig>()

    useBeforeUnload(
        useCallback(
            (event) => {
                if (Object.keys(hasEdited).length) {
                    event.preventDefault()
                    event.returnValue = ''
                }
            },
            [hasEdited]
        ),
        { capture: true }
    )

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
            setBaseData([])
        }
    }

    const handleOnAddBtnClick = () => {
        setIsDrawerEdit(false)
        setIsDrawerOpen(true)
        form.setFieldValue('id', undefined)
        form.setFieldValue('name', newFormValues?.name)
        form.setFieldValue('baseId', newFormValues?.baseId)
        form.setFieldValue('entryPoint', newFormValues?.entryPoint)
        form.setFieldValue('enable', newFormValues?.enable ?? true)
        if (!baseData || !baseData.length) {
            getBaseData()
        }
    }

    const templateColumns: _ColumnsType<ToolTemplateVo> = [
        {
            title: '名称',
            render: (_, record) => (
                <span className={hasEdited[record.id] ? 'has-edited' : undefined}>
                    {record.name}
                </span>
            )
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
            dataIndex: ['base', 'name']
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
                <>
                    操作
                    {!Object.keys(hasEdited).length && (
                        <Permission operationCode={['system:tool:add:template']}>
                            {' '}
                            (
                            <a style={{ color: COLOR_PRODUCTION }} onClick={handleOnAddBtnClick}>
                                新增
                            </a>
                            )
                        </Permission>
                    )}
                </>
            ),
            width: '8em',
            align: 'center',
            render: (_, record) => (
                <>
                    <AntdSpace size={'middle'}>
                        {hasEdited[record.id] && (
                            <Permission operationCode={['system:tool:modify:template']}>
                                <a
                                    style={{ color: COLOR_PRODUCTION }}
                                    onClick={handleOnSaveBtnClick(record)}
                                >
                                    保存
                                </a>
                            </Permission>
                        )}
                        {!Object.keys(hasEdited).length && (
                            <Permission operationCode={['system:tool:modify:template']}>
                                <a
                                    style={{ color: COLOR_PRODUCTION }}
                                    onClick={handleOnEditBtnClick(record)}
                                >
                                    编辑
                                </a>
                            </Permission>
                        )}
                        <Permission operationCode={['system:tool:delete:template']}>
                            <a
                                style={{ color: COLOR_PRODUCTION }}
                                onClick={handleOnDeleteBtnClick(record)}
                            >
                                删除
                            </a>
                        </Permission>
                    </AntdSpace>
                </>
            )
        }
    ]

    const handleOnSaveBtnClick = (value: ToolTemplateVo) => {
        return () => {
            if (isLoading) {
                return
            }
            setIsLoading(true)

            const source = filesToBase64(editingFiles[value.id])

            void r_sys_tool_template_update({ id: value.id, source })
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_UPDATE_SUCCESS:
                            void message.success('保存成功')
                            delete hasEdited[value.id]
                            setHasEdited({ ...hasEdited })
                            getTemplateDetail(value)
                            break
                        default:
                            void message.error('出错了，请稍后重试')
                    }
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }
    }

    const handleOnEditBtnClick = (value: ToolTemplateVo) => {
        return () => {
            setIsDrawerEdit(true)
            setIsDrawerOpen(true)
            form.setFieldValue('id', value.id)
            form.setFieldValue('name', value.name)
            form.setFieldValue('baseId', value.base.id)
            form.setFieldValue('entryPoint', value.entryPoint)
            form.setFieldValue('enable', value.enable)
            if (!baseData || !baseData.length) {
                getBaseData()
            }
            void form.validateFields()
        }
    }

    const handleOnDeleteBtnClick = (value: ToolTemplateVo) => {
        return () => {
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

                            void r_sys_tool_template_delete(value.id)
                                .then((res) => {
                                    const response = res.data
                                    if (response.code === DATABASE_DELETE_SUCCESS) {
                                        void message.success('删除成功')
                                        setHasEdited({})
                                        setEditingFileName('')
                                        setEditingFiles({})
                                        setEditingTemplateId('')
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
            void r_sys_tool_template_update(formValues)
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
            void r_sys_tool_template_add({
                ...formValues,
                baseId: formValues.baseId
                    ? (formValues.baseId as unknown as string[])[1]
                    : undefined
            })
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_INSERT_SUCCESS:
                            setIsDrawerOpen(false)
                            void message.success('添加成功')
                            setNewFormValues(undefined)
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

    const handleOnCloseBtnClick = () => {
        setEditingFileName('')
    }

    const handleOnDrawerClose = () => {
        setIsDrawerOpen(false)
    }

    const getTemplate = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        void r_sys_tool_template_get({
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

    const handleOnExpand = (expanded: boolean, record: ToolTemplateVo) => {
        if (!expanded) {
            return
        }
        getTemplateDetail(record)
    }

    const getTemplateDetail = (record: ToolTemplateVo) => {
        if (templateDetailLoading[record.id] || hasEdited[record.id]) {
            return
        }
        setTemplateDetailLoading({ ...templateDetailLoading, [record.id]: true })

        void r_sys_tool_template_get_one(record.id)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        setTemplateDetailData({
                            ...templateDetailData,
                            [record.id]: response.data!
                        })
                        setTemplateData(
                            templateData.map((value) =>
                                value.id === response.data!.id
                                    ? {
                                          ...response.data!,
                                          source: { id: response.data!.source.id }
                                      }
                                    : value
                            )
                        )
                        break
                    default:
                        void message.error(`获取模板 ${record.name} 文件内容失败，请稍后重试`)
                }
            })
            .finally(() => {
                setTemplateDetailLoading({ ...templateDetailLoading, [record.id]: false })
            })
    }

    const expandedRowRender = (record: ToolTemplateVo) => {
        const templateDetailVo = templateDetailData[record.id]
        let sourceFiles: IFiles | undefined = undefined
        let sourceFileList: IFile[] = []
        if (templateDetailVo) {
            sourceFiles = base64ToFiles(templateDetailVo.source.data!)
            sourceFileList = Object.values(sourceFiles)
        }

        const handleOnAddFile = () => {
            void modal.confirm({
                centered: true,
                maskClosable: true,
                title: '新建文件',
                footer: (_, { OkBtn, CancelBtn }) => (
                    <>
                        <OkBtn />
                        <CancelBtn />
                    </>
                ),
                content: (
                    <AntdForm
                        form={addFileForm}
                        ref={(ref) => {
                            setTimeout(() => {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                                ref?.getFieldInstance('fileName').focus()
                            }, 50)
                        }}
                    >
                        <AntdForm.Item
                            name={'fileName'}
                            label={'文件名'}
                            style={{ marginTop: 10 }}
                            rules={[
                                { required: true },
                                {
                                    pattern: /\.(jsx|tsx|js|ts|css|json)$/,
                                    message: '仅支持 *.jsx, *.tsx, *.js, *.ts, *.css, *.json 文件'
                                },
                                ({ getFieldValue }) => ({
                                    validator() {
                                        const newFileName = getFieldValue('fileName') as string
                                        if (
                                            Object.keys(sourceFiles!)
                                                .map((item) => item.toLowerCase())
                                                .includes(newFileName.toLowerCase())
                                        ) {
                                            return Promise.reject(new Error('文件已存在'))
                                        }
                                        return Promise.resolve()
                                    }
                                })
                            ]}
                        >
                            <AntdInput placeholder={'请输入文件名'} />
                        </AntdForm.Item>
                    </AntdForm>
                ),
                onOk: () =>
                    addFileForm.validateFields().then(
                        () => {
                            return new Promise<void>((resolve) => {
                                const newFileName = addFileForm.getFieldValue('fileName') as string

                                setTemplateDetailLoading({
                                    ...templateDetailLoading,
                                    [record.id]: true
                                })

                                sourceFiles = {
                                    ...sourceFiles,
                                    [newFileName]: {
                                        name: newFileName,
                                        language: fileNameToLanguage(newFileName),
                                        value: ''
                                    }
                                }

                                void r_sys_tool_template_update({
                                    id: record.id,
                                    source: filesToBase64(sourceFiles)
                                })
                                    .then((res) => {
                                        addFileForm.setFieldValue('fileName', '')
                                        const response = res.data
                                        switch (response.code) {
                                            case DATABASE_UPDATE_SUCCESS:
                                                void message.success('添加成功')
                                                setTimeout(() => {
                                                    getTemplateDetail(record)
                                                })
                                                resolve()
                                                break
                                            default:
                                                void message.error('添加失败，请稍后重试')
                                                resolve()
                                        }
                                    })
                                    .finally(() => {
                                        setTemplateDetailLoading({
                                            ...templateDetailLoading,
                                            [record.id]: false
                                        })
                                    })
                            })
                        },
                        () => {
                            return new Promise((_, reject) => {
                                reject('请输入文件名')
                            })
                        }
                    )
            })
        }

        const detailColumns: _ColumnsType<IFile> = [
            { title: '文件名', dataIndex: 'name' },
            {
                title: (
                    <>
                        文件总大小
                        <br />
                        {sourceFiles ? getFilesSize(sourceFiles) : 'Unknown'}
                    </>
                ),
                width: '10em',
                align: 'center'
            },
            {
                title: (
                    <>
                        操作
                        {!Object.keys(hasEdited).length && (
                            <Permission operationCode={['system:tool:modify:template']}>
                                {' '}
                                (
                                <a style={{ color: COLOR_PRODUCTION }} onClick={handleOnAddFile}>
                                    新增
                                </a>
                                )
                            </Permission>
                        )}
                    </>
                ),
                width: '12em',
                align: 'center',
                render: (_, record) => (
                    <>
                        <AntdSpace size={'middle'}>
                            <Permission
                                operationCode={[
                                    'system:tool:query:template',
                                    'system:tool:modify:template'
                                ]}
                            >
                                <a
                                    onClick={handleOnEditFile(record.name)}
                                    style={{ color: COLOR_PRODUCTION }}
                                >
                                    {hasPermission('system:tool:modify:template') ? '编辑' : '查看'}
                                </a>
                            </Permission>
                            {!Object.keys(hasEdited).length && (
                                <Permission operationCode={['system:tool:modify:template']}>
                                    <a
                                        onClick={handleOnRenameFile(record.name)}
                                        style={{ color: COLOR_PRODUCTION }}
                                    >
                                        重命名
                                    </a>
                                </Permission>
                            )}
                            {!Object.keys(hasEdited).length && (
                                <Permission operationCode={['system:tool:delete:template']}>
                                    <a
                                        onClick={handleOnDeleteFile(record.name)}
                                        style={{ color: COLOR_PRODUCTION }}
                                    >
                                        删除
                                    </a>
                                </Permission>
                            )}
                        </AntdSpace>
                    </>
                )
            }
        ]

        const handleOnEditFile = (fileName: string) => {
            return () => {
                if (editingTemplateId !== record.id) {
                    setTsconfig(undefined)
                }
                if (!hasEdited[record.id]) {
                    setEditingFiles({ ...editingFiles, [record.id]: sourceFiles! })
                }
                setEditingTemplateId(record.id)
                setEditingFileName(fileName)
            }
        }

        const handleOnRenameFile = (fileName: string) => {
            return () => {
                renameFileForm.setFieldValue('fileName', fileName)
                void modal.confirm({
                    centered: true,
                    maskClosable: true,
                    title: '重命名文件',
                    footer: (_, { OkBtn, CancelBtn }) => (
                        <>
                            <OkBtn />
                            <CancelBtn />
                        </>
                    ),
                    content: (
                        <AntdForm
                            form={renameFileForm}
                            ref={(ref) => {
                                setTimeout(() => {
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                                    ref?.getFieldInstance('fileName').focus()
                                }, 50)
                            }}
                        >
                            <AntdForm.Item
                                name={'fileName'}
                                label={'新文件名'}
                                style={{ marginTop: 10 }}
                                rules={[
                                    { required: true },
                                    {
                                        pattern: /\.(jsx|tsx|js|ts|css|json)$/,
                                        message:
                                            '仅支持 *.jsx, *.tsx, *.js, *.ts, *.css, *.json 文件'
                                    },
                                    ({ getFieldValue }) => ({
                                        validator() {
                                            const newFileName = getFieldValue('fileName') as string
                                            if (
                                                Object.keys(sourceFiles!)
                                                    .map((item) => item.toLowerCase())
                                                    .includes(newFileName?.toLowerCase()) &&
                                                newFileName.toLowerCase() !== fileName.toLowerCase()
                                            ) {
                                                return Promise.reject(new Error('文件已存在'))
                                            }

                                            return Promise.resolve()
                                        }
                                    })
                                ]}
                            >
                                <AntdInput placeholder={'请输入新文件名'} />
                            </AntdForm.Item>
                        </AntdForm>
                    ),
                    onOk: () =>
                        renameFileForm.validateFields().then(
                            () => {
                                return new Promise<void>((resolve) => {
                                    const newFileName = renameFileForm.getFieldValue(
                                        'fileName'
                                    ) as string
                                    const temp = sourceFiles![fileName].value
                                    delete sourceFiles![fileName]

                                    sourceFiles = {
                                        ...sourceFiles,
                                        [newFileName]: {
                                            name: newFileName,
                                            language: fileNameToLanguage(newFileName),
                                            value: temp
                                        }
                                    }

                                    void r_sys_tool_template_update({
                                        id: record.id,
                                        source: filesToBase64(sourceFiles)
                                    })
                                        .then((res) => {
                                            const response = res.data
                                            switch (response.code) {
                                                case DATABASE_UPDATE_SUCCESS:
                                                    void message.success('重命名成功')
                                                    if (
                                                        editingTemplateId === record.id &&
                                                        editingFileName === fileName
                                                    ) {
                                                        setEditingFileName('')
                                                    }
                                                    setTimeout(() => {
                                                        getTemplateDetail(record)
                                                    })
                                                    break
                                                default:
                                                    void message.error('重命名失败，请稍后重试')
                                            }
                                        })
                                        .finally(() => {
                                            setTemplateDetailLoading({
                                                ...templateDetailLoading,
                                                [record.id]: false
                                            })
                                        })
                                    resolve()
                                })
                            },
                            () => {
                                return new Promise((_, reject) => {
                                    reject('请输入文件名')
                                })
                            }
                        )
                })
            }
        }

        const handleOnDeleteFile = (fileName: string) => {
            return () => {
                modal
                    .confirm({
                        centered: true,
                        maskClosable: true,
                        title: '确定删除',
                        content: `确定删除文件 ${fileName} 吗？`
                    })
                    .then(
                        (confirmed) => {
                            if (confirmed) {
                                setTemplateDetailLoading({
                                    ...templateDetailLoading,
                                    [record.id]: true
                                })

                                delete sourceFiles![fileName]

                                void r_sys_tool_template_update({
                                    id: record.id,
                                    source: filesToBase64(sourceFiles!)
                                })
                                    .then((res) => {
                                        const response = res.data
                                        switch (response.code) {
                                            case DATABASE_UPDATE_SUCCESS:
                                                void message.success('删除成功')
                                                if (
                                                    editingTemplateId === record.id &&
                                                    editingFileName === fileName
                                                ) {
                                                    setEditingFileName('')
                                                }
                                                setTimeout(() => {
                                                    getTemplateDetail(record)
                                                })
                                                break
                                            default:
                                                void message.error('删除失败，请稍后重试')
                                        }
                                    })
                                    .finally(() => {
                                        setTemplateDetailLoading({
                                            ...templateDetailLoading,
                                            [record.id]: false
                                        })
                                    })
                            }
                        },
                        () => {}
                    )
            }
        }

        return (
            <Card>
                <AntdTable
                    loading={templateDetailLoading[record.id]}
                    dataSource={sourceFileList}
                    columns={detailColumns}
                    pagination={false}
                    rowKey={(record) => record.name}
                />
            </Card>
        )
    }

    const handleOnChangeFileContent = (_content: string, _fileName: string, files: IFiles) => {
        if (!hasPermission('system:tool:modify:template')) {
            return
        }
        setEditingFiles({ ...editingFiles, [editingTemplateId]: files })
        if (!hasEdited[editingTemplateId]) {
            setHasEdited({ ...hasEdited, [editingTemplateId]: true })
        }
    }

    const getBaseData = () => {
        if (isLoadingBaseData) {
            return
        }
        setIsLoadingBaseData(true)

        void r_sys_tool_base_get_list()
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

    useEffect(() => {
        try {
            const tsconfigStr = editingFiles[editingTemplateId][TS_CONFIG_FILE_NAME].value
            setTsconfig(JSON.parse(tsconfigStr) as ITsconfig)
        } catch (e) {
            /* empty */
        }
    }, [editingFiles, editingTemplateId])

    useEffect(() => {
        form.validateFields({ validateOnly: true }).then(
            () => {
                setIsSubmittable(true)
            },
            () => {
                setIsSubmittable(false)
            }
        )

        if (!isDrawerEdit && formValues) {
            setNewFormValues({
                name: formValues.name,
                baseId: formValues.baseId,
                entryPoint: formValues.entryPoint,
                enable: formValues.enable
            })
        }
    }, [formValues])

    const baseDataGroupByPlatform = () => {
        interface Node {
            label: string
            value: string
            children?: Node[]
        }
        const temp: Node[] = []
        baseData.forEach((value) => {
            if (!temp.length) {
                temp.push({
                    label: `${value.platform.slice(0, 1)}${value.platform.slice(1).toLowerCase()}`,
                    value: value.platform,
                    children: [
                        {
                            label: value.name,
                            value: value.id
                        }
                    ]
                })
            } else {
                if (
                    !temp.some((platform, platformIndex) => {
                        if (platform.value === value.platform) {
                            temp[platformIndex].children!.push({
                                label: value.name,
                                value: value.id
                            })
                            return true
                        }
                        return false
                    })
                ) {
                    temp.push({
                        label: `${value.platform.slice(0, 1)}${value.platform.slice(1).toLowerCase()}`,
                        value: value.platform,
                        children: [
                            {
                                label: value.name,
                                value: value.id
                            }
                        ]
                    })
                }
            }
        })

        return temp
    }

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
            <AntdTooltip title={'刷新基板列表'}>
                <AntdButton onClick={getBaseData} disabled={isSubmitting}>
                    <Icon component={IconOxygenRefresh} />
                </AntdButton>
            </AntdTooltip>
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

    const addAndEditForm = (
        <AntdForm form={form} disabled={isSubmitting} layout={'vertical'}>
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
                hidden={isDrawerEdit}
                name={'baseId'}
                label={'基板'}
                rules={[{ required: true }]}
            >
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
                <AntdSwitch checkedChildren={'启用'} unCheckedChildren={'禁用'} />
            </AntdForm.Item>
        </AntdForm>
    )

    return (
        <>
            <FitFullscreen data-component={'system-tools-template'}>
                <HideScrollbar>
                    <FlexBox direction={'horizontal'} className={'root-content'}>
                        <Card>
                            <AntdTable
                                dataSource={templateData}
                                columns={templateColumns}
                                rowKey={(record) => record.id}
                                pagination={tableParams.pagination}
                                loading={isLoading}
                                scroll={{ x: true }}
                                expandable={{
                                    expandedRowRender,
                                    onExpand: handleOnExpand
                                }}
                                onChange={handleOnTableChange}
                            />
                        </Card>
                        {editingFileName && (
                            <Card>
                                <Playground.CodeEditor
                                    files={editingFiles[editingTemplateId]}
                                    selectedFileName={editingFileName}
                                    onSelectedFileChange={() => {}}
                                    onChangeFileContent={handleOnChangeFileContent}
                                    showFileSelector={false}
                                    tsconfig={tsconfig}
                                    readonly={
                                        isLoading ||
                                        templateDetailLoading[editingTemplateId] ||
                                        !hasPermission('system:tool:modify:template')
                                    }
                                />
                                <div className={'close-editor-btn'} onClick={handleOnCloseBtnClick}>
                                    <Icon component={IconOxygenClose} />
                                </div>
                            </Card>
                        )}
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
                    {addAndEditForm}
                </AntdDrawer>
            </FitFullscreen>
            {contextHolder}
            <AntdModal
                open={blocker.state === 'blocked'}
                title={'未保存'}
                onOk={() => blocker.proceed?.()}
                onCancel={() => blocker.reset?.()}
                footer={(_, { OkBtn, CancelBtn }) => (
                    <>
                        <OkBtn />
                        <CancelBtn />
                    </>
                )}
            >
                离开此页面将丢失所有未保存数据，是否继续？
            </AntdModal>
        </>
    )
}

export default Template
