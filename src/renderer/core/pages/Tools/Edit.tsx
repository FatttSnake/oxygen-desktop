import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/pages/tools/edit.style'
import {
    DATABASE_NO_RECORD_FOUND,
    DATABASE_SELECT_SUCCESS,
    DATABASE_UPDATE_SUCCESS,
    TOOL_HAS_BEEN_PUBLISHED,
    TOOL_UNDER_REVIEW
} from '$/constants/common.constants'
import { message, modal } from '$/util/common'
import { navigateToRepository } from '$/util/navigation'
import editorExtraLibs from '$/util/editorExtraLibs'
import {
    addExtraCssVariables,
    formatToolBaseVersion,
    generateThemeCssVariables,
    processBaseDist,
    removeUselessAttributes
} from '$/util/tool'
import {
    r_tool_base_get_latest_version,
    r_tool_category_get,
    r_tool_get_source,
    r_tool_update,
    r_tool_update_source,
    r_tool_upgrade_base
} from '$/services/tool'
import { CommonContext } from '$/CommonFramework'
import FitFullscreen from '$/components/FitFullscreen'
import FlexBox from '$/components/FlexBox'
import LoadingMask from '$/components/LoadingMask'
import Card from '$/components/Card'
import Playground from '$/components/Playground'
import { usePlaygroundState } from '$/hooks/usePlaygroundState'
import { base64ToFiles, base64ToStr, filesToBase64 } from '$/components/Playground/files'
import ToolBar from '@/components/tools/ToolBar'

const { Text } = AntdTypography

const Edit = () => {
    const { styles, theme } = useStyles()
    const { isDarkMode } = useContext(CommonContext)
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            currentLocation.pathname !== nextLocation.pathname && hasEdited
    )
    const navigate = useNavigate()
    const { toolId } = useParams()
    const [searchParams] = useSearchParams({
        platform: import.meta.env.VITE_PLATFORM
    })
    const [form] = AntdForm.useForm<ToolUpdateParam>()
    const formValues = AntdForm.useWatch([], form)
    const {
        init,
        files,
        selectedFileName,
        entryPoint,
        importMap,
        tsconfig,
        hasEdited,
        setSelectedFileName,
        updateFileContent,
        addFile,
        renameFile,
        removeFile,
        saveFiles,
        listenOnError
    } = usePlaygroundState()
    const [isLoading, setIsLoading] = useState(false)
    const [toolData, setToolData] = useState<ToolWithSourceVo>()
    const [baseDist, setBaseDist] = useState('')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isSubmittable, setIsSubmittable] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [categoryData, setCategoryData] = useState<ToolCategoryVo[]>()
    const [isLoadingCategory, setIsLoadingCategory] = useState(false)
    const [baseLatestVersion, setBaseLatestVersion] = useState<number>()
    const hasNewBaseVersion =
        !!toolData && !!baseLatestVersion && baseLatestVersion > toolData.base.version

    useBeforeUnload(
        useCallback(
            (event) => {
                if (hasEdited) {
                    event.preventDefault()
                    event.returnValue = ''
                }
            },
            [hasEdited]
        ),
        { capture: true }
    )

    const handleOnUpgradeBase = () => {
        modal
            .confirm({
                centered: true,
                maskClosable: true,
                title: '更新',
                content: `基板将从 ${formatToolBaseVersion(toolData!.base.version)} 更新到 ${formatToolBaseVersion(baseLatestVersion!)}`
            })
            .then(
                (confirmed) => {
                    if (!confirmed || isSubmitting) {
                        return
                    }
                    setIsSubmitting(true)
                    void message.loading({ content: '更新中', key: 'UPGRADING', duration: 0 })

                    r_tool_upgrade_base({
                        id: toolData!.id,
                        baseVersion: baseLatestVersion!
                    })
                        .then((res) => {
                            const response = res.data
                            if (response.success) {
                                void message.success('更新成功')
                                getTool()
                            } else {
                                void message.error('更新失败，请稍后重试')
                            }
                        })
                        .finally(() => {
                            setIsSubmitting(false)
                            message.destroy('UPGRADING')
                        })
                },
                () => {}
            )
    }

    const handleOnSetting = () => {
        setIsDrawerOpen(true)
        form.setFieldValue('icon', toolData?.icon)
        form.setFieldValue('name', toolData?.name)
        form.setFieldValue('description', toolData?.description)
        form.setFieldValue('keywords', toolData?.keywords)
        form.setFieldValue(
            'categories',
            toolData?.categories.map((value) => value.id)
        )
        if (!categoryData || !categoryData.length) {
            getCategory()
        }
        void form.validateFields()
    }

    const handleOnSave = () => {
        if (isSubmitting) {
            return
        }
        setIsSubmitting(true)
        void message.loading({ content: '保存中', key: 'SAVING', duration: 0 })

        r_tool_update_source({
            id: toolData!.id,
            source: filesToBase64(files)
        })
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_UPDATE_SUCCESS:
                        void message.success('保存成功')
                        getTool()
                        break
                    case TOOL_UNDER_REVIEW:
                        message.error('保存失败：工具审核中').then(() => {
                            navigateToRepository(navigate)
                        })
                        break
                    case TOOL_HAS_BEEN_PUBLISHED:
                        message.error('保存失败：工具已发布').then(() => {
                            navigateToRepository(navigate)
                        })
                        break
                    default:
                        void message.error('保存失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsSubmitting(false)
                message.destroy('SAVING')
            })
    }

    const handleOnDrawerClose = () => {
        setIsDrawerOpen(false)
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
            form.setFieldValue('icon', reader.result!.toString().split(',')[1])
            void form.validateFields(['icon'])
        })
        reader.readAsDataURL(file)

        return false
    }

    const handleOnSubmit = () => {
        if (isSubmitting) {
            return
        }
        setIsSubmitting(true)

        r_tool_update({
            ...formValues,
            id: toolData!.id
        })
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_UPDATE_SUCCESS:
                        setIsDrawerOpen(false)
                        void message.success('保存成功')
                        getTool()
                        break
                    case TOOL_UNDER_REVIEW:
                        message.error('保存失败：工具审核中').then(() => {
                            navigateToRepository(navigate)
                        })
                        break
                    case TOOL_HAS_BEEN_PUBLISHED:
                        message.error('保存失败：工具已发布').then(() => {
                            navigateToRepository(navigate)
                        })
                        break
                    default:
                        void message.error('保存失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsSubmitting(false)
            })
    }

    const getCategory = () => {
        if (isLoadingCategory) {
            return
        }
        setIsLoadingCategory(true)

        r_tool_category_get()
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
                setIsLoadingCategory(false)
            })
    }

    const getTool = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)
        void message.loading({ content: '加载中……', key: 'LOADING', duration: 0 })

        r_tool_get_source('!', toolId!, 'latest', searchParams.get('platform') as Platform)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        switch (response.data!.review) {
                            case 'NONE':
                            case 'REJECT':
                                setToolData(response.data!)
                                saveFiles()
                                break
                            case 'PROCESSING':
                                message.warning('工具审核中，请勿修改').then(() => {
                                    navigateToRepository(navigate)
                                })
                                break
                            default:
                                message.warning('请先创建新版本后编辑工具').then(() => {
                                    navigateToRepository(navigate)
                                })
                        }
                        break
                    case DATABASE_NO_RECORD_FOUND:
                        message.error('未找到指定工具').then(() => {
                            navigateToRepository(navigate)
                        })
                        break
                    default:
                        void message.error('获取工具信息失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
                message.destroy('LOADING')
            })
    }

    useEffect(() => {
        if (!toolData) {
            return
        }

        r_tool_base_get_latest_version(toolData.base.id).then((res) => {
            const response = res.data
            if (response.success) {
                setBaseLatestVersion(response.data!)
            }
        })

        try {
            processBaseDist(toolData.base.id, toolData.base.version, {}).then(({ toolBaseVo }) => {
                setBaseDist(base64ToStr(toolBaseVo.dist.data!))
                const files = base64ToFiles(toolData.source.data!)
                init(files, false, toolData.entryPoint, toolData.entryPoint)
            })
        } catch (e) {
            console.error(e)
            void message.error('载入工具失败')
        }
    }, [toolData])

    useEffect(() => {
        form.validateFields({ validateOnly: true }).then(
            () => {
                setIsSubmittable(true)
            },
            () => {
                setIsSubmittable(false)
            }
        )
    }, [formValues])

    useEffect(() => {
        if (!['WEB', 'DESKTOP', 'ANDROID'].includes(searchParams.get('platform')!)) {
            navigateToRepository(navigate)
            return
        }
        getTool()
    }, [toolId, searchParams])

    const drawerToolbar = (
        <AntdSpace>
            <AntdTooltip title={'刷新类别列表'}>
                <AntdButton onClick={getCategory} disabled={isSubmitting}>
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

    const editForm = (
        <AntdForm form={form} disabled={isSubmitting} layout={'vertical'}>
            <AntdForm.Item
                label={'图标'}
                name={'icon'}
                rules={[
                    ({ getFieldValue }) => ({
                        validator() {
                            if (!getFieldValue('icon')) {
                                return Promise.reject(Error('请选择图标'))
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
                            alt={''}
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
                <AntdInput maxLength={20} showCount placeholder={'请输入名称'} />
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
                label={'关键字'}
                tooltip={'工具搜索（每个不超过10个字符）'}
                name={'keywords'}
                rules={[{ required: true }]}
            >
                <AntdSelect mode={'tags'} maxCount={20} placeholder={'请输入关键字'} />
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
                    loading={isLoadingCategory}
                    disabled={isLoadingCategory}
                    placeholder={'请选择类别'}
                />
            </AntdForm.Item>
        </AntdForm>
    )

    return (
        <>
            <FitFullscreen className={styles.root}>
                <LoadingMask hidden={!isLoading}>
                    <FlexBox className={styles.layout} direction={'vertical'}>
                        <ToolBar
                            title={`${toolData?.name}${hasEdited ? '*' : ''}`}
                            subtitle={
                                <AntdTag color={'blue'}>
                                    {`${toolData?.platform.slice(0, 1)}${toolData?.platform.slice(1).toLowerCase()}`}
                                </AntdTag>
                            }
                            onBack={() => navigateToRepository(navigate)}
                        >
                            <AntdSpace>
                                <span>
                                    <Text strong>版本：</Text>
                                    {toolData?.ver}
                                </span>
                                <span>
                                    <Text strong>基板：</Text>
                                    <AntdBadge dot={hasNewBaseVersion}>
                                        <AntdPopconfirm
                                            icon={<></>}
                                            title={
                                                hasNewBaseVersion &&
                                                `新版本：${formatToolBaseVersion(baseLatestVersion)}`
                                            }
                                            okText={'更新'}
                                            trigger={'hover'}
                                            showCancel={false}
                                            disabled={!hasNewBaseVersion}
                                            onConfirm={handleOnUpgradeBase}
                                        >
                                            <AntdSpace>
                                                {toolData?.base.name}
                                                {toolData &&
                                                    formatToolBaseVersion(toolData?.base.version)}
                                            </AntdSpace>
                                        </AntdPopconfirm>
                                    </AntdBadge>
                                </span>
                                {toolData && (
                                    <AntdSpace>
                                        <AntdButton
                                            size={'small'}
                                            icon={<Icon component={IconOxygenSetting} />}
                                            loading={isLoading || isSubmitting}
                                            onClick={handleOnSetting}
                                        >
                                            配置
                                        </AntdButton>
                                        <AntdButton
                                            size={'small'}
                                            type={'primary'}
                                            icon={<Icon component={IconOxygenSave} />}
                                            loading={isLoading || isSubmitting}
                                            onClick={handleOnSave}
                                        >
                                            保存
                                        </AntdButton>
                                    </AntdSpace>
                                )}
                            </AntdSpace>
                        </ToolBar>
                        <Card className={styles.rootBox}>
                            <FlexBox direction={'horizontal'} className={styles.content}>
                                <AntdSplitter>
                                    <AntdSplitter.Panel collapsible>
                                        <Playground.CodeEditor
                                            isDarkMode={isDarkMode}
                                            tsconfig={tsconfig}
                                            files={files}
                                            selectedFileName={selectedFileName}
                                            notRemovableFiles={[entryPoint]}
                                            extraLibs={editorExtraLibs}
                                            onEditorDidMount={(_, monaco) =>
                                                addExtraCssVariables(monaco)
                                            }
                                            onSelectedFileChange={setSelectedFileName}
                                            onChangeFileContent={updateFileContent}
                                            onAddFile={addFile}
                                            onRenameFile={renameFile}
                                            onRemoveFile={removeFile}
                                            listenOnError={listenOnError}
                                        />
                                    </AntdSplitter.Panel>
                                    <AntdSplitter.Panel collapsible>
                                        <Playground.Output
                                            isDarkMode={isDarkMode}
                                            files={files}
                                            selectedFileName={selectedFileName}
                                            importMap={importMap}
                                            entryPoint={entryPoint}
                                            postExpansionCode={baseDist}
                                            globalJsVariables={{
                                                OxygenTheme: {
                                                    ...removeUselessAttributes(theme),
                                                    isDarkMode
                                                }
                                            }}
                                            globalCssVariables={
                                                generateThemeCssVariables(theme).styles
                                            }
                                        />
                                    </AntdSplitter.Panel>
                                </AntdSplitter>
                            </FlexBox>
                        </Card>
                    </FlexBox>
                </LoadingMask>
            </FitFullscreen>
            <AntdDrawer
                title={'配置工具'}
                onClose={handleOnDrawerClose}
                open={isDrawerOpen}
                closable={!isSubmitting}
                maskClosable={true}
                extra={drawerToolbar}
            >
                {editForm}
            </AntdDrawer>
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

export default Edit
