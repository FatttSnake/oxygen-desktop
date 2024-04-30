import { DetailedHTMLProps, HTMLAttributes, MouseEvent, ReactNode, UIEvent } from 'react'
import VanillaTilt, { TiltOptions } from 'vanilla-tilt'
import protocolCheck from 'custom-protocol-check'
import Icon from '@ant-design/icons'
import '@/assets/css/pages/tools/store.scss'
import { COLOR_BACKGROUND, COLOR_MAIN, DATABASE_SELECT_SUCCESS } from '@/constants/common.constants'
import { checkDesktop } from '@/util/common'
import { navigateToSource, navigateToStore, navigateToView } from '@/util/navigation'
import { r_tool_store_get } from '@/services/tool'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'
import FitFullscreen from '@/components/common/FitFullscreen'
import HideScrollbar from '@/components/common/HideScrollbar'

interface CommonCardProps
    extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    icon: ReactNode
    toolName: string
    toolId: string
    toolDesc: string
    options?: TiltOptions
    authorName: string
    authorAvatar: string
    authorUsername: string
    ver: string
    platform: Platform
    supportPlatform: Platform[]
}

const CommonCard = ({
    style,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ref,
    icon,
    toolName,
    toolId,
    toolDesc,
    options = {
        reverse: true,
        max: 8,
        glare: true,
        ['max-glare']: 0.3,
        scale: 1.03
    },
    authorName,
    authorAvatar,
    authorUsername,
    ver,
    platform,
    supportPlatform,
    ...props
}: CommonCardProps) => {
    const navigate = useNavigate()
    const [modal, contextHolder] = AntdModal.useModal()
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        cardRef.current && VanillaTilt.init(cardRef.current, options)
    }, [options])

    const handleCardOnClick = () => {
        if (!checkDesktop() && platform === 'DESKTOP') {
            void message.warning('此应用需要桌面端环境，请在桌面端打开')
            return
        }
        if (platform === 'ANDROID') {
            void modal.info({
                icon: <Icon style={{ color: COLOR_MAIN }} component={IconOxygenInfo} />,
                title: 'Android 端',
                centered: true,
                maskClosable: true,
                content: (
                    <FlexBox className={'android-qrcode'}>
                        <AntdQRCode
                            value={`oxygen://openurl/view/${authorUsername}/${toolId}`}
                            size={300}
                        />
                        <AntdTag className={'tag'}>请使用手机端扫描上方二维码</AntdTag>
                    </FlexBox>
                )
            })
            return
        }
        navigateToView(navigate, authorUsername, toolId, platform)
    }

    const handleOnClickAuthor = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        navigateToStore(navigate, authorUsername)
    }

    const handleOnSourceBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        navigateToSource(navigate, authorUsername, toolId, platform)
    }

    const handleOnAndroidBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        void modal.info({
            icon: <Icon style={{ color: COLOR_MAIN }} component={IconOxygenInfo} />,
            title: 'Android 端',
            centered: true,
            maskClosable: true,
            content: (
                <FlexBox className={'android-qrcode'}>
                    <AntdQRCode
                        value={`oxygen://openurl/view/${authorUsername}/${toolId}`}
                        size={300}
                    />
                    <AntdTag className={'tag'}>请使用手机端扫描上方二维码</AntdTag>
                </FlexBox>
            )
        })
    }

    const handleOnDesktopBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (!checkDesktop()) {
            void message.loading({ content: '启动桌面端中……', key: 'LOADING', duration: 0 })
            protocolCheck(
                `oxygen://openurl/view/${authorUsername}/${toolId}`,
                () => {
                    void message.warning('打开失败,此应用需要桌面端环境,请安装桌面端后重试')
                    void message.destroy('LOADING')
                },
                () => {
                    void message.destroy('LOADING')
                },
                2000,
                () => {
                    void message.warning('打开失败,此应用需要桌面端环境,请安装桌面端后重试')
                    void message.destroy('LOADING')
                }
            )
            return
        }
        navigateToView(navigate, authorUsername, toolId, platform)
    }

    const handleOnWebBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        navigateToView(navigate, authorUsername, toolId, platform)
    }

    return (
        <>
            <Card
                style={{ overflow: 'visible', ...style }}
                ref={cardRef}
                {...props}
                onClick={handleCardOnClick}
            >
                <FlexBox className={'common-card'}>
                    <div className={'icon'}>{icon}</div>
                    <div className={'version'}>
                        <AntdTag>
                            {platform.slice(0, 1)}-{ver}
                        </AntdTag>
                    </div>
                    <div className={'info'}>
                        <div className={'tool-name'}>{toolName}</div>
                        <div className={'tool-id'}>{`ID: ${toolId}`}</div>
                        {toolDesc && <div className={'tool-desc'}>{`简介：${toolDesc}`}</div>}
                    </div>
                    <div className={'author'} onClick={handleOnClickAuthor}>
                        <div className={'avatar'}>
                            <AntdAvatar
                                src={
                                    <AntdImage
                                        preview={false}
                                        src={`data:image/png;base64,${authorAvatar}`}
                                        alt={'Avatar'}
                                    />
                                }
                                style={{ background: COLOR_BACKGROUND }}
                            />
                        </div>
                        <AntdTooltip title={authorUsername}>
                            <div className={'author-name'}>{authorName}</div>
                        </AntdTooltip>
                    </div>
                    <div className={'operation'}>
                        {platform !== 'ANDROID' && supportPlatform.includes('ANDROID') && (
                            <AntdTooltip title={'Android 端'}>
                                <Icon
                                    component={IconOxygenMobile}
                                    onClick={handleOnAndroidBtnClick}
                                />
                            </AntdTooltip>
                        )}
                        {platform === 'DESKTOP' && supportPlatform.includes('WEB') && (
                            <AntdTooltip title={'Web 端'}>
                                <Icon component={IconOxygenBrowser} onClick={handleOnWebBtnClick} />
                            </AntdTooltip>
                        )}
                        {platform === 'WEB' && supportPlatform.includes('DESKTOP') && (
                            <AntdTooltip title={'桌面端'}>
                                <Icon
                                    component={IconOxygenDesktop}
                                    onClick={handleOnDesktopBtnClick}
                                />
                            </AntdTooltip>
                        )}
                        <AntdTooltip title={'源码'}>
                            <Icon component={IconOxygenCode} onClick={handleOnSourceBtnClick} />
                        </AntdTooltip>
                    </div>
                </FlexBox>
            </Card>
            {contextHolder}
        </>
    )
}

interface LoadMoreCardProps {
    onClick: () => void
}

const LoadMoreCard = ({ onClick }: LoadMoreCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        cardRef.current &&
            VanillaTilt.init(cardRef.current, {
                reverse: true,
                max: 8,
                glare: true,
                ['max-glare']: 0.3,
                scale: 1.03
            })
    }, [])

    return (
        <Card style={{ overflow: 'visible' }} ref={cardRef} onClick={onClick}>
            <FlexBox className={'load-more-card'}>
                <div className={'icon'}>
                    <Icon component={IconOxygenMore} />{' '}
                </div>
                <div className={'text'}>加载更多</div>
            </FlexBox>
        </Card>
    )
}

const Store = () => {
    const scrollTopRef = useRef(0)
    const [isLoading, setIsLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [toolData, setToolData] = useState<ToolVo[]>([])
    const [hideSearch, setHideSearch] = useState(false)
    const [searchValue, setSearchValue] = useState('')

    const handleOnSearch = (value: string) => {
        setSearchValue(value)
        getTool(1, value)
    }

    const handleOnScroll = (event: UIEvent<HTMLDivElement>) => {
        if (event.currentTarget.scrollTop < scrollTopRef.current) {
            setHideSearch(false)
        } else {
            setHideSearch(true)
        }
        scrollTopRef.current = event.currentTarget.scrollTop
    }

    const handleOnLoadMore = () => {
        if (isLoading) {
            return
        }
        getTool(currentPage + 1, searchValue)
    }

    const getTool = (page: number, searchValue: string) => {
        if (isLoading) {
            return
        }
        setIsLoading(true)
        void message.loading({ content: '加载工具列表中', key: 'LOADING', duration: 0 })

        void r_tool_store_get({ currentPage: page, searchValue })
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
                setIsLoading(false)
                message.destroy('LOADING')
            })
    }

    useEffect(() => {
        getTool(1, '')
    }, [])

    return (
        <>
            <FitFullscreen data-component={'tools-store'}>
                <HideScrollbar
                    isShowVerticalScrollbar
                    autoHideWaitingTime={1000}
                    onScroll={handleOnScroll}
                >
                    <div className={`search${hideSearch ? ' hide' : ''}`}>
                        <AntdInput.Search
                            enterButton
                            allowClear
                            loading={isLoading}
                            onSearch={handleOnSearch}
                            placeholder={'请输入工具名或关键字'}
                        />
                    </div>
                    <FlexBox direction={'horizontal'} className={'root-content'}>
                        {!toolData.length && <div className={'no-tool'}>未找到任何工具</div>}
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
                                    <CommonCard
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
                                        authorName={firstTool!.author.userInfo.nickname}
                                        authorAvatar={firstTool!.author.userInfo.avatar}
                                        authorUsername={firstTool!.author.username}
                                        ver={firstTool!.ver}
                                        platform={firstTool!.platform}
                                        supportPlatform={tools.map((value) => value.platform)}
                                    />
                                )
                            })}
                        {hasNextPage && <LoadMoreCard onClick={handleOnLoadMore} />}
                    </FlexBox>
                </HideScrollbar>
            </FitFullscreen>
        </>
    )
}

export default Store
