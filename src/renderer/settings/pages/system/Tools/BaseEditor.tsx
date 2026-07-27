import Icon from '@ant-design/icons'
import logo from '$/assets/logo.svg?raw'
import setupGlobalJsVariablesCode from '$/assets/template/setupGlobalJsVariables.js?raw'
import setupGlobalCssVariablesCode from '$/assets/template/setupGlobalCssVariables.js?raw'
import useStyles from '%/assets/css/pages/system/tools/base-editor.style'
import {
    DATABASE_NO_RECORD_FOUND,
    DATABASE_SELECT_SUCCESS,
    DATABASE_UPDATE_SUCCESS
} from '$/constants/common.constants'
import { checkDesktop, message, modal, omitText } from '$/util/common'
import { navigateToToolBase, navigateToToolBaseEditor } from '$/util/navigation'
import editorExtraLibs from '$/util/editorExtraLibs'
import {
    addExtraCssVariables,
    convertObjToJsLiteral,
    formatToolBaseVersion,
    generateThemeCssVariables,
    removeUselessAttributes
} from '$/util/tool'
import {
    r_sys_tool_base_get_one,
    r_sys_tool_base_update_dist,
    r_sys_tool_base_update_source_add,
    r_sys_tool_base_update_source_content,
    r_sys_tool_base_update_source_move,
    r_sys_tool_base_update_source_remove,
    r_sys_tool_base_update_source_rename
} from '$/services/system'
import { CommonContext } from '$/CommonFramework'
import FitFullscreen from '$/components/FitFullscreen'
import Card from '$/components/Card'
import FlexBox from '$/components/FlexBox'
import LoadingMask from '$/components/LoadingMask'
import Compiler from '$/components/Playground/compiler'
import { IFileTree } from '$/components/Playground/shared'
import { getImportMap, getPathByKey, sourceListToFileTree } from '$/components/Playground/files'
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

const BaseEditor = () => {
    const { styles, theme } = useStyles()
    const { isDarkMode } = useContext(CommonContext)
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            currentLocation.pathname !== nextLocation.pathname && hasUnsavedChanges
    )
    const navigate = useNavigate()
    const { id } = useParams()
    const [compileForm] = AntdForm.useForm<{ entryFile: string }>()
    const {
        init,
        fileTree,
        originalFileTree,
        selectedFileKey,
        entryPoint,
        entryPointPath,
        isReadonly,
        hasUnsavedChanges,
        setSelectedFileKey,
        setEntryPoint,
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
    const abortRef = useRef<AbortController | null>(null)
    const [layout, setLayout] = useState<'horizontal' | 'vertical'>(
        window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical'
    )
    const [isLoading, setIsLoading] = useState(false)
    const [toolBaseData, setToolBaseData] = useState<ToolBaseWithSourceVo>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSteps, setSubmitSteps] = useState<_StepProps[]>([])
    const [submitCurrentStep, setSubmitCurrentStep] = useState(0)
    const [submitStatus, setSubmitStatus] = useState<'process' | 'error'>('process')
    const [isShowSubmittingModal, setIsShowSubmittingModal] = useState(false)
    const [processPercent, setProcessPercent] = useState<number>(0)
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

    const handleOnPreview = () => {
        if (previewViewId) {
            void oxygenApi.window.tab.switch(previewViewId)
            return
        }
        oxygenApi.window.tab.create('tool').then(setPreviewViewId)
    }

    const handleOnSave = () => {
        if (isSubmitting || !toolBaseData) {
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

    const SUPPORTED_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js']

    const toTreeDataNode = (tree: IFileTree): _DataNode | null => {
        if (tree.children === undefined) {
            const ext = tree.fileName.slice(tree.fileName.lastIndexOf('.'))
            if (!SUPPORTED_EXTENSIONS.includes(ext)) {
                return null
            }
            return {
                key: tree.key,
                value: tree.key,
                title: tree.fileName,
                selectable: true
            }
        }

        const filteredChildren = tree
            .children!.map((child) => toTreeDataNode(child))
            .filter(Boolean) as _DataNode[]

        if (filteredChildren.length === 0) {
            return null
        }

        return {
            key: tree.key,
            value: tree.key,
            title: tree.fileName || '/',
            children: filteredChildren,
            selectable: false
        }
    }

    const handleOnPublish = () => {
        if (isSubmitting || !toolBaseData || hasUnsavedChanges) {
            return
        }
        setIsSubmitting(true)

        const treeData: _DataNode[] = [toTreeDataNode(fileTree)].filter(Boolean) as _DataNode[]

        compileForm.resetFields()
        void modal.confirm({
            centered: true,
            maskClosable: true,
            title: '编译',
            content: (
                <AntdForm form={compileForm}>
                    <AntdForm.Item
                        name={'entryFile'}
                        label={'入口文件'}
                        style={{ marginTop: 10 }}
                        rules={[{ required: true }]}
                    >
                        <AntdTreeSelect
                            treeData={treeData}
                            treeDefaultExpandedKeys={[treeData[0]?.value]}
                            showSearch
                            placeholder={'请选择入口文件'}
                        />
                    </AntdForm.Item>
                </AntdForm>
            ),
            onOk: () =>
                compileForm.validateFields().then(
                    () => {
                        return new Promise<void>((resolve) => {
                            resolve()
                            setProcessPercent(0)
                            setSubmitSteps([{ title: '编译' }, { title: '上传' }])
                            setSubmitCurrentStep(0)
                            setSubmitStatus('process')
                            setIsShowSubmittingModal(true)
                            const entryFile: string = compileForm.getFieldValue('entryFile')
                            const entryPointPath = getPathByKey(fileTree, entryFile)
                            if (!entryPointPath) {
                                void message.error(`Entry point not found: ${entryFile}`)
                                return
                            }
                            const importMap = getImportMap(fileTree)
                            Compiler.compile(fileTree, importMap, entryPointPath)
                                .then((result) => {
                                    setSubmitCurrentStep(1)
                                    return r_sys_tool_base_update_dist(
                                        toolBaseData.id,
                                        result.outputFiles[0].text,
                                        setProcessPercent
                                    )
                                })
                                .then(async (res) => {
                                    const response = res.data
                                    switch (response.code) {
                                        case DATABASE_UPDATE_SUCCESS:
                                            setIsShowSubmittingModal(false)
                                            await message.success('发布成功')
                                            navigateToToolBaseEditor(
                                                navigate,
                                                toolBaseData.id,
                                                Number(response.data).toString()
                                            )
                                            break
                                        default:
                                            throw Error(response.msg)
                                    }
                                })
                                .catch((e) => {
                                    setIsShowSubmittingModal(false)
                                    void message.error(`编译失败：${e.message ? e.message : e}`)
                                })
                                .finally(() => {
                                    setIsSubmitting(false)
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
                setIsSubmitting(false)
            }
        })
    }

    const handleOnReload = () => {
        getToolBase()
        setIsSubmitting(false)
        setIsShowSubmittingModal(false)
    }

    const handleOnRetry = () => {
        setSubmitStatus('process')
        void sequenceProcessingSave(submitCurrentStep)
    }

    const getToolBase = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)
        void message.loading({ content: '加载中……', key: 'LOADING', duration: 0 })

        r_sys_tool_base_get_one(id!, 0)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS: {
                        const toolBaseVo = response.data!
                        if (!checkDesktop() && toolBaseVo.platform !== 'WEB') {
                            message.error('此基板需要桌面端环境，请在桌面端打开').then(() => {
                                navigateToToolBase(navigate)
                            })
                            throw Error()
                        }
                        return toolBaseVo
                    }
                    case DATABASE_NO_RECORD_FOUND:
                        message.error('未找到指定工具基板').then(() => {
                            navigateToToolBase(navigate)
                        })
                        throw Error()
                    default:
                        throw Error('载入工具基板失败，请稍后重试')
                }
            })
            .then((toolBaseVo) => {
                setToolBaseData(toolBaseVo)
                const fileTree = sourceListToFileTree(toolBaseVo.sources)
                init(fileTree, false, undefined, selectedFileKey)
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
                        const response = await r_sys_tool_base_update_source_add(toolBaseData!.id, {
                            parentNode: resolvedParentNode,
                            fileName,
                            dirNode: dirNode
                        })
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
                        const response = await r_sys_tool_base_update_source_content(
                            toolBaseData!.id,
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
                        const response = await r_sys_tool_base_update_source_rename(
                            toolBaseData!.id,
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
                        const response = await r_sys_tool_base_update_source_move(
                            toolBaseData!.id,
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
                        const response = await r_sys_tool_base_update_source_remove(
                            toolBaseData!.id,
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
        getToolBase()
        setIsSubmitting(false)
        setIsShowSubmittingModal(false)
    }

    useEffect(() => {
        if (!previewViewId || !entryPointPath) {
            return
        }

        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        const timer = setTimeout(() => {
            const importMap = getImportMap(fileTree)
            oxygenApi.window.tab.title(previewViewId, `[编译中] ${toolBaseData!.name}`)
            Compiler.compile(
                fileTree,
                importMap,
                entryPointPath,
                (state, message) =>
                    oxygenApi.window.tab.title(
                        previewViewId,
                        `[编译中] ${state === 'processing' ? omitText(message, 30) : toolBaseData!.name}`
                    ),
                controller.signal
            )
                .then((result) => {
                    if (controller.signal.aborted) {
                        return
                    }

                    const dist = result.outputFiles[0].text
                    oxygenApi.window.tab.icon(
                        previewViewId,
                        `data:image/svg+xml;base64,${btoa(logo)}`
                    )
                    oxygenApi.window.tab.title(previewViewId, `[预览] ${toolBaseData!.name}`)
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
                            convertObjToJsLiteral(
                                generateThemeCssVariables(themeRef.current).styles
                            )
                        ),
                        previewViewId
                    )
                    oxygenApi.tool.view.render(`(() => {${dist}})();`, previewViewId)
                })
                .catch((reason: Error) => {
                    if (controller.signal.aborted) {
                        return
                    }

                    oxygenApi.window.tab.icon(
                        previewViewId,
                        `data:image/svg+xml;base64,${btoa(logo)}`
                    )
                    oxygenApi.window.tab.title(previewViewId, `[编译异常] ${toolBaseData!.name}`)
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
                            convertObjToJsLiteral(
                                generateThemeCssVariables(themeRef.current).styles
                            )
                        ),
                        previewViewId
                    )
                    oxygenApi.tool.view.render(
                        `(() => {
                const element = document.createElement('div')
                element.style.display = 'flex'
                element.style.justifyContent = 'center'
                element.style.alignItems = 'center'
                element.style.color = '#dc4446'
                element.innerText = ${JSON.stringify(reason.stack)}
                document.getElementById('root')?.replaceChildren(element)
                })();`,
                        previewViewId
                    )
                })
        }, 500)

        return () => {
            clearTimeout(timer)
            controller.abort()
        }
    }, [previewViewId, fileTree, entryPointPath])

    useEffect(() => {
        getToolBase()
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
                            title={`${toolBaseData?.name}${hasUnsavedChanges ? '*' : ''}`}
                            subtitle={
                                <>
                                    <AntdTag color={'blue'}>
                                        {`${toolBaseData?.platform.slice(0, 1)}${toolBaseData?.platform.slice(1).toLowerCase()}`}
                                    </AntdTag>
                                    {toolBaseData && (
                                        <AntdTreeSelect
                                            treeData={
                                                [toTreeDataNode(fileTree)].filter(
                                                    Boolean
                                                ) as _DataNode[]
                                            }
                                            value={entryPoint?.length ? entryPoint : undefined}
                                            showSearch
                                            placeholder={'请选择入口文件进行预览'}
                                            style={{ minWidth: 200 }}
                                            onSelect={setEntryPoint}
                                        />
                                    )}
                                </>
                            }
                            onBack={() => navigateToToolBase(navigate)}
                        >
                            <span>
                                <Text strong>版本：</Text>
                                {toolBaseData && formatToolBaseVersion(toolBaseData.version)}
                            </span>
                            {toolBaseData && (
                                <AntdSpace>
                                    <AntdButton
                                        size={'small'}
                                        type={'dashed'}
                                        icon={<Icon component={IconOxygenExecute} />}
                                        loading={isLoading || isSubmitting}
                                        disabled={!entryPointPath}
                                        onClick={handleOnPreview}
                                    >
                                        预览
                                    </AntdButton>
                                    <AntdButton
                                        size={'small'}
                                        icon={<Icon component={IconOxygenSave} />}
                                        disabled={!hasUnsavedChanges}
                                        loading={isLoading || isSubmitting}
                                        onClick={handleOnSave}
                                    >
                                        保存
                                    </AntdButton>
                                    <AntdButton
                                        size={'small'}
                                        type={'primary'}
                                        icon={<Icon component={IconOxygenCompile} />}
                                        disabled={!toolBaseData || hasUnsavedChanges}
                                        loading={isLoading || isSubmitting}
                                        onClick={handleOnPublish}
                                    >
                                        发布
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
                                        readonly={isReadonly}
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
                                    {toolBaseData && (
                                        <Output
                                            isDarkMode={isDarkMode}
                                            fileTree={fileTree}
                                            selectedFileKey={selectedFileKey}
                                        />
                                    )}
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

export default BaseEditor
