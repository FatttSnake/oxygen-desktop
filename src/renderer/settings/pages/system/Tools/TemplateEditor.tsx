import Icon from '@ant-design/icons'
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
    formatToolBaseVersion,
    generateThemeCssVariables,
    processBaseDist,
    removeUselessAttributes
} from '$/util/tool'
import editorExtraLibs from '$/util/editorExtraLibs'
import {
    r_sys_tool_template_get_one,
    r_sys_tool_template_update_source,
    r_sys_tool_template_upgrade_base
} from '$/services/system'
import { r_tool_base_get_latest_version } from '$/services/tool'
import { CommonContext } from '$/CommonFramework'
import FitFullscreen from '$/components/FitFullscreen'
import LoadingMask from '$/components/LoadingMask'
import FlexBox from '$/components/FlexBox'
import Card from '$/components/Card'
import Playground from '$/components/Playground'
import { usePlaygroundState } from '$/hooks/usePlaygroundState'
import { base64ToFiles, base64ToStr, filesToBase64 } from '$/components/Playground/files'
import ToolBar from '@/components/tools/ToolBar'

const TemplateEditor = () => {
    const { styles, theme } = useStyles()
    const { isDarkMode } = useContext(CommonContext)
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            currentLocation.pathname !== nextLocation.pathname && hasEdited
    )
    const navigate = useNavigate()
    const { id } = useParams()
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
    const [isSaving, setIsSaving] = useState(false)
    const [toolTemplateData, setToolTemplateData] = useState<ToolTemplateWithSourceVo>()
    const [baseDist, setBaseDist] = useState('')
    const [baseLatestVersion, setBaseLatestVersion] = useState<number>()
    const hasNewBaseVersion =
        !!toolTemplateData &&
        !!baseLatestVersion &&
        baseLatestVersion > toolTemplateData.base.version

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
                content: `基板 ${toolTemplateData?.base.name} 将从 ${formatToolBaseVersion(toolTemplateData!.base.version)} 更新到 ${formatToolBaseVersion(baseLatestVersion!)}`
            })
            .then(
                (confirmed) => {
                    if (!confirmed || isSaving) {
                        return
                    }
                    setIsSaving(true)
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
                            setIsSaving(false)
                            message.destroy('UPGRADING')
                        })
                },
                () => {}
            )
    }

    const handleOnSave = () => {
        if (isSaving || !toolTemplateData) {
            return
        }
        setIsSaving(true)
        void message.loading({ content: '保存中', key: 'SAVING', duration: 0 })

        r_sys_tool_template_update_source({
            id: toolTemplateData.id,
            source: filesToBase64(files)
        })
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_UPDATE_SUCCESS:
                        saveFiles()
                        void message.success('保存成功')
                        break
                    case DATABASE_NO_RECORD_FOUND:
                        void message.error('未找到对应记录')
                        navigateToToolTemplate(navigate)
                        break
                    default:
                        void message.error('保存失败请稍后重试')
                }
            })
            .finally(() => {
                message.destroy('SAVING')
                setIsSaving(false)
            })
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
                    case DATABASE_SELECT_SUCCESS:
                        setToolTemplateData(response.data!)
                        saveFiles()
                        break
                    case DATABASE_NO_RECORD_FOUND:
                        message.error('未找到指定工具模板').then(() => {
                            navigateToToolTemplate(navigate)
                        })
                        break
                    default:
                        void message.error('获取工具模板失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
                message.destroy('LOADING')
            })
    }

    useEffect(() => {
        if (!toolTemplateData) {
            return
        }

        if (!checkDesktop() && toolTemplateData.platform !== 'WEB') {
            navigateToToolTemplate(navigate)
        }

        r_tool_base_get_latest_version(toolTemplateData.base.id).then((res) => {
            const response = res.data
            if (response.success) {
                setBaseLatestVersion(response.data!)
            }
        })

        try {
            processBaseDist(toolTemplateData.base.id, toolTemplateData.base.version, {}).then(
                ({ toolBaseVo }) => {
                    setBaseDist(base64ToStr(toolBaseVo.dist.data!))
                    const files = base64ToFiles(toolTemplateData.source.data!)
                    init(files, false, toolTemplateData.entryPoint, toolTemplateData.entryPoint)
                }
            )
        } catch (e) {
            console.error(e)
            void message.error('载入工具模板失败')
        }
    }, [toolTemplateData])

    useEffect(() => {
        getToolTemplate()
    }, [id])

    return (
        <>
            <FitFullscreen className={styles.root}>
                <LoadingMask hidden={!isLoading}>
                    <FlexBox className={styles.layout} direction={'vertical'}>
                        <ToolBar
                            title={`${toolTemplateData?.name}${hasEdited ? '*' : ''}`}
                            subtitle={
                                <AntdTag color={'blue'}>
                                    {`${toolTemplateData?.platform.slice(0, 1)}${toolTemplateData?.platform.slice(1).toLowerCase()}`}
                                </AntdTag>
                            }
                            onBack={() => navigateToToolTemplate(navigate)}
                        >
                            <span>
                                基板：
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
                                        type={'primary'}
                                        icon={<Icon component={IconOxygenSave} />}
                                        loading={isLoading || isSaving}
                                        onClick={handleOnSave}
                                    >
                                        保存
                                    </AntdButton>
                                </AntdSpace>
                            )}
                        </ToolBar>
                        <Card>
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
                                        globalCssVariables={generateThemeCssVariables(theme).styles}
                                    />
                                </AntdSplitter.Panel>
                            </AntdSplitter>
                        </Card>
                    </FlexBox>
                </LoadingMask>
            </FitFullscreen>
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

export default TemplateEditor
