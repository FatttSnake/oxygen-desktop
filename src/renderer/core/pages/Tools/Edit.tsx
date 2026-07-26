import Icon from '@ant-design/icons'
import setupGlobalJsVariablesCode from '$/assets/template/setupGlobalJsVariables.js?raw'
import setupGlobalCssVariablesCode from '$/assets/template/setupGlobalCssVariables.js?raw'
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
    convertObjToJsLiteral,
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
    r_tool_update_source_add,
    r_tool_update_source_content,
    r_tool_update_source_move,
    r_tool_update_source_remove,
    r_tool_update_source_rename,
    r_tool_upgrade_base
} from '$/services/tool'
import { CommonContext } from '$/CommonFramework'
import FitFullscreen from '$/components/FitFullscreen'
import FlexBox from '$/components/FlexBox'
import LoadingMask from '$/components/LoadingMask'
import Card from '$/components/Card'
import Compiler from '$/components/Playground/compiler'
import { getImportMap, sourceListToFileTree } from '$/components/Playground/files'
import CodeEditor from '$/components/Playground/CodeEditor'
import Output from '$/components/Playground/Output'
import {
    computeTreeDiff,
    convertDiffToStepTitle,
    TreeDiffOperation,
    usePlaygroundState
} from '$/hooks/usePlaygroundState'
import ToolBar from '@/components/tools/ToolBar'

const { Text } = AntdTypography

const Edit = () => {
    const { styles, theme } = useStyles()
    const { isDarkMode } = useContext(CommonContext)
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            currentLocation.pathname !== nextLocation.pathname && hasUnsavedChanges
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
        fileTree,
        originalFileTree,
        selectedFileKey,
        entryPointPath,
        hasUnsavedChanges,
        setSelectedFileKey,
        updateFileContent,
        addFile,
        renameFile,
        moveFile,
        removeFile,
        markAsSaved,
        listenOnError
    } = usePlaygroundState()
    const themeRef = useRef(theme)
    const isDarkModeRef = useRef(isDarkMode)
    const previewViewIdRef = useRef<string>()
    const diffRef = useRef<TreeDiffOperation[]>([])
    const nodeIdMapRef = useRef<Map<string, string>>(new Map())
    const [layout, setLayout] = useState<'horizontal' | 'vertical'>(
        window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical'
    )
    const [isLoading, setIsLoading] = useState(false)
    const [toolData, setToolData] = useState<ToolWithSourceVo>()
    const [baseDist, setBaseDist] = useState('')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isSubmittable, setIsSubmittable] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [categoryData, setCategoryData] = useState<ToolCategoryVo[]>()
    const [isLoadingCategory, setIsLoadingCategory] = useState(false)
    const [baseLatestVersion, setBaseLatestVersion] = useState<number>()
    const [submitSteps, setSubmitSteps] = useState<_StepProps[]>([])
    const [submitCurrentStep, setSubmitCurrentStep] = useState(0)
    const [submitStatus, setSubmitStatus] = useState<'process' | 'error'>('process')
    const [isShowSubmittingModal, setIsShowSubmittingModal] = useState(false)
    const [processPercent, setProcessPercent] = useState<number>(0)
    const hasNewBaseVersion =
        !!toolData && !!baseLatestVersion && baseLatestVersion > toolData.base.version
    const [previewViewId, setPreviewViewId] = useState<string>()

    useBeforeUnload(
        useCallback(
            (event) => {
                if (hasUnsavedChanges) {
                    event.preventDefault()
                    event.returnValue = ''
                }
            },
            [hasUnsavedChanges]
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

    const handleOnPreview = () => {
        if (previewViewId) {
            void oxygenApi.window.tab.switch(previewViewId)
            return
        }
        oxygenApi.window.tab.create('tool').then(setPreviewViewId)
    }

    const handleOnSave = () => {
        if (isSubmitting) {
            return
        }
        setIsSubmitting(true)

        diffRef.current = computeTreeDiff(fileTree, originalFileTree)
        if (diffRef.current.length === 0) {
            markAsSaved()
            void message.success('保存成功')
            setIsSubmitting(false)
            return
        }

        nodeIdMapRef.current.clear()
        setSubmitSteps(diffRef.current.map((item) => ({ title: convertDiffToStepTitle(item) })))
        setSubmitCurrentStep(0)
        setSubmitStatus('process')
        setIsShowSubmittingModal(true)

        void sequenceProcessingSave()
    }

    const handleOnReload = () => {
        getTool()
        setIsSubmitting(false)
        setIsShowSubmittingModal(false)
    }

    const handleOnRetry = () => {
        setSubmitStatus('process')
        void sequenceProcessingSave(submitCurrentStep)
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
                                return response.data!
                            case 'PROCESSING':
                                message.warning('工具审核中，请勿修改').then(() => {
                                    navigateToRepository(navigate)
                                })
                                throw Error()
                            default:
                                message.warning('请先创建新版本后编辑工具').then(() => {
                                    navigateToRepository(navigate)
                                })
                                throw Error()
                        }
                    case DATABASE_NO_RECORD_FOUND:
                        message.error('未找到指定工具').then(() => {
                            navigateToRepository(navigate)
                        })
                        throw Error()
                    default:
                        throw Error('载入工具失败，请稍后重试')
                }
            })
            .then((toolVo) => processBaseDist(toolVo.base.id, toolVo.base.version, { toolVo }))
            .then(({ toolVo, toolBaseVo }) => {
                setToolData(toolVo)
                setBaseDist(toolBaseVo.dist.fileContent)
                const fileTree = sourceListToFileTree(toolVo.sources)
                init(fileTree, false, toolVo.entryPoint, selectedFileKey)
                r_tool_base_get_latest_version(toolVo.base.id).then((res) => {
                    const response = res.data
                    if (response.success) {
                        setBaseLatestVersion(response.data!)
                    }
                })
            })
            .catch((e: Error) => {
                console.error(e)
                e?.message && message.error(e.message)
            })
            .finally(() => {
                setIsLoading(false)
                message.destroy('LOADING')
            })
    }

    const sequenceProcessingSave = async (start: number = 0) => {
        const handleSaveError = (code: number) => {
            switch (code) {
                case TOOL_UNDER_REVIEW:
                    markAsSaved()
                    message.error('保存失败：工具审核中').then(() => {
                        navigateToRepository(navigate)
                    })
                    break
                case TOOL_HAS_BEEN_PUBLISHED:
                    markAsSaved()
                    message.error('保存失败：工具已发布').then(() => {
                        navigateToRepository(navigate)
                    })
                    break
                default:
                    setSubmitStatus('error')
            }
        }

        for (let i = start; i < diffRef.current.length; i++) {
            setSubmitCurrentStep(i)
            const operation = diffRef.current[i]
            const { type, fileName, nodeId, dirNode, payload } = operation

            try {
                setProcessPercent(0)
                switch (type) {
                    case 'add': {
                        const parentNode = payload.parentNode as string
                        const resolvedParentNode =
                            nodeIdMapRef.current.get(parentNode) || parentNode
                        const response = await r_tool_update_source_add(toolData!.id, {
                            parentNode: resolvedParentNode,
                            fileName,
                            dirNode: dirNode
                        })
                        const res = response.data
                        if (res.code !== DATABASE_UPDATE_SUCCESS) {
                            handleSaveError(res.code)
                            return
                        }
                        nodeIdMapRef.current.set(nodeId, res.data!)
                        break
                    }
                    case 'content': {
                        const resolvedNodeId = nodeIdMapRef.current.get(nodeId) || nodeId
                        const response = await r_tool_update_source_content(
                            toolData!.id,
                            resolvedNodeId,
                            payload.content as string,
                            setProcessPercent
                        )
                        const res = response.data
                        if (res.code !== DATABASE_UPDATE_SUCCESS) {
                            handleSaveError(res.code)
                            return
                        }
                        break
                    }
                    case 'rename': {
                        const resolvedNodeId = nodeIdMapRef.current.get(nodeId) || nodeId
                        const response = await r_tool_update_source_rename(
                            toolData!.id,
                            resolvedNodeId,
                            fileName
                        )
                        const res = response.data
                        if (res.code !== DATABASE_UPDATE_SUCCESS) {
                            handleSaveError(res.code)
                            return
                        }
                        break
                    }
                    case 'move': {
                        const newParentId = payload.newParentId as string
                        const resolvedNewParentId =
                            nodeIdMapRef.current.get(newParentId) || newParentId
                        const response = await r_tool_update_source_move(
                            toolData!.id,
                            nodeId,
                            resolvedNewParentId
                        )
                        const res = response.data
                        if (res.code !== DATABASE_UPDATE_SUCCESS) {
                            handleSaveError(res.code)
                            return
                        }
                        break
                    }
                    case 'remove': {
                        const response = await r_tool_update_source_remove(toolData!.id, nodeId)
                        const res = response.data
                        if (res.code !== DATABASE_UPDATE_SUCCESS) {
                            handleSaveError(res.code)
                            return
                        }
                        break
                    }
                }
            } catch (e) {
                console.error(e)
                handleSaveError(0)
                return
            }
        }
        void message.success('保存成功')
        getTool()
        setIsSubmitting(false)
        setIsShowSubmittingModal(false)
    }

    useEffect(() => {
        if (!previewViewId || !baseDist.length || !entryPointPath) {
            return
        }

        const importMap = getImportMap(fileTree)
        Compiler.compile(fileTree, importMap, entryPointPath)
            .then((result) => {
                message.destroy('COMPILE')
                const dist = result.outputFiles[0].text
                oxygenApi.window.tab.icon(
                    previewViewId,
                    `data:image/svg+xml;base64,${toolData!.icon}`
                )
                oxygenApi.window.tab.title(previewViewId, `[预览] ${toolData!.name}`)
                oxygenApi.tool.view.render(
                    setupGlobalJsVariablesCode.replace(
                        "'${replace_with_code}'",
                        convertObjToJsLiteral({
                            OxygenTheme: {
                                ...removeUselessAttributes(themeRef.current),
                                isDarkMode: isDarkModeRef.current
                            }
                        })
                    ),
                    previewViewId
                )
                oxygenApi.tool.view.render(
                    setupGlobalCssVariablesCode.replace(
                        "'${replace_with_code}'",
                        convertObjToJsLiteral(generateThemeCssVariables(themeRef.current).styles)
                    ),
                    previewViewId
                )
                oxygenApi.tool.view.render(
                    `(() => {${dist}})();\n(() => {${baseDist}})();`,
                    previewViewId
                )
            })
            .catch((reason: Error) => {
                void message.error({
                    key: 'COMPILE',
                    content: reason.message,
                    duration: 0,
                    style: { maxWidth: 400, margin: '0 auto' }
                })
            })
    }, [previewViewId, fileTree, baseDist])

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

    useEffect(() => {
        themeRef.current = theme
        isDarkModeRef.current = isDarkMode
    }, [theme, isDarkMode])

    useEffect(() => {
        previewViewIdRef.current = previewViewId
    }, [previewViewId])

    useEffect(() => {
        oxygenApi.window.tab.onClosed((viewId) => {
            setPreviewViewId((prevState) => (viewId === prevState ? undefined : prevState))
        })
        const resizeListener = () => {
            setLayout(window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical')
        }
        window.addEventListener('resize', resizeListener)

        return () => {
            oxygenApi.window.tab.offClosed()
            const previewViewId = previewViewIdRef.current
            previewViewId && oxygenApi.window.tab.close(previewViewId)
            window.removeEventListener('resize', resizeListener)
        }
    }, [])

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
                            title={`${toolData?.name}${hasUnsavedChanges ? '*' : ''}`}
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
                                            type={'dashed'}
                                            icon={<Icon component={IconOxygenExecute} />}
                                            loading={isLoading || isSubmitting}
                                            onClick={handleOnPreview}
                                        >
                                            预览
                                        </AntdButton>
                                        <AntdButton
                                            size={'small'}
                                            type={'primary'}
                                            icon={<Icon component={IconOxygenSave} />}
                                            disabled={!hasUnsavedChanges}
                                            loading={isLoading || isSubmitting}
                                            onClick={handleOnSave}
                                        >
                                            保存
                                        </AntdButton>
                                    </AntdSpace>
                                )}
                            </AntdSpace>
                        </ToolBar>
                        <Card>
                            <AntdSplitter layout={layout}>
                                <AntdSplitter.Panel collapsible>
                                    <CodeEditor
                                        isDarkMode={isDarkMode}
                                        fileTree={fileTree}
                                        selectedFileKey={selectedFileKey}
                                        extraLibs={editorExtraLibs}
                                        onEditorDidMount={(_, monaco) =>
                                            addExtraCssVariables(monaco)
                                        }
                                        onSelectedFileChange={setSelectedFileKey}
                                        onChangeFileContent={updateFileContent}
                                        onAddFile={addFile}
                                        onRenameFile={renameFile}
                                        onMoveFile={moveFile}
                                        onRemoveFile={removeFile}
                                        listenOnError={listenOnError}
                                    />
                                </AntdSplitter.Panel>
                                <AntdSplitter.Panel collapsible defaultSize={0}>
                                    <Output
                                        isDarkMode={isDarkMode}
                                        fileTree={fileTree}
                                        selectedFileKey={selectedFileKey}
                                    />
                                </AntdSplitter.Panel>
                            </AntdSplitter>
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
                title={
                    <AntdSpace>
                        <Icon component={IconOxygenSave} />
                        {submitStatus === 'process' ? '保存中' : '保存失败'}
                    </AntdSpace>
                }
                footer={
                    submitStatus === 'process' ? (
                        <></>
                    ) : (
                        <AntdSpace>
                            <AntdButton onClick={handleOnReload}>重新加载</AntdButton>
                            <AntdButton type={'primary'} onClick={handleOnRetry}>
                                重试
                            </AntdButton>
                        </AntdSpace>
                    )
                }
                closable={false}
                open={isShowSubmittingModal}
            >
                <AntdSteps
                    direction={'vertical'}
                    size={'small'}
                    progressDot={(iconDot, { status }) =>
                        status === 'process' ? (
                            processPercent ? (
                                <AntdProgress percent={processPercent} size={12} type={'circle'} />
                            ) : (
                                <Icon component={IconOxygenLoading} spin />
                            )
                        ) : (
                            iconDot
                        )
                    }
                    items={submitSteps}
                    current={submitCurrentStep}
                    status={submitStatus}
                />
            </AntdModal>
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

export default Edit
