import Draggable from 'react-draggable'
import Icon from '@ant-design/icons'
import '@/assets/css/pages/system/tools/code.scss'
import { DATABASE_NO_RECORD_FOUND, DATABASE_SELECT_SUCCESS } from '@/constants/common.constants'
import { checkDesktop } from '@/util/common'
import { navigateToExecute, navigateToRepository } from '@/util/navigation'
import { r_sys_tool_get_one } from '@/services/system'
import { IFiles } from '@/components/Playground/shared'
import { base64ToFiles } from '@/components/Playground/files'
import Playground from '@/components/Playground'
import FitFullscreen from '@/components/common/FitFullscreen'
import Card from '@/components/common/Card'

const Code = () => {
    const navigate = useNavigate()
    const [modal, contextHolder] = AntdModal.useModal()
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
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
        if (loading) {
            return
        }
        setLoading(true)
        void message.loading({ content: '加载中……', key: 'LOADING', duration: 0 })

        void r_sys_tool_get_one(id!)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        render(response.data!)
                        break
                    case DATABASE_NO_RECORD_FOUND:
                        void message.error('未找到指定工具')
                        setTimeout(() => {
                            navigateToRepository(navigate)
                        }, 3000)
                        break
                    default:
                        void message.error('获取工具信息失败，请稍后重试')
                }
            })
            .finally(() => {
                setLoading(false)
                message.destroy('LOADING')
            })
    }

    useEffect(() => {
        getTool()
    }, [])

    return (
        <>
            <FitFullscreen data-component={'system-tools-code'}>
                <Card>
                    <Playground.CodeEditor
                        readonly
                        files={files}
                        selectedFileName={selectedFileName}
                        onSelectedFileChange={setSelectedFileName}
                    />
                </Card>

                <Draggable bounds={'#root'}>
                    <div className={'draggable-content'}>
                        <AntdFloatButton
                            type={'primary'}
                            icon={<Icon component={IconOxygenExecute} />}
                            onClick={handleOnRunTool}
                        />
                    </div>
                </Draggable>
            </FitFullscreen>
            {contextHolder}
        </>
    )
}

export default Code
