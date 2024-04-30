import Icon from '@ant-design/icons'
import '@/assets/css/pages/tools/create.scss'
import {
    DATABASE_DUPLICATE_KEY,
    DATABASE_INSERT_SUCCESS,
    DATABASE_SELECT_SUCCESS
} from '@/constants/common.constants'
import { navigateToEdit } from '@/util/navigation'
import {
    r_tool_category_get,
    r_tool_create,
    r_tool_template_get,
    r_tool_template_get_one
} from '@/services/tool'
import compiler from '@/components/Playground/compiler'
import { IImportMap } from '@/components/Playground/shared'
import { base64ToFiles, base64ToStr, IMPORT_MAP_FILE_NAME } from '@/components/Playground/files'
import FlexBox from '@/components/common/FlexBox'
import Card from '@/components/common/Card'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import Playground from '@/components/Playground'

const Create = () => {
    const navigate = useNavigate()
    const [form] = AntdForm.useForm<ToolCreateParam>()
    const formValues = AntdForm.useWatch([], form)
    const [templateData, setTemplateData] = useState<ToolTemplateVo[]>()
    const [categoryData, setCategoryData] = useState<ToolCategoryVo[]>()
    const [templateDetailData, setTemplateDetailData] = useState<Record<string, ToolTemplateVo>>({})
    const [previewTemplate, setPreviewTemplate] = useState('')
    const [loadingTemplate, setLoadingTemplate] = useState(false)
    const [loadingCategory, setLoadingCategory] = useState(false)
    const [creating, setCreating] = useState(false)
    const [compiledCode, setCompiledCode] = useState('')

    const handleOnFinish = (toolAddParam: ToolCreateParam) => {
        setCreating(true)

        void r_tool_create(toolAddParam)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_INSERT_SUCCESS:
                        void message.success(
                            `创建工具 ${response.data!.name}<${response.data!.toolId}:${response.data!.platform.slice(0, 1)}${response.data!.platform.slice(1).toLowerCase()}:${response.data!.ver}> 成功`
                        )
                        navigateToEdit(navigate, response.data!.toolId, response.data!.platform)
                        break
                    case DATABASE_DUPLICATE_KEY:
                        void message.warning('已存在相同 ID 的应用')
                        setCreating(false)
                        break
                    default:
                        void message.error('创建失败，请稍后重试')
                        setCreating(false)
                }
            })
            .catch(() => {
                setCreating(false)
            })
    }

    const handleOnIconBeforeUpload = (
        file: Parameters<_GetProp<_UploadProps, 'beforeUpload'>>[0]
    ) => {
        if (file.type !== 'image/svg+xml') {
            void message.error('仅支持 svg 文件')
            return false
        }
        if (file.size / 1024 / 1024 > 2) {
            void message.error('文件大小不能大于2MiB')
        }

        const reader = new FileReader()
        reader.addEventListener('load', () => {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            form.setFieldValue('icon', reader.result!.toString().split(',')[1])
            void form.validateFields(['icon'])
        })
        reader.readAsDataURL(file)

        return false
    }

    const handleOnPlatformChange = (value: string) => {
        setLoadingTemplate(true)
        void r_tool_template_get({
            platform: value
        })
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        setTemplateData(response.data!)
                        response.data?.length
                            ? form.setFieldValue('templateId', response.data?.[0].id)
                            : form.setFieldValue('templateId', null)
                        response.data?.length && handleOnTemplateChange(response.data?.[0].id)
                        break
                    default:
                        void message.error('获取模板列表失败，请稍后重试')
                }
            })
            .finally(() => {
                setLoadingTemplate(false)
            })
    }

    const handleOnTemplateChange = (value: string) => {
        setPreviewTemplate(value)
        if (templateDetailData[value]) {
            return
        }

        setLoadingTemplate(true)
        void r_tool_template_get_one(value)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        setTemplateDetailData({ ...templateDetailData, [value]: response.data! })
                        break
                    default:
                        void message.error('获取模板信息失败')
                }
            })
            .finally(() => {
                setLoadingTemplate(false)
            })
    }

    useEffect(() => {
        const template = templateDetailData[previewTemplate]
        if (!template) {
            return
        }
        setCompiledCode('')
        try {
            const baseDist = base64ToStr(template.base.dist.data!)
            const files = base64ToFiles(template.source.data!)
            const importMap = JSON.parse(files[IMPORT_MAP_FILE_NAME].value) as IImportMap

            void compiler
                .compile(files, importMap, template.entryPoint)
                .then((result) => {
                    const output = result.outputFiles[0].text
                    setCompiledCode(`${output}\n${baseDist}`)
                })
                .catch((reason) => {
                    void message.error(`编译失败：${reason}`)
                    setCompiledCode(baseDist)
                })
        } catch (e) {
            void message.error(`载入模板 ${templateDetailData[previewTemplate].name} 失败`)
        }
    }, [templateDetailData, previewTemplate])

    useEffect(() => {
        const temp: string[] = []
        formValues?.keywords.forEach((item) => {
            if (item.length <= 10) {
                temp.push(item)
            }
        })
        form.setFieldValue('keyword', temp)
    }, [form, formValues?.keywords])

    useEffect(() => {
        setLoadingCategory(true)
        void r_tool_category_get()
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        setCategoryData(response.data!)
                        break
                    default:
                        void message.error('获取类别列表失败，请稍后重试')
                }
            })
            .finally(() => {
                setLoadingCategory(false)
            })
    }, [])

    return (
        <FitFullscreen data-component={'tools-create'}>
            <FlexBox direction={'horizontal'} className={'root-content'}>
                <FlexBox>
                    <Card className={'title'}>
                        <FlexBox>配置</FlexBox>
                    </Card>
                    <Card className={'config'}>
                        <HideScrollbar>
                            <div className={'config-content'}>
                                <AntdForm
                                    form={form}
                                    layout={'vertical'}
                                    onFinish={handleOnFinish}
                                    disabled={creating}
                                >
                                    <AntdForm.Item
                                        label={'图标'}
                                        name={'icon'}
                                        rules={[
                                            ({ getFieldValue }) => ({
                                                validator() {
                                                    if (!getFieldValue('icon')) {
                                                        return Promise.reject(
                                                            new Error('请选择图标')
                                                        )
                                                    }
                                                    return Promise.resolve()
                                                }
                                            })
                                        ]}
                                        getValueFromEvent={() => {}}
                                    >
                                        <AntdUpload
                                            listType={'picture-card'}
                                            showUploadList={false}
                                            beforeUpload={handleOnIconBeforeUpload}
                                            accept={'image/svg+xml'}
                                        >
                                            {formValues?.icon ? (
                                                <img
                                                    src={`data:image/svg+xml;base64,${formValues.icon}`}
                                                    alt={'icon'}
                                                    style={{ width: '100%' }}
                                                />
                                            ) : (
                                                <Icon component={IconOxygenPlus} />
                                            )}
                                        </AntdUpload>
                                    </AntdForm.Item>
                                    <AntdForm.Item name={'icon'} hidden>
                                        <AntdInput />
                                    </AntdForm.Item>
                                    <AntdForm.Item
                                        label={'名称'}
                                        name={'name'}
                                        rules={[{ required: true, whitespace: true }]}
                                    >
                                        <AntdInput
                                            maxLength={20}
                                            showCount
                                            placeholder={'请输入名称'}
                                        />
                                    </AntdForm.Item>
                                    <AntdForm.Item
                                        label={'工具 ID'}
                                        name={'toolId'}
                                        rules={[
                                            { required: true, whitespace: true },
                                            {
                                                pattern: /^[a-zA-Z-_][0-9a-zA-Z-_]{2,19}$/,
                                                message:
                                                    '只能包含字母、数字、连字符和下划线，不能以数字开头'
                                            }
                                        ]}
                                    >
                                        <AntdInput
                                            maxLength={20}
                                            showCount
                                            placeholder={'请输入工具 ID'}
                                        />
                                    </AntdForm.Item>
                                    <AntdForm.Item
                                        label={'平台'}
                                        name={'platform'}
                                        rules={[{ required: true, whitespace: true }]}
                                    >
                                        <AntdSelect
                                            onChange={handleOnPlatformChange}
                                            placeholder={'请选择平台'}
                                        >
                                            <AntdSelect.Option key={'WEB'}>Web</AntdSelect.Option>
                                            <AntdSelect.Option key={'DESKTOP'}>
                                                Desktop
                                            </AntdSelect.Option>
                                            <AntdSelect.Option key={'ANDROID'}>
                                                Android
                                            </AntdSelect.Option>
                                        </AntdSelect>
                                    </AntdForm.Item>
                                    <AntdForm.Item label={'简介'} name={'description'}>
                                        <AntdInput.TextArea
                                            autoSize={{ minRows: 6, maxRows: 6 }}
                                            maxLength={200}
                                            showCount
                                            placeholder={'请输入简介'}
                                        />
                                    </AntdForm.Item>
                                    <AntdForm.Item
                                        label={'版本'}
                                        name={'ver'}
                                        rules={[
                                            { required: true, whitespace: true },
                                            {
                                                pattern: /^\d+\.\d+\.\d+$/,
                                                message: `格式必须为 '<数字>.<数字>.<数字>', eg. 1.0.3`
                                            }
                                        ]}
                                    >
                                        <AntdInput
                                            maxLength={10}
                                            showCount
                                            placeholder={'请输入版本'}
                                        />
                                    </AntdForm.Item>
                                    <AntdForm.Item
                                        label={'模板'}
                                        name={'templateId'}
                                        rules={[{ required: true, whitespace: true }]}
                                    >
                                        <AntdSelect
                                            options={templateData?.map((value) => ({
                                                value: value.id,
                                                label: value.name
                                            }))}
                                            loading={loadingTemplate}
                                            disabled={loadingTemplate}
                                            onChange={handleOnTemplateChange}
                                            placeholder={'请选择模板'}
                                        />
                                    </AntdForm.Item>
                                    <AntdForm.Item
                                        label={'关键字'}
                                        tooltip={'工具搜索（每个不超过10个字符）'}
                                        name={'keywords'}
                                        rules={[{ required: true }]}
                                    >
                                        <AntdSelect
                                            mode={'tags'}
                                            maxCount={20}
                                            placeholder={'请输入关键字'}
                                        />
                                    </AntdForm.Item>
                                    <AntdForm.Item
                                        label={'类别'}
                                        tooltip={'工具分类'}
                                        name={'categories'}
                                        rules={[{ required: true }]}
                                    >
                                        <AntdSelect
                                            mode={'multiple'}
                                            options={categoryData?.map((value) => ({
                                                value: value.id,
                                                label: value.name
                                            }))}
                                            loading={loadingCategory}
                                            disabled={loadingCategory}
                                            placeholder={'请选择类别'}
                                        />
                                    </AntdForm.Item>
                                    <AntdForm.Item>
                                        <AntdButton
                                            className={'create-bt'}
                                            type={'primary'}
                                            htmlType={'submit'}
                                            loading={creating}
                                        >
                                            创建
                                        </AntdButton>
                                    </AntdForm.Item>
                                </AntdForm>
                            </div>
                        </HideScrollbar>
                    </Card>
                </FlexBox>
                <FlexBox>
                    <Card className={'title'}>
                        <FlexBox>预览</FlexBox>
                    </Card>
                    <Card className={'preview'}>
                        {compiledCode ? (
                            <Playground.Output.Preview.Render
                                iframeKey={previewTemplate}
                                compiledCode={compiledCode}
                                mobileMode={formValues.platform === 'ANDROID'}
                            />
                        ) : (
                            <span className={'no-preview'}>暂无预览</span>
                        )}
                    </Card>
                </FlexBox>
            </FlexBox>
        </FitFullscreen>
    )
}

export default Create
