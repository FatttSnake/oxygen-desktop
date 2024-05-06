import {
    COLOR_PRODUCTION,
    DATABASE_DELETE_SUCCESS,
    DATABASE_DUPLICATE_KEY,
    DATABASE_INSERT_SUCCESS,
    DATABASE_SELECT_SUCCESS,
    DATABASE_UPDATE_SUCCESS
} from '@/constants/common.constants'
import { utcToLocalTime } from '@/util/datetime'
import {
    r_sys_tool_category_add,
    r_sys_tool_category_delete,
    r_sys_tool_category_get,
    r_sys_tool_category_update
} from '@/services/system'
import Card from '@/components/common/Card'
import Permission from '@/components/common/Permission'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'

const Category = () => {
    const [modal, contextHolder] = AntdModal.useModal()
    const [form] = AntdForm.useForm<ToolCategoryAddEditParam>()
    const formValues = AntdForm.useWatch([], form)
    const [newFormValues, setNewFormValues] = useState<ToolCategoryAddEditParam>()
    const [categoryData, setCategoryData] = useState<ToolCategoryVo[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isDrawerEdit, setIsDrawerEdit] = useState(false)
    const [isSubmittable, setIsSubmittable] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleOnAddBtnClick = () => {
        setIsDrawerEdit(false)
        setIsDrawerOpen(true)
        form.setFieldValue('id', undefined)
        form.setFieldValue('name', newFormValues?.name)
        form.setFieldValue('enable', newFormValues?.enable ?? true)
    }

    const categoryColumns: _ColumnsType<ToolCategoryVo> = [
        {
            title: '名称',
            dataIndex: 'name'
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            width: '20%',
            align: 'center',
            render: (value: string) => utcToLocalTime(value)
        },
        {
            title: '修改时间',
            dataIndex: 'updateTime',
            width: '20%',
            align: 'center',
            render: (value: string) => utcToLocalTime(value)
        },
        {
            title: '状态',
            dataIndex: 'enable',
            width: '5%',
            align: 'center',
            render: (value) =>
                value ? <AntdTag color={'success'}>启用</AntdTag> : <AntdTag>禁用</AntdTag>
        },
        {
            title: (
                <>
                    操作
                    <Permission operationCode={['system:tool:add:category']}>
                        {' '}
                        (
                        <a style={{ color: COLOR_PRODUCTION }} onClick={handleOnAddBtnClick}>
                            新增
                        </a>
                        )
                    </Permission>
                </>
            ),
            width: '15em',
            align: 'center',
            render: (_, record) => (
                <>
                    <AntdSpace size={'middle'}>
                        <Permission operationCode={['system:tool:modify:category']}>
                            <a
                                style={{ color: COLOR_PRODUCTION }}
                                onClick={handleOnEditBtnClick(record)}
                            >
                                编辑
                            </a>
                        </Permission>
                        <Permission operationCode={['system:tool:delete:category']}>
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

    const handleOnEditBtnClick = (value: ToolCategoryVo) => {
        return () => {
            setIsDrawerEdit(true)
            setIsDrawerOpen(true)
            form.setFieldValue('id', value.id)
            form.setFieldValue('name', value.name)
            form.setFieldValue('enable', value.enable)
            void form.validateFields()
        }
    }

    const handleOnDeleteBtnClick = (value: ToolCategoryVo) => {
        return () => {
            modal
                .confirm({
                    centered: true,
                    maskClosable: true,
                    title: '确定删除',
                    content: `确定删除类别 ${value.name} 吗？`
                })
                .then(
                    (confirmed) => {
                        if (confirmed) {
                            setIsLoading(true)

                            void r_sys_tool_category_delete(value.id)
                                .then((res) => {
                                    const response = res.data
                                    if (response.code === DATABASE_DELETE_SUCCESS) {
                                        void message.success('删除成功')
                                        setTimeout(() => {
                                            getCategory()
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

    const handleOnDrawerClose = () => {
        setIsDrawerOpen(false)
    }

    const handleOnSubmit = () => {
        if (isSubmitting) {
            return
        }
        setIsSubmitting(true)

        if (isDrawerEdit) {
            void r_sys_tool_category_update(formValues)
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_UPDATE_SUCCESS:
                            setIsDrawerOpen(false)
                            void message.success('更新成功')
                            getCategory()
                            break
                        case DATABASE_DUPLICATE_KEY:
                            void message.error('已存在相同名称的类别')
                            break
                        default:
                            void message.error('更新失败，请稍后重试')
                    }
                })
                .finally(() => {
                    setIsSubmitting(false)
                })
        } else {
            void r_sys_tool_category_add(formValues)
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_INSERT_SUCCESS:
                            setIsDrawerOpen(false)
                            void message.success('添加成功')
                            setNewFormValues(undefined)
                            getCategory()
                            break
                        case DATABASE_DUPLICATE_KEY:
                            void message.error('已存在相同名称的类别')
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

    const getCategory = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)

        void r_sys_tool_category_get()
            .then((res) => {
                const response = res.data
                if (response.code === DATABASE_SELECT_SUCCESS) {
                    setCategoryData(response.data!)
                } else {
                    void message.error('获取失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

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
                enable: formValues.enable
            })
        }
    }, [formValues])

    useEffect(() => {
        getCategory()
    }, [])

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
            <AntdForm.Item name={'enable'} label={'状态'}>
                <AntdSwitch checkedChildren={'启用'} unCheckedChildren={'禁用'} />
            </AntdForm.Item>
        </AntdForm>
    )

    return (
        <>
            <FitFullscreen data-component={'system-tools-category'}>
                <HideScrollbar
                    style={{ padding: 20 }}
                    isShowVerticalScrollbar
                    autoHideWaitingTime={1000}
                >
                    <Card>
                        <AntdTable
                            dataSource={categoryData}
                            columns={categoryColumns}
                            rowKey={(record) => record.id}
                            loading={isLoading}
                            pagination={false}
                        />
                    </Card>
                </HideScrollbar>
            </FitFullscreen>
            <AntdDrawer
                title={isDrawerEdit ? '编辑类别' : '添加类别'}
                onClose={handleOnDrawerClose}
                open={isDrawerOpen}
                closable={!isSubmitting}
                maskClosable={!isSubmitting}
                extra={drawerToolbar}
            >
                {addAndEditForm}
            </AntdDrawer>
            {contextHolder}
        </>
    )
}

export default Category
