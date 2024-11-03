import Draggable from 'react-draggable'
import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/pages/system/tools/code.style'
import { DATABASE_NO_RECORD_FOUND, DATABASE_SELECT_SUCCESS } from '@/constants/common.constants'
import { message, modal, checkDesktop, addExtraCssVariable } from '@/util/common'
import { navigateToExecute, navigateToRepository } from '@/util/navigation'
import editorExtraLibs from '@/util/editorExtraLibs'
import { r_sys_tool_get_one } from '@/services/system'
import { AppContext } from '@/App'
import { IFiles } from '@/components/Playground/shared'
import { base64ToFiles } from '@/components/Playground/files'
import Playground from '@/components/Playground'
import FitFullscreen from '@/components/common/FitFullscreen'
import Card from '@/components/common/Card'

const Code = () => {
    const { styles } = useStyles()
    const { isDarkMode } = useContext(AppContext)
    const navigate = useNavigate()
    const { id } = useParams()
    const [isLoading, setIsLoading] = useState(false)
    const [files, setFiles] = useState<IFiles>({})
    const [selectedFileName, setSelectedFileName] = useState('')
    const [platform, setPlatform] = useState<Platform>('WEB')

    const handleOnRunTool = () => {
        if (checkDesktop() || platform !== 'DESKTOP') {
            void modal.confirm({
                centered: true,
                maskClosable: true,
                title: '注意',
                content: '运行前请仔细查阅工具代码！',
                onOk: () => {
                    navigateToExecute(navigate, id!)
                }
            })
        } else {
            void message.warning('此应用需要桌面端环境，请在桌面端运行')
        }
    }

    const render = (toolVo: ToolVo) => {
        try {
            setFiles(base64ToFiles(toolVo.source.data!))
            setSelectedFileName(toolVo.entryPoint)
            setPlatform(toolVo.platform)
        } catch (e) {
            void message.error('载入工具失败')
        }
    }

    const getTool = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)
        void message.loading({ content: '加载中……', key: 'LOADING', duration: 0 })

        void r_sys_tool_get_one(id!)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        render(response.data!)
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
        getTool()
    }, [id])

    return (
        <>
            <FitFullscreen className={styles.root}>
                <Card className={styles.rootBox}>
                    <Playground.CodeEditor
                        isDarkMode={isDarkMode}
                        readonly
                        files={files}
                        selectedFileName={selectedFileName}
                        onSelectedFileChange={setSelectedFileName}
                        extraLibs={editorExtraLibs}
                        onEditorDidMount={(_, monaco) => addExtraCssVariable(monaco)}
                    />
                </Card>

                <Draggable bounds={'#root'}>
                    <div className={styles.draggableContent}>
                        <AntdFloatButton
                            type={'primary'}
                            icon={<Icon component={IconOxygenExecute} />}
                            onClick={handleOnRunTool}
                        />
                    </div>
                </Draggable>
            </FitFullscreen>
        </>
    )
}

export default Code
