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
import { formatToolBaseVersion } from '$/util/tool'
import {
    r_sys_tool_base_get_one,
    r_sys_tool_base_update_dist,
    r_sys_tool_base_update_source
} from '$/services/system'
import { CommonContext } from '$/CommonFramework'
import FitFullscreen from '$/components/FitFullscreen'
import Card from '$/components/Card'
import FlexBox from '$/components/FlexBox'
import LoadingMask from '$/components/LoadingMask'
import Playground from '$/components/Playground'
import { usePlaygroundState } from '$/hooks/usePlaygroundState'
import compiler from '$/components/Playground/compiler'
import {
    base64ToFiles,
    filesToBase64,
    IMPORT_MAP_FILE_NAME,
    strToBase64,
    TSCONFIG_FILE_NAME
} from '$/components/Playground/files'
import ToolBar from '@/components/tools/ToolBar'

const BaseEditor = () => {
    const { styles } = useStyles()
    const { isDarkMode } = useContext(CommonContext)
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            currentLocation.pathname !== nextLocation.pathname && hasEdited
    )
    const navigate = useNavigate()
    const { id, version } = useParams()
    const [compileForm] = AntdForm.useForm<{ entryFileName: string }>()
    const {
        init,
        files,
        selectedFileName,
        isReadonly,
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
    const [isCompiling, setIsCompiling] = useState(false)
    const [toolBaseData, setToolBaseData] = useState<ToolBaseWithSourceVo>()

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

    const saveToolBase = async (toolBaseData: ToolBaseWithSourceVo) => {
        message.loading({ content: '保存中', key: 'SAVING', duration: 0 })
        setIsSaving(true)

        const source = filesToBase64(files)
        const res = await r_sys_tool_base_update_source({
            id: toolBaseData.id,
            version: toolBaseData.version,
            source
        }).finally(() => {
            message.destroy('SAVING')
            setIsSaving(false)
        })

        const response = res.data
        switch (response.code) {
            case DATABASE_UPDATE_SUCCESS:
                saveFiles()
                message.success('保存成功')
                return true
            case DATABASE_NO_RECORD_FOUND:
                message.error('未找到对应记录')
                navigateToToolBase(navigate)
                return false
            default:
                message.error('保存失败请稍后重试')
                return false
        }
    }

    const handleOnSave = () => {
        if (isLoading || isSaving || !toolBaseData) {
            return
        }

        saveToolBase(toolBaseData).then(() => {
            getToolBase()
        })
    }

    const handleOnPublish = () => {
        if (isLoading || isSaving || isCompiling || !toolBaseData) {
            return
        }

        saveToolBase(toolBaseData)
            .then((saveSuccess) => {
                if (!saveSuccess) {
                    return
                }

                void modal.confirm({
                    centered: true,
                    maskClosable: true,
                    title: '编译',
                    footer: (_, { OkBtn, CancelBtn }) => (
                        <>
                            <OkBtn />
                            <CancelBtn />
                        </>
                    ),
                    content: (
                        <AntdForm form={compileForm}>
                            <AntdForm.Item
                                name={'entryFileName'}
                                label={'入口文件'}
                                style={{ marginTop: 10 }}
                                rules={[{ required: true }]}
                            >
                                <AntdSelect
                                    options={Object.keys(files)
                                        .filter(
                                            (value) =>
                                                ![
                                                    IMPORT_MAP_FILE_NAME,
                                                    TSCONFIG_FILE_NAME
                                                ].includes(value) &&
                                                !value.endsWith('.d.ts') &&
                                                !value.endsWith('.css') &&
                                                !value.endsWith('.json')
                                        )
                                        .map((value) => ({ label: value, value }))}
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
                                    setIsCompiling(true)
                                    void message.loading({
                                        content: '编译中',
                                        key: 'COMPILING',
                                        duration: 0
                                    })
                                    compiler
                                        .compile(
                                            files,
                                            importMap,
                                            compileForm.getFieldValue('entryFileName')
                                        )
                                        .then((result) => {
                                            message.destroy('COMPILING')
                                            void message.loading({
                                                content: '上传中',
                                                key: 'UPLOADING',
                                                duration: 0
                                            })
                                            return r_sys_tool_base_update_dist({
                                                id: toolBaseData.id,
                                                version: toolBaseData.version,
                                                dist: strToBase64(result.outputFiles[0].text)
                                            })
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
                                            void message.error(
                                                `编译失败：${e.message ? e.message : e}`
                                            )
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
            })
            .catch(() => {
                void message.error('发布失败，请稍后重试')
            })
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
                        setToolBaseData(response.data!)
                        saveFiles()
                        break
                    case DATABASE_NO_RECORD_FOUND:
                        message.error('未找到指定工具基板').then(() => {
                            navigateToToolBase(navigate)
                        })
                        break
                    default:
                        void message.error('获取工具基板失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
                message.destroy('LOADING')
            })
    }

    useEffect(() => {
        if (!toolBaseData) {
            return
        }

        try {
            const files = base64ToFiles(toolBaseData.source.data!)
            const selectedFileName =
                Object.keys(files).find((fileName) => fileName.endsWith('.tsx')) ||
                Object.keys(files).find((fileName) => fileName.endsWith('.ts')) ||
                Object.keys(files).find((fileName) => fileName.endsWith('.jsx')) ||
                Object.keys(files).find((fileName) => fileName.endsWith('.js'))
            init(files, !!version, selectedFileName)
        } catch (e) {
            console.error(e)
            void message.error('载入工具基板失败')
        }
    }, [toolBaseData])

    useEffect(() => {
        getToolBase()
    }, [id, version])

    return (
        <>
            <FitFullscreen className={styles.root}>
                <LoadingMask hidden={!isLoading}>
                    <FlexBox className={styles.layout} direction={'vertical'}>
                        <ToolBar
                            title={toolBaseData?.name}
                            subtitle={
                                <AntdTag color={'blue'}>
                                    {`${toolBaseData?.platform.slice(0, 1)}${toolBaseData?.platform.slice(1).toLowerCase()}`}
                                </AntdTag>
                            }
                            onBack={() => navigateToToolBase(navigate)}
                        >
                            <span>
                                版本：
                                {toolBaseData && formatToolBaseVersion(toolBaseData?.version)}
                            </span>
                            {toolBaseData && !toolBaseData.version && (
                                <AntdSpace>
                                    <AntdButton
                                        size={'small'}
                                        icon={<Icon component={IconOxygenSave} />}
                                        loading={isLoading || isSaving || isCompiling}
                                        onClick={handleOnSave}
                                    >
                                        保存
                                    </AntdButton>
                                    <AntdButton
                                        size={'small'}
                                        type={'primary'}
                                        icon={<Icon component={IconOxygenCompile} />}
                                        loading={isLoading || isSaving || isCompiling}
                                        onClick={handleOnPublish}
                                    >
                                        发布
                                    </AntdButton>
                                </AntdSpace>
                            )}
                        </ToolBar>
                        <Card>
                            <Playground.CodeEditor
                                isDarkMode={isDarkMode}
                                tsconfig={tsconfig}
                                files={files}
                                selectedFileName={selectedFileName}
                                readonly={isReadonly}
                                extraLibs={editorExtraLibs}
                                onSelectedFileChange={setSelectedFileName}
                                onChangeFileContent={updateFileContent}
                                onAddFile={addFile}
                                onRenameFile={renameFile}
                                onRemoveFile={removeFile}
                                listenOnError={listenOnError}
                            />
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

export default BaseEditor
