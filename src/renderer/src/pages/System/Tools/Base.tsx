import Icon from '@ant-design/icons'
import '@/assets/css/pages/system/tools/base.scss'
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
    r_sys_tool_base_add,
    r_sys_tool_base_delete,
    r_sys_tool_base_get_one,
    r_sys_tool_base_get,
    r_sys_tool_base_update
} from '@/services/system'
import { IFile, IFiles, IImportMap, ITsconfig } from '@/components/Playground/shared'
import {
    base64ToFiles,
    fileNameToLanguage,
    filesToBase64,
    getFilesSize,
    IMPORT_MAP_FILE_NAME,
    strToBase64,
    TS_CONFIG_FILE_NAME
} from '@/components/Playground/files'
import compiler from '@/components/Playground/compiler'
import FitFullscreen from '@/components/common/FitFullscreen'
import FlexBox from '@/components/common/FlexBox'
import HideScrollbar from '@/components/common/HideScrollbar'
import Card from '@/components/common/Card'
import Permission from '@/components/common/Permission'
import Playground from '@/components/Playground'

const Base = () => {
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            currentLocation.pathname !== nextLocation.pathname && Object.keys(hasEdited).length > 0
    )
    const [modal, contextHolder] = AntdModal.useModal()
    const [form] = AntdForm.useForm<ToolBaseAddEditParam>()
    const formValues = AntdForm.useWatch([], form)
    const [addFileForm] = AntdForm.useForm<{ fileName: string }>()
    const [renameFileForm] = AntdForm.useForm<{ fileName: string }>()
    const [newFormValues, setNewFormValues] = useState<ToolBaseAddEditParam>()
    const [isLoading, setIsLoading] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isDrawerEdit, setIsDrawerEdit] = useState(false)
    const [submittable, setSubmittable] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingBaseId, setEditingBaseId] = useState<string>('')
    const [editingFiles, setEditingFiles] = useState<Record<string, IFiles>>({})
    const [editingFileName, setEditingFileName] = useState('')
    const [hasEdited, setHasEdited] = useState<Record<string, boolean>>({})
    const [baseData, setBaseData] = useState<ToolBaseVo[]>([])
    const [baseDetailData, setBaseDetailData] = useState<Record<string, ToolBaseVo>>({})
    const [baseDetailLoading, setBaseDetailLoading] = useState<Record<string, boolean>>({})
    const [tsconfig, setTsconfig] = useState<ITsconfig>()
    const [compiling, setCompiling] = useState(false)
    const [compileForm] = AntdForm.useForm<{ entryFileName: string }>()

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

    const handleOnAddBtnClick = () => {
        setIsDrawerEdit(false)
        setIsDrawerOpen(true)
        form.setFieldValue('id', undefined)
        form.setFieldValue('name', newFormValues?.name)
    }

    const baseColumns: _ColumnsType<ToolBaseVo> = [
        {
            title: '名称',
            render: (_, record) => (
                <span className={hasEdited[record.id] ? 'has-edited' : undefined}>
                    {record.name}
                </span>
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
                <>
                    操作
                    {!Object.keys(hasEdited).length && (
                        <Permission operationCode={['system:tool:add:base']}>
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
            width: '12em',
            align: 'center',
            render: (_, record) => (
                <>
                    <AntdSpace size={'middle'}>
                        {!record.compiled && !Object.keys(hasEdited).length && (
                            <Permission operationCode={['system:tool:modify:base']}>
                                <a
                                    style={{ color: COLOR_PRODUCTION }}
                                    onClick={handleOnCompileBtnClick(record)}
                                >
                                    编译
                                </a>
                            </Permission>
                        )}
                        {hasEdited[record.id] && (
                            <Permission operationCode={['system:tool:modify:base']}>
                                <a
                                    style={{ color: COLOR_PRODUCTION }}
                                    onClick={handleOnSaveBtnClick(record)}
                                >
                                    保存
                                </a>
                            </Permission>
                        )}
                        {!Object.keys(hasEdited).length && (
                            <Permission operationCode={['system:tool:modify:base']}>
                                <a
                                    style={{ color: COLOR_PRODUCTION }}
                                    onClick={handleOnEditBtnClick(record)}
                                >
                                    编辑
                                </a>
                            </Permission>
                        )}
                        <Permission operationCode={['system:tool:delete:base']}>
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

    const handleOnCompileBtnClick = (value: ToolBaseVo) => {
        return () => {
            if (compiling || isLoading) {
                return
            }
            setCompiling(true)
            setIsLoading(true)
            void message.loading({ content: '加载文件中', key: 'COMPILE_LOADING', duration: 0 })

            if (!baseDetailLoading[value.id]) {
                getBaseDetail(value)
            }

            void new Promise<void>((resolve, reject) => {
                const timer = setInterval(() => {
                    let loading
                    let data
                    setBaseDetailLoading((prevState) => {
                        loading = prevState[value.id]
                        return prevState
                    })
                    setBaseDetailData((prevState) => {
                        data = prevState[value.id]
                        return prevState
                    })
                    if (!loading && data) {
                        clearInterval(timer)
                        resolve()
                    }
                    if (loading !== undefined && !loading && !data) {
                        clearInterval(timer)
                        reject()
                    }
                }, 100)
            })
                .then(() => {
                    let baseDetail: ToolBaseVo
                    setBaseDetailData((prevState) => {
                        baseDetail = prevState[value.id]
                        return prevState
                    })
                    message.destroy('COMPILE_LOADING')
                    const files = base64ToFiles(baseDetail!.source.data!)
                    if (!Object.keys(files).includes(IMPORT_MAP_FILE_NAME)) {
                        void message.warning(`编译中止：未包含 ${IMPORT_MAP_FILE_NAME} 文件`)
                        setCompiling(false)
                        setIsLoading(false)
                        return
                    }
                    let importMap: IImportMap
                    try {
                        importMap = JSON.parse(files[IMPORT_MAP_FILE_NAME].value) as IImportMap
                    } catch (e) {
                        void message.warning(`编译中止：Import Map 文件转换失败`)
                        setCompiling(false)
                        setIsLoading(false)
                        return
                    }

                    compileForm.setFieldValue('entryFileName', undefined)
                    void modal.confirm({
                        title: '编译',
                        centered: true,
                        maskClosable: true,
                        footer: (_, { OkBtn, CancelBtn }) => (
                            <>
                                <OkBtn />
                                <CancelBtn />
                            </>
                        ),
                        content: (
                            <>
                                <AntdForm form={compileForm}>
                                    <AntdForm.Item
                                        name={'entryFileName'}
                                        label={'入口文件'}
                                        style={{ marginTop: 10 }}
                                        rules={[{ required: true, message: '请选择入口文件' }]}
                                    >
                                        <AntdSelect
                                            options={Object.keys(files)
                                                .filter(
                                                    (value) =>
                                                        ![
                                                            IMPORT_MAP_FILE_NAME,
                                                            TS_CONFIG_FILE_NAME
                                                        ].includes(value)
                                                )
                                                .map((value) => ({ value, label: value }))}
                                        />
                                    </AntdForm.Item>
                                </AntdForm>
                            </>
                        ),
                        onOk: () =>
                            compileForm.validateFields().then(
                                () => {
                                    return new Promise<void>((resolve) => {
                                        resolve()
                                        void message.loading({
                                            content: '编译中',
                                            key: 'COMPILING',
                                            duration: 0
                                        })
                                        void compiler
                                            .compile(
                                                files,
                                                importMap,
                                                compileForm.getFieldValue('entryFileName') as string
                                            )
                                            .then((result) => {
                                                message.destroy('COMPILING')
                                                void message.loading({
                                                    content: '上传中',
                                                    key: 'UPLOADING',
                                                    duration: 0
                                                })
                                                void r_sys_tool_base_update({
                                                    id: value.id,
                                                    dist: strToBase64(result.outputFiles[0].text)
                                                })
                                                    .then((res) => {
                                                        const response = res.data
                                                        switch (response.code) {
                                                            case DATABASE_UPDATE_SUCCESS:
                                                                void message.success('编译成功')
                                                                getBase()
                                                                break
                                                            default:
                                                                void message.error('上传失败')
                                                        }
                                                    })
                                                    .finally(() => {
                                                        message.destroy('UPLOADING')
                                                        setCompiling(false)
                                                        setIsLoading(false)
                                                    })
                                            })
                                            .catch((e: Error) => {
                                                void message.error(`编译失败：${e.message}`)
                                                message.destroy('COMPILING')
                                                setCompiling(false)
                                                setIsLoading(false)
                                            })
                                    })
                                },
                                () => {
                                    return new Promise((_, reject) => {
                                        reject('请选择入口文件')
                                    })
                                }
                            ),
                        onCancel: () => {
                            setCompiling(false)
                            setIsLoading(false)
                        }
                    })
                })
                .catch(() => {
                    setCompiling(false)
                    setIsLoading(false)
                    message.destroy('COMPILE_LOADING')
                })
        }
    }

    const handleOnSaveBtnClick = (value: ToolBaseVo) => {
        return () => {
            if (isLoading) {
                return
            }
            setIsLoading(true)

            const source = filesToBase64(editingFiles[value.id])

            void r_sys_tool_base_update({ id: value.id, source })
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_UPDATE_SUCCESS:
                            void message.success('保存成功')
                            delete hasEdited[value.id]
                            setHasEdited({ ...hasEdited })
                            getBaseDetail(value)
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

    const handleOnEditBtnClick = (value: ToolBaseVo) => {
        return () => {
            setIsDrawerEdit(true)
            setIsDrawerOpen(true)
            form.setFieldValue('id', value.id)
            form.setFieldValue('name', value.name)
            void form.validateFields()
        }
    }

    const handleOnDeleteBtnClick = (value: ToolBaseVo) => {
        return () => {
            modal
                .confirm({
                    title: '确定删除',
                    maskClosable: true,
                    content: `确定删除基板 ${value.name} 吗？`
                })
                .then(
                    (confirmed) => {
                        if (confirmed) {
                            setIsLoading(true)

                            void r_sys_tool_base_delete(value.id)
                                .then((res) => {
                                    const response = res.data
                                    if (response.code === DATABASE_DELETE_SUCCESS) {
                                        void message.success('删除成功')
                                        setHasEdited({})
                                        setEditingFileName('')
                                        setEditingFiles({})
                                        setEditingBaseId('')
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
            void r_sys_tool_base_update(formValues)
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
            void r_sys_tool_base_add(formValues)
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_INSERT_SUCCESS:
                            setIsDrawerOpen(false)
                            void message.success('添加成功')
                            setNewFormValues(undefined)
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

    const handleOnCloseBtnClick = () => {
        setEditingFileName('')
    }

    const handleOnDrawerClose = () => {
        setIsDrawerOpen(false)
    }

    const getBase = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        void r_sys_tool_base_get()
            .then((res) => {
                const response = res.data
                if (response.code === DATABASE_SELECT_SUCCESS) {
                    setBaseData(response.data!)
                } else {
                    void message.error('获取失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    const handleOnExpand = (expanded: boolean, record: ToolBaseVo) => {
        if (!expanded) {
            return
        }
        getBaseDetail(record)
    }

    const getBaseDetail = (record: ToolBaseVo) => {
        if (baseDetailLoading[record.id] || hasEdited[record.id]) {
            return
        }
        setBaseDetailLoading({ ...baseDetailLoading, [record.id]: true })

        void r_sys_tool_base_get_one(record.id)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        setBaseDetailData({ ...baseDetailData, [record.id]: response.data! })
                        setBaseData(
                            baseData.map((value) =>
                                value.id === response.data!.id
                                    ? {
                                          ...response.data!,
                                          source: { id: response.data!.source.id },
                                          dist: { id: response.data!.dist.id }
                                      }
                                    : value
                            )
                        )
                        break
                    default:
                        void message.error(`获取基板 ${record.name} 文件内容失败，请稍后重试`)
                }
            })
            .finally(() => {
                setBaseDetailLoading({ ...baseDetailLoading, [record.id]: false })
            })
    }

    const expandedRowRender = (record: ToolBaseVo) => {
        const baseDetailVo = baseDetailData[record.id]
        let sourceFiles: IFiles | undefined = undefined
        let sourceFileList: IFile[] = []
        if (baseDetailVo) {
            sourceFiles = base64ToFiles(baseDetailVo.source.data!)
            sourceFileList = Object.values(sourceFiles)
        }

        const handleOnAddFile = () => {
            void modal.confirm({
                title: '新建文件',
                centered: true,
                maskClosable: true,
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
                            <AntdInput />
                        </AntdForm.Item>
                    </AntdForm>
                ),
                onOk: () =>
                    addFileForm.validateFields().then(
                        () => {
                            return new Promise<void>((resolve) => {
                                const newFileName = addFileForm.getFieldValue('fileName') as string

                                setBaseDetailLoading({ ...baseDetailLoading, [record.id]: true })

                                sourceFiles = {
                                    ...sourceFiles,
                                    [newFileName]: {
                                        name: newFileName,
                                        language: fileNameToLanguage(newFileName),
                                        value: ''
                                    }
                                }

                                void r_sys_tool_base_update({
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
                                                    getBaseDetail(record)
                                                })
                                                resolve()
                                                break
                                            default:
                                                void message.error('添加失败，请稍后重试')
                                                resolve()
                                        }
                                    })
                                    .finally(() => {
                                        setBaseDetailLoading({
                                            ...baseDetailLoading,
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
                            <Permission operationCode={['system:tool:modify:base']}>
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
                                    'system:tool:query:base',
                                    'system:tool:modify:base'
                                ]}
                            >
                                <a
                                    onClick={handleOnEditFile(record.name)}
                                    style={{ color: COLOR_PRODUCTION }}
                                >
                                    {hasPermission('system:tool:modify:base') ? '编辑' : '查看'}
                                </a>
                            </Permission>
                            {!Object.keys(hasEdited).length && (
                                <Permission operationCode={['system:tool:modify:base']}>
                                    <a
                                        onClick={handleOnRenameFile(record.name)}
                                        style={{ color: COLOR_PRODUCTION }}
                                    >
                                        重命名
                                    </a>
                                </Permission>
                            )}
                            {!Object.keys(hasEdited).length && (
                                <Permission operationCode={['system:tool:delete:base']}>
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
                if (editingBaseId !== record.id) {
                    setTsconfig(undefined)
                }
                if (!hasEdited[record.id]) {
                    setEditingFiles({ ...editingFiles, [record.id]: sourceFiles! })
                }
                setEditingBaseId(record.id)
                setEditingFileName(fileName)
            }
        }

        const handleOnRenameFile = (fileName: string) => {
            return () => {
                renameFileForm.setFieldValue('fileName', fileName)
                void modal.confirm({
                    title: '重命名文件',
                    centered: true,
                    maskClosable: true,
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
                                <AntdInput />
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

                                    void r_sys_tool_base_update({
                                        id: record.id,
                                        source: filesToBase64(sourceFiles)
                                    })
                                        .then((res) => {
                                            const response = res.data
                                            switch (response.code) {
                                                case DATABASE_UPDATE_SUCCESS:
                                                    void message.success('重命名成功')
                                                    if (
                                                        editingBaseId === record.id &&
                                                        editingFileName === fileName
                                                    ) {
                                                        setEditingFileName('')
                                                    }
                                                    setTimeout(() => {
                                                        getBaseDetail(record)
                                                    })
                                                    break
                                                default:
                                                    void message.error('重命名失败，请稍后重试')
                                            }
                                        })
                                        .finally(() => {
                                            setBaseDetailLoading({
                                                ...baseDetailLoading,
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
                        title: '确定删除',
                        maskClosable: true,
                        content: `确定删除文件 ${fileName} 吗？`
                    })
                    .then(
                        (confirmed) => {
                            if (confirmed) {
                                setBaseDetailLoading({ ...baseDetailLoading, [record.id]: true })

                                delete sourceFiles![fileName]

                                void r_sys_tool_base_update({
                                    id: record.id,
                                    source: filesToBase64(sourceFiles!)
                                })
                                    .then((res) => {
                                        const response = res.data
                                        switch (response.code) {
                                            case DATABASE_UPDATE_SUCCESS:
                                                void message.success('删除成功')
                                                if (
                                                    editingBaseId === record.id &&
                                                    editingFileName === fileName
                                                ) {
                                                    setEditingFileName('')
                                                }
                                                setTimeout(() => {
                                                    getBaseDetail(record)
                                                })
                                                break
                                            default:
                                                void message.error('删除失败，请稍后重试')
                                        }
                                    })
                                    .finally(() => {
                                        setBaseDetailLoading({
                                            ...baseDetailLoading,
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
                    loading={baseDetailLoading[record.id]}
                    dataSource={sourceFileList}
                    columns={detailColumns}
                    pagination={false}
                    rowKey={(record) => record.name}
                />
            </Card>
        )
    }

    const handleOnChangeFileContent = (_content: string, _fileName: string, files: IFiles) => {
        if (!hasPermission('system:tool:modify:base')) {
            return
        }
        setEditingFiles({ ...editingFiles, [editingBaseId]: files })
        if (!hasEdited[editingBaseId]) {
            setHasEdited({ ...hasEdited, [editingBaseId]: true })
        }
    }

    useEffect(() => {
        try {
            const tsconfigStr = editingFiles[editingBaseId][TS_CONFIG_FILE_NAME].value
            setTsconfig(JSON.parse(tsconfigStr) as ITsconfig)
        } catch (e) {
            /* empty */
        }
    }, [editingFiles, editingBaseId])

    useEffect(() => {
        form.validateFields({ validateOnly: true }).then(
            () => {
                setSubmittable(true)
            },
            () => {
                setSubmittable(false)
            }
        )

        if (!isDrawerEdit && formValues) {
            setNewFormValues({
                name: formValues.name
            })
        }
    }, [formValues])

    useEffect(() => {
        getBase()
    }, [])

    const drawerToolbar = (
        <AntdSpace>
            <AntdButton onClick={handleOnDrawerClose} disabled={isSubmitting}>
                取消
            </AntdButton>
            <AntdButton
                type={'primary'}
                disabled={!submittable}
                loading={isSubmitting}
                onClick={handleOnSubmit}
            >
                提交
            </AntdButton>
        </AntdSpace>
    )

    const addAndEditForm = (
        <AntdForm form={form} disabled={isSubmitting} layout={'vertical'}>
            <AntdForm.Item hidden={!isDrawerEdit} name={'id'} label={'ID'}>
                <AntdInput disabled />
            </AntdForm.Item>
            <AntdForm.Item
                name={'name'}
                label={'名称'}
                rules={[{ required: true, whitespace: false }]}
            >
                <AntdInput allowClear />
            </AntdForm.Item>
        </AntdForm>
    )

    return (
        <>
            <FitFullscreen data-component={'system-tools-base'}>
                <HideScrollbar>
                    <FlexBox direction={'horizontal'} className={'root-content'}>
                        <Card>
                            <AntdTable
                                dataSource={baseData}
                                columns={baseColumns}
                                rowKey={(record) => record.id}
                                loading={isLoading}
                                pagination={false}
                                expandable={{
                                    expandedRowRender,
                                    onExpand: handleOnExpand
                                }}
                            />
                        </Card>
                        {editingFileName && (
                            <Card>
                                <Playground.CodeEditor
                                    files={editingFiles[editingBaseId]}
                                    selectedFileName={editingFileName}
                                    onSelectedFileChange={() => {}}
                                    onChangeFileContent={handleOnChangeFileContent}
                                    showFileSelector={false}
                                    tsconfig={tsconfig}
                                    readonly={
                                        isLoading ||
                                        baseDetailLoading[editingBaseId] ||
                                        !hasPermission('system:tool:modify:base')
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
                    title={isDrawerEdit ? '编辑基板' : '添加基板'}
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
            >
                离开此页面将丢失所有未保存数据，是否继续？
            </AntdModal>
        </>
    )
}

export default Base
