import Icon from '@ant-design/icons'
import useStyles from '%/assets/css/pages/system/tools/base-editor.style'
import {
    DATABASE_NO_RECORD_FOUND,
    DATABASE_SELECT_SUCCESS,
    DATABASE_UPDATE_SUCCESS
} from '$/constants/common.constants'
import { message, modal } from '$/util/common'
import { navigateToToolBase, navigateToToolBaseEditor } from '$/util/navigation'
import editorExtraLibs from '$/util/editorExtraLibs'
import { addExtraCssVariables, formatToolBaseVersion } from '$/util/tool'
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
import { getImportMap, sourceListToFileTree } from '$/components/Playground/files'
import CodeEditor from '$/components/Playground/CodeEditor'
import {
    computeTreeDiff,
    convertDiffToStepTitle,
    TreeDiffOperation,
    usePlaygroundState
} from '$/hooks/usePlaygroundState'
import ToolBar from '@/components/tools/ToolBar'

const { Text } = AntdTypography

const BaseEditor = () => {
    const { styles } = useStyles()
    const { isDarkMode } = useContext(CommonContext)
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            currentLocation.pathname !== nextLocation.pathname && hasUnsavedChanges
    )
    const navigate = useNavigate()
    const { id, version } = useParams()
    const [compileForm] = AntdForm.useForm<{ entryFilePath: string }>()
    const {
        init,
        fileTree,
        originalFileTree,
        selectedFileKey,
        isReadonly,
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
    const [isLoading, setIsLoading] = useState(false)
    const [toolBaseData, setToolBaseData] = useState<ToolBaseWithSourceVo>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCompiling, setIsCompiling] = useState(false)
    const [updateSourceSteps, setUpdateSourceSteps] = useState<_StepProps[]>([])
    const [updateSourceCurrentStep, setUpdateSourceCurrentStep] = useState(0)
    const [isShowSavingModal, setIsShowSavingModal] = useState(false)
    const [savingStatus, setSavingStatus] = useState<'process' | 'error'>('process')

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
        setUpdateSourceSteps(
            diffRef.current.map((item) => ({ title: convertDiffToStepTitle(item) }))
        )
        setSavingStatus('process')
        setUpdateSourceCurrentStep(0)
        setIsShowSavingModal(true)

        void sequenceProcessingSave()
    }

    const SUPPORTED_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js']

    const toTreeDataNode = (tree: IFileTree, parentPath = ''): _DataNode | null => {
        const currentPath = parentPath ? `${parentPath}/${tree.fileName}` : tree.fileName || '/'
        const isLeaf = tree.children === undefined

        if (isLeaf) {
            const ext = tree.fileName.slice(tree.fileName.lastIndexOf('.'))
            if (!SUPPORTED_EXTENSIONS.includes(ext)) {
                return null
            }
            return {
                key: currentPath,
                value: currentPath,
                title: tree.fileName,
                selectable: true
            }
        }

        const filteredChildren = tree
            .children!.map((child) => toTreeDataNode(child, currentPath))
            .filter(Boolean) as _DataNode[]

        if (filteredChildren.length === 0) {
            return null
        }

        return {
            key: currentPath,
            value: currentPath,
            title: tree.fileName || '/',
            children: filteredChildren,
            selectable: false
        }
    }

    const handleOnPublish = () => {
        if (isSubmitting || isCompiling || !toolBaseData || hasUnsavedChanges) {
            return
        }

        const treeData: _DataNode[] = [toTreeDataNode(fileTree)].filter(Boolean) as _DataNode[]

        compileForm.resetFields()
        void modal.confirm({
            centered: true,
            maskClosable: true,
            title: '编译',
            content: (
                <AntdForm form={compileForm}>
                    <AntdForm.Item
                        name={'entryFilePath'}
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
                            const entryFilePath: string = compileForm.getFieldValue('entryFilePath')
                            const entryPointPath = entryFilePath.replace(/^\/+/, '')
                            setIsCompiling(true)
                            void message.loading({
                                content: '编译中',
                                key: 'COMPILING',
                                duration: 0
                            })
                            const importMap = getImportMap(fileTree)
                            Compiler.compile(fileTree, importMap, entryPointPath)
                                .then((result) => {
                                    message.destroy('COMPILING')
                                    void message.loading({
                                        content: '上传中',
                                        key: 'UPLOADING',
                                        duration: 0
                                    })
                                    return r_sys_tool_base_update_dist(
                                        toolBaseData.id,
                                        result.outputFiles[0].text
                                    )
                                })
                                .then(async (res) => {
                                    const response = res.data
                                    switch (response.code) {
                                        case DATABASE_UPDATE_SUCCESS:
                                            message.destroy('UPLOADING')
                                            await message.success('编译成功')
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
                                    void message.error(`编译失败：${e.message ? e.message : e}`)
                                })
                                .finally(() => {
                                    message.destroy('COMPILING')
                                    message.destroy('UPLOADING')
                                    setIsCompiling(false)
                                })
                        })
                    },
                    () => {
                        return new Promise((_, reject) => {
                            reject('请选择入口文件')
                        })
                    }
                )
        })
    }

    const handleOnReload = () => {
        getToolBase()
        setIsSubmitting(false)
        setIsShowSavingModal(false)
    }

    const handleOnRetry = () => {
        setSavingStatus('process')
        void sequenceProcessingSave(updateSourceCurrentStep)
    }

    const getToolBase = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)
        void message.loading({ content: '加载中……', key: 'LOADING', duration: 0 })

        r_sys_tool_base_get_one(id!, version ?? '0')
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        return response.data!
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
                init(fileTree, !!version, undefined, selectedFileKey)
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
                        const response = await r_sys_tool_base_update_source_add(toolBaseData!.id, {
                            parentNode: resolvedParentNode,
                            fileName,
                            dirNode: dirNode
                        })
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
                        const response = await r_sys_tool_base_update_source_content(
                            toolBaseData!.id,
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
                        const response = await r_sys_tool_base_update_source_rename(
                            toolBaseData!.id,
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
                        const response = await r_sys_tool_base_update_source_move(
                            toolBaseData!.id,
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
                        const response = await r_sys_tool_base_update_source_remove(
                            toolBaseData!.id,
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
        getToolBase()
        setIsSubmitting(false)
        setIsShowSavingModal(false)
    }

    useEffect(() => {
        getToolBase()
    }, [id, version])

    return (
        <>
            <FitFullscreen className={styles.root}>
                <LoadingMask hidden={!isLoading}>
                    <FlexBox className={styles.layout} direction={'vertical'}>
                        <ToolBar
                            title={`${toolBaseData?.name}${hasUnsavedChanges ? '*' : ''}`}
                            subtitle={
                                <AntdTag color={'blue'}>
                                    {`${toolBaseData?.platform.slice(0, 1)}${toolBaseData?.platform.slice(1).toLowerCase()}`}
                                </AntdTag>
                            }
                            onBack={() => navigateToToolBase(navigate)}
                        >
                            <span>
                                <Text strong>版本：</Text>
                                {toolBaseData && formatToolBaseVersion(toolBaseData?.version)}
                            </span>
                            {toolBaseData && !toolBaseData.version && (
                                <AntdSpace>
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
                                        loading={isLoading || isCompiling}
                                        onClick={handleOnPublish}
                                    >
                                        发布
                                    </AntdButton>
                                </AntdSpace>
                            )}
                        </ToolBar>
                        <Card>
                            <CodeEditor
                                isDarkMode={isDarkMode}
                                fileTree={fileTree}
                                selectedFileKey={selectedFileKey}
                                readonly={isReadonly}
                                extraLibs={editorExtraLibs}
                                onEditorDidMount={(_, monaco) => addExtraCssVariables(monaco)}
                                onSelectedFileChange={setSelectedFileKey}
                                onChangeFileContent={updateFileContent}
                                onAddFile={addFile}
                                onRenameFile={renameFile}
                                onMoveFile={moveFile}
                                onRemoveFile={removeFile}
                                listenOnError={listenOnError}
                            />
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

export default BaseEditor
