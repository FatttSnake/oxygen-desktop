import Icon from '@ant-design/icons'
import useStyles from '%/assets/css/pages/system/tools/template-editor.style'
import {
    DATABASE_NO_RECORD_FOUND,
    DATABASE_SELECT_SUCCESS,
    DATABASE_UPDATE_SUCCESS
} from '$/constants/common.constants'
import { checkDesktop, message, modal } from '$/util/common'
import { navigateToToolTemplate } from '$/util/navigation'
import { addExtraCssVariables, formatToolBaseVersion } from '$/util/tool'
import editorExtraLibs from '$/util/editorExtraLibs'
import {
    r_sys_tool_template_get_one,
    r_sys_tool_template_update_source_add,
    r_sys_tool_template_update_source_content,
    r_sys_tool_template_update_source_move,
    r_sys_tool_template_update_source_remove,
    r_sys_tool_template_update_source_rename,
    r_sys_tool_template_upgrade_base
} from '$/services/system'
import { r_tool_base_get_latest_version } from '$/services/tool'
import { CommonContext } from '$/CommonFramework'
import FitFullscreen from '$/components/FitFullscreen'
import LoadingMask from '$/components/LoadingMask'
import FlexBox from '$/components/FlexBox'
import Card from '$/components/Card'
import { sourceListToFileTree } from '$/components/Playground/files'
import CodeEditor from '$/components/Playground/CodeEditor'
import Output from '$/components/Playground/Output'
import {
    computeTreeDiff,
    convertDiffToStepTitle,
    TreeDiffOperation,
    usePlaygroundState
} from '$/hooks/usePlaygroundState'
import { useCompilePreview } from '$/hooks/useCompilePreview'
import ToolBar from '@/components/tools/ToolBar'

const { Text } = AntdTypography

const TemplateEditor = () => {
    const { styles, theme } = useStyles()
    const { isDarkMode } = useContext(CommonContext)
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            currentLocation.pathname !== nextLocation.pathname && hasUnsavedChanges
    )
    const navigate = useNavigate()
    const { id } = useParams()
    const {
        init,
        fileTree,
        originalFileTree,
        selectedFileKey,
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
    const diffRef = useRef<TreeDiffOperation[]>([])
    const nodeIdMapRef = useRef<Map<string, string>>(new Map())
    const [layout, setLayout] = useState<'horizontal' | 'vertical'>(
        window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical'
    )
    const [isLoading, setIsLoading] = useState(false)
    const [toolTemplateData, setToolTemplateData] = useState<ToolTemplateWithSourceVo>()
    const [baseLatestVersion, setBaseLatestVersion] = useState<number>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSteps, setSubmitSteps] = useState<_StepProps[]>([])
    const [submitCurrentStep, setSubmitCurrentStep] = useState(0)
    const [submitStatus, setSubmitStatus] = useState<'process' | 'error'>('process')
    const [isShowSubmittingModal, setIsShowSubmittingModal] = useState(false)
    const [processPercent, setProcessPercent] = useState<number>(0)
    const hasNewBaseVersion =
        !!toolTemplateData &&
        !!baseLatestVersion &&
        baseLatestVersion > toolTemplateData.base.version
    const { isPreviewOpen, openPreview, openDevTools } = useCompilePreview(
        theme,
        isDarkMode,
        toolTemplateData?.name,
        toolTemplateData?.sources,
        fileTree,
        toolTemplateData?.entryPoint,
        toolTemplateData?.base
    )

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
                content: `基板 ${toolTemplateData?.base.name} 将从 ${formatToolBaseVersion(toolTemplateData!.base.version)} 更新到 ${formatToolBaseVersion(baseLatestVersion!)}`
            })
            .then(
                (confirmed) => {
                    if (!confirmed || isSubmitting) {
                        return
                    }
                    setIsSubmitting(true)
                    void message.loading({ content: '更新中', key: 'UPGRADING', duration: 0 })

                    r_sys_tool_template_upgrade_base({
                        id: toolTemplateData!.id,
                        baseVersion: baseLatestVersion!
                    })
                        .then((res) => {
                            const response = res.data
                            if (response.success) {
                                void message.success('更新成功')
                                getToolTemplate()
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
        getToolTemplate()
        setIsSubmitting(false)
        setIsShowSubmittingModal(false)
    }

    const handleOnRetry = () => {
        setSubmitStatus('process')
        void sequenceProcessingSave(submitCurrentStep)
    }

    const getToolTemplate = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)
        void message.loading({ content: '加载中', key: 'LOADING', duration: 0 })

        r_sys_tool_template_get_one(id!)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS: {
                        const toolTemplateVo = response.data!
                        if (!checkDesktop() && toolTemplateVo.platform !== 'WEB') {
                            message.error('此模板需要桌面端环境，请在桌面端打开').then(() => {
                                navigateToToolTemplate(navigate)
                            })
                            throw Error()
                        }
                        return toolTemplateVo
                    }
                    case DATABASE_NO_RECORD_FOUND:
                        message.error('未找到指定工具模板').then(() => {
                            navigateToToolTemplate(navigate)
                        })
                        throw Error()
                    default:
                        throw Error('载入工具模板失败，请稍后重试')
                }
            })
            .then((toolTemplateVo) => {
                setToolTemplateData(toolTemplateVo)
                const fileTree = sourceListToFileTree(toolTemplateVo.sources)
                init(fileTree, false, toolTemplateVo.entryPoint, selectedFileKey)
                r_tool_base_get_latest_version(toolTemplateVo.base.id).then((res) => {
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
                        const response = await r_sys_tool_template_update_source_add(
                            toolTemplateData!.id,
                            {
                                parentNode: resolvedParentNode,
                                fileName,
                                dirNode: dirNode
                            }
                        )
                        const res = response.data
                        if (res.code !== DATABASE_UPDATE_SUCCESS) {
                            setSubmitStatus('error')
                            return
                        }
                        nodeIdMapRef.current.set(nodeId, res.data!)
                        break
                    }
                    case 'content': {
                        const resolvedNodeId = nodeIdMapRef.current.get(nodeId) || nodeId
                        const response = await r_sys_tool_template_update_source_content(
                            toolTemplateData!.id,
                            resolvedNodeId,
                            payload.content as string,
                            setProcessPercent
                        )
                        const res = response.data
                        if (res.code !== DATABASE_UPDATE_SUCCESS) {
                            setSubmitStatus('error')
                            return
                        }
                        break
                    }
                    case 'rename': {
                        const resolvedNodeId = nodeIdMapRef.current.get(nodeId) || nodeId
                        const response = await r_sys_tool_template_update_source_rename(
                            toolTemplateData!.id,
                            resolvedNodeId,
                            fileName
                        )
                        const res = response.data
                        if (res.code !== DATABASE_UPDATE_SUCCESS) {
                            setSubmitStatus('error')
                            return
                        }
                        break
                    }
                    case 'move': {
                        const newParentId = payload.newParentId as string
                        const resolvedNewParentId =
                            nodeIdMapRef.current.get(newParentId) || newParentId
                        const response = await r_sys_tool_template_update_source_move(
                            toolTemplateData!.id,
                            nodeId,
                            resolvedNewParentId
                        )
                        const res = response.data
                        if (res.code !== DATABASE_UPDATE_SUCCESS) {
                            setSubmitStatus('error')
                            return
                        }
                        break
                    }
                    case 'remove': {
                        const response = await r_sys_tool_template_update_source_remove(
                            toolTemplateData!.id,
                            nodeId
                        )
                        const res = response.data
                        if (res.code !== DATABASE_UPDATE_SUCCESS) {
                            setSubmitStatus('error')
                            return
                        }
                        break
                    }
                }
            } catch (e) {
                console.error(e)
                setSubmitStatus('error')
                return
            }
        }
        void message.success('保存成功')
        getToolTemplate()
        setIsSubmitting(false)
        setIsShowSubmittingModal(false)
    }

    useEffect(() => {
        getToolTemplate()
    }, [id])

    useEffect(() => {
        const resizeListener = () => {
            setLayout(window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical')
        }
        window.addEventListener('resize', resizeListener)

        return () => {
            window.removeEventListener('resize', resizeListener)
        }
    }, [])

    return (
        <>
            <FitFullscreen className={styles.root}>
                <LoadingMask hidden={!isLoading}>
                    <FlexBox className={styles.layout} direction={'vertical'}>
                        <ToolBar
                            title={`${toolTemplateData?.name}${hasUnsavedChanges ? '*' : ''}`}
                            subtitle={
                                <AntdTag color={'blue'}>
                                    {`${toolTemplateData?.platform.slice(0, 1)}${toolTemplateData?.platform.slice(1).toLowerCase()}`}
                                </AntdTag>
                            }
                            onBack={() => navigateToToolTemplate(navigate)}
                        >
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
                                            {toolTemplateData?.base.name}
                                            {toolTemplateData &&
                                                formatToolBaseVersion(
                                                    toolTemplateData.base.version
                                                )}
                                        </AntdSpace>
                                    </AntdPopconfirm>
                                </AntdBadge>
                            </span>
                            {toolTemplateData && (
                                <AntdSpace>
                                    <AntdTooltip
                                        title={
                                            isPreviewOpen && (
                                                <AntdButton size={'small'} onClick={openDevTools}>
                                                    调试
                                                </AntdButton>
                                            )
                                        }
                                    >
                                        <AntdButton
                                            size={'small'}
                                            type={'dashed'}
                                            icon={<Icon component={IconOxygenExecute} />}
                                            loading={isLoading || isSubmitting}
                                            onClick={openPreview}
                                        >
                                            预览
                                        </AntdButton>
                                    </AntdTooltip>
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

export default TemplateEditor
