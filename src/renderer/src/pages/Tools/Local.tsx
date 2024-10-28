import { UIEvent } from 'react'
import useStyles from '@/assets/css/pages/tools/local.style'
import { message, checkDesktop } from '@/util/common'
import { l_tool_get } from '@/services/tool'
import FlexBox from '@/components/common/FlexBox'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'
import LocalCard from '@/components/tools/LocalCard'

const Local = () => {
    const { styles, cx } = useStyles()
    const scrollTopRef = useRef(0)
    const [isLoading, setIsLoading] = useState(false)
    const [toolData, setToolData] = useState<ToolVo[]>([])
    const [isHideSearch, setIsHideSearch] = useState(false)

    const handleOnSearch = (value: string) => {
        getTool(value)
    }

    const handleOnScroll = (event: UIEvent<HTMLDivElement>) => {
        if (event.currentTarget.scrollTop < scrollTopRef.current) {
            setIsHideSearch(false)
        } else {
            setIsHideSearch(true)
        }
        scrollTopRef.current = event.currentTarget.scrollTop
    }

    const getTool = (searchValue: string) => {
        if (isLoading) {
            return
        }
        setIsLoading(true)
        void message.loading({ content: '加载工具列表中', key: 'LOADING', duration: 0 })

        void l_tool_get()
            .then((data) => {
                const list: ToolVo[] = []
                Object.values(data).forEach((value) =>
                    Object.values(value).forEach((item) => list.push(item))
                )
                setToolData(
                    list.filter(
                        ({ name, keywords }) =>
                            name.toLowerCase().includes(searchValue.toLowerCase()) ||
                            keywords.some((value) =>
                                value.toLowerCase().includes(searchValue.toLowerCase())
                            )
                    )
                )
            })
            .catch((e) => {
                void message.error('加载失败，请稍后重试')
                console.error('Get installed tools error: ', e)
            })
            .finally(() => {
                setIsLoading(false)
                message.destroy('LOADING')
            })
    }

    useEffect(() => {
        getTool('')
    }, [])

    return (
        <>
            <FitFullscreen>
                <HideScrollbar
                    isShowVerticalScrollbar
                    autoHideWaitingTime={1000}
                    onScroll={handleOnScroll}
                >
                    <div className={cx(styles.search, isHideSearch ? styles.hide : '')}>
                        <AntdInput.Search
                            enterButton
                            allowClear
                            loading={isLoading}
                            onSearch={handleOnSearch}
                            placeholder={'请输入工具名或关键字'}
                        />
                    </div>
                    <FlexBox direction={'horizontal'} className={styles.root}>
                        {!toolData.length && <div className={styles.noTool}>未找到任何工具</div>}
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
                                    <LocalCard
                                        key={firstTool!.id}
                                        icon={firstTool!.icon}
                                        toolName={firstTool!.name}
                                        toolId={firstTool!.toolId}
                                        toolDesc={firstTool!.description}
                                        author={firstTool!.author}
                                        ver={firstTool!.ver}
                                        platform={firstTool!.platform}
                                        supportPlatform={tools.map((value) => value.platform)}
                                    />
                                )
                            })}
                    </FlexBox>
                </HideScrollbar>
            </FitFullscreen>
        </>
    )
}

export default Local
