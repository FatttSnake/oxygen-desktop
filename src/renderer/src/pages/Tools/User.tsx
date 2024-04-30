import Icon from '@ant-design/icons'
import '@/assets/css/pages/tools/user.scss'
import {
    COLOR_BACKGROUND,
    DATABASE_NO_RECORD_FOUND,
    DATABASE_SELECT_SUCCESS
} from '@/constants/common.constants'
import { checkDesktop } from '@/util/common'
import { navigateToRoot } from '@/util/navigation'
import { r_sys_user_info_get_basic } from '@/services/system'
import { r_tool_store_get_by_username } from '@/services/tool'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'
import StoreCard from '@/components/tools/StoreCard'
import LoadMoreCard from '@/components/tools/LoadMoreCard'

const User = () => {
    const { username } = useParams()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [userWithInfoVo, setUserWithInfoVo] = useState<UserWithInfoVo>()
    const [isLoadingTools, setIsLoadingTools] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [toolData, setToolData] = useState<ToolVo[]>([])

    const handleOnCopyToClipboard = (username?: string) => {
        return username
            ? () => {
                  void navigator.clipboard
                      .writeText(new URL(`/store/${username}`, location.href).href)
                      .then(() => {
                          void message.success('已复制到剪切板')
                      })
              }
            : undefined
    }

    const getProfile = () => {
        if (isLoading) {
            return
        }
        setIsLoading(true)
        void message.loading({ content: '加载中', key: 'LOADING', duration: 0 })

        void r_sys_user_info_get_basic(username!)
            .then((res) => {
                const response = res.data
                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        setUserWithInfoVo(response.data!)
                        getTool(1)
                        break
                    case DATABASE_NO_RECORD_FOUND:
                        void message.warning('用户不存在')
                        setTimeout(() => {
                            navigateToRoot(navigate)
                        }, 3000)
                        break
                    default:
                        void message.error('获取失败请稍后重试')
                }
            })
            .finally(() => {
                setIsLoading(false)
                void message.destroy('LOADING')
            })
    }

    const handleOnLoadMore = () => {
        if (isLoading) {
            return
        }
        getTool(currentPage + 1)
    }

    const getTool = (page: number) => {
        if (isLoadingTools) {
            return
        }
        setIsLoadingTools(true)
        void message.loading({ content: '加载工具列表中', key: 'LOADING', duration: 0 })

        void r_tool_store_get_by_username(username!, { currentPage: page })
            .then((res) => {
                const response = res.data

                switch (response.code) {
                    case DATABASE_SELECT_SUCCESS:
                        setCurrentPage(response.data!.current)
                        if (
                            response.data!.current === response.data!.pages ||
                            response.data!.total === 0
                        ) {
                            setHasNextPage(false)
                        } else {
                            setHasNextPage(true)
                        }
                        if (response.data!.current === 1) {
                            setToolData(response.data!.records)
                        } else {
                            setToolData([...toolData, ...response.data!.records])
                        }
                        break
                    default:
                        void message.error('加载失败，请稍后重试')
                }
            })
            .finally(() => {
                setIsLoadingTools(false)
                message.destroy('LOADING')
            })
    }

    useEffect(() => {
        getProfile()
    }, [])

    return (
        <>
            <FitFullscreen data-component={'tools-store-user'}>
                <HideScrollbar
                    isShowVerticalScrollbar
                    autoHideWaitingTime={1000}
                    className={'root-content'}
                >
                    <Card className={'root-box'}>
                        <FlexBox className={'info'} direction={'horizontal'}>
                            <div className={'avatar-box'}>
                                <AntdAvatar
                                    src={
                                        <img
                                            src={`data:image/png;base64,${userWithInfoVo?.userInfo.avatar}`}
                                            alt={'Avatar'}
                                        />
                                    }
                                    size={144}
                                    style={{
                                        background: COLOR_BACKGROUND,
                                        cursor: 'pointer'
                                    }}
                                    className={'avatar'}
                                />
                            </div>
                            <FlexBox className={'info-name'}>
                                <div className={'nickname'}>
                                    {userWithInfoVo?.userInfo.nickname}
                                </div>
                                <a
                                    className={'url'}
                                    onClick={handleOnCopyToClipboard(userWithInfoVo?.username)}
                                >
                                    {userWithInfoVo?.username &&
                                        new URL(`/store/${userWithInfoVo.username}`, location.href)
                                            .href}
                                    <Icon component={IconOxygenCopy} />
                                </a>
                            </FlexBox>
                        </FlexBox>
                        <FlexBox direction={'horizontal'} className={'tools'}>
                            {!toolData.length && (
                                <div className={'no-tool'}>该开发者暂未发布任何工具</div>
                            )}
                            {toolData
                                ?.reduce((previousValue: ToolVo[], currentValue) => {
                                    if (
                                        !previousValue.some(
                                            (value) =>
                                                value.author.id === currentValue.author.id &&
                                                value.toolId === currentValue.toolId
                                        )
                                    ) {
                                        previousValue.push(currentValue)
                                    }
                                    return previousValue
                                }, [])
                                .map((item) => {
                                    const tools = toolData.filter(
                                        (value) =>
                                            value.author.id === item.author.id &&
                                            value.toolId === item.toolId
                                    )
                                    const webTool = tools.find((value) => value.platform === 'WEB')
                                    const desktopTool = tools.find(
                                        (value) => value.platform === 'DESKTOP'
                                    )
                                    const androidTool = tools.find(
                                        (value) => value.platform === 'ANDROID'
                                    )
                                    const firstTool =
                                        (checkDesktop()
                                            ? desktopTool || webTool
                                            : webTool || desktopTool) || androidTool

                                    return (
                                        <StoreCard
                                            key={firstTool!.id}
                                            icon={
                                                <img
                                                    src={`data:image/svg+xml;base64,${firstTool!.icon}`}
                                                    alt={'Icon'}
                                                />
                                            }
                                            toolName={firstTool!.name}
                                            toolId={firstTool!.toolId}
                                            toolDesc={firstTool!.description}
                                            authorUsername={firstTool!.author.username}
                                            ver={firstTool!.ver}
                                            platform={firstTool!.platform}
                                            supportPlatform={tools.map((value) => value.platform)}
                                            favorite={firstTool!.favorite}
                                        />
                                    )
                                })}
                            {hasNextPage && <LoadMoreCard onClick={handleOnLoadMore} />}
                        </FlexBox>
                    </Card>
                </HideScrollbar>
            </FitFullscreen>
        </>
    )
}

export default User
