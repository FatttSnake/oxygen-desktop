import Icon from '@ant-design/icons'
import logo from '$/assets/logo.svg?raw'
import setupGlobalJsVariablesCode from '$/assets/template/setupGlobalJsVariables.js?raw'
import setupGlobalCssVariablesCode from '$/assets/template/setupGlobalCssVariables.js?raw'
import useStyles from '%/assets/css/pages/system/tools/template-editor.style'
import {
    DATABASE_NO_RECORD_FOUND,
    DATABASE_SELECT_SUCCESS,
    DATABASE_UPDATE_SUCCESS
} from '$/constants/common.constants'
import { checkDesktop, message, modal } from '$/util/common'
import { navigateToToolTemplate } from '$/util/navigation'
import {
    addExtraCssVariables,
    convertObjToJsLiteral,
    formatToolBaseVersion,
    generateThemeCssVariables,
    processBaseDist,
    removeUselessAttributes
} from '$/util/tool'
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
    const [toolTemplateData, setToolTemplateData] = useState<ToolTemplateWithSourceVo>()
    const [baseDist, setBaseDist] = useState('')
    const [baseLatestVersion, setBaseLatestVersion] = useState<number>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [updateSourceSteps, setUpdateSourceSteps] = useState<_StepProps[]>([])
    const [updateSourceCurrentStep, setUpdateSourceCurrentStep] = useState(0)
    const [isShowSavingModal, setIsShowSavingModal] = useState(false)
    const [savingStatus, setSavingStatus] = useState<'process' | 'error'>('process')
    const hasNewBaseVersion =
        !!toolTemplateData &&
        !!baseLatestVersion &&
        baseLatestVersion > toolTemplateData.base.version
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
        setUpdateSourceSteps(
            diffRef.current.map((item) => ({ title: convertDiffToStepTitle(item) }))
        )
        setSavingStatus('process')
        setUpdateSourceCurrentStep(0)
        setIsShowSavingModal(true)

        void sequenceProcessingSave()
    }

    const handleOnReload = () => {
        getToolTemplate()
        setIsSubmitting(false)
        setIsShowSavingModal(false)
    }

    const handleOnRetry = () => {
        setSavingStatus('process')
        void sequenceProcessingSave(updateSourceCurrentStep)
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
                            message.error('此应用需要桌面端环境，请在桌面端打开').then(() => {
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
            .then((toolTemplateVo) =>
                processBaseDist(toolTemplateVo.base.id, toolTemplateVo.base.version, {
                    toolTemplateVo
                })
            )
            .then(({ toolTemplateVo, toolBaseVo }) => {
                setToolTemplateData(toolTemplateVo)
                setBaseDist(toolBaseVo.dist.fileContent)
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
            setUpdateSourceCurrentStep(i)
            const operation = diffRef.current[i]
            const { type, fileName, nodeId, dirNode, payload } = operation

            try {
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
                            setSavingStatus('error')
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
                            payload.content as string
                        )
                        const res = response.data
                        if (res.code !== DATABASE_UPDATE_SUCCESS) {
                            setSavingStatus('error')
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
                            setSavingStatus('error')
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
                            setSavingStatus('error')
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
                            setSavingStatus('error')
                            return
                        }
                        break
                    }
                }
            } catch (e) {
                console.error(e)
                setSavingStatus('error')
                return
            }
        }
        void message.success('保存成功')
        getToolTemplate()
        setIsSubmitting(false)
        setIsShowSavingModal(false)
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
                oxygenApi.window.tab.icon(previewViewId, `data:image/svg+xml;base64,${btoa(logo)}`)
                oxygenApi.window.tab.title(previewViewId, `[预览] ${toolTemplateData!.name}`)
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
        getToolTemplate()
    }, [id])

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
                        {savingStatus === 'process' ? '保存中' : '保存失败'}
                    </AntdSpace>
                }
                footer={
                    savingStatus === 'process' ? (
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
                open={isShowSavingModal}
            >
                <AntdSteps
                    direction={'vertical'}
                    size={'small'}
                    progressDot={(iconDot, { status }) =>
                        status === 'process' ? <Icon component={IconOxygenLoading} spin /> : iconDot
                    }
                    items={updateSourceSteps}
                    current={updateSourceCurrentStep}
                    status={savingStatus}
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
