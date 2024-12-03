import { DetailedHTMLProps, HTMLAttributes, MouseEvent } from 'react'
import VanillaTilt, { TiltOptions } from 'vanilla-tilt'
import protocolCheck from 'custom-protocol-check'
import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/components/tools/store-card.style'
import { DATABASE_SELECT_SUCCESS } from '@/constants/common.constants'
import { message, modal, checkDesktop, omitTextByByte } from '@/util/common'
import { getLoginStatus, getUserId } from '@/util/auth'
import {
    getAndroidUrl,
    navigateToLogin,
    navigateToSource,
    navigateToStore,
    navigateToView
} from '@/util/navigation'
import { r_tool_add_favorite, r_tool_detail, r_tool_remove_favorite } from '@/services/tool'
import { n_tool_get, n_tool_install } from '@/services/native'
import Card from '@/components/common/Card'
import FlexBox from '@/components/common/FlexBox'
import DragHandle from '@/components/dnd/DragHandle'
import Draggable from '@/components/dnd/Draggable'

interface StoreCardProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    icon: string
    toolName: string
    toolId: string
    toolDesc: string
    options?: TiltOptions
    author: UserWithInfoVo
    showAuthor?: boolean
    ver: string
    platform: Platform
    supportPlatform: Platform[]
    vers: Record<Platform, string>
    favorite: boolean
}

const StoreCard = ({
    style,
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
    author,
    showAuthor = true,
    ver,
    platform,
    supportPlatform,
    vers,
    favorite,
    ...props
}: StoreCardProps) => {
    const { styles, theme } = useStyles()
    const navigate = useNavigate()
    const cardRef = useRef<HTMLDivElement>(null)
    const [favorite_, setFavorite_] = useState<boolean>(favorite)
    const [userId, setUserId] = useState('')
    const [isInstalling, setIsInstalling] = useState(false)
    const [isInstalled, setIsInstalled] = useState(true)
    const [isAvailableUpdate, setIsAvailableUpdate] = useState(false)

    useEffect(() => {
        cardRef.current && VanillaTilt.init(cardRef.current, options)
        if (getLoginStatus()) {
            void getUserId().then((value) => setUserId(value))
        }
    }, [options])

    const handleCardOnClick = () => {
        if (!checkDesktop() && platform === 'DESKTOP') {
            void message.warning('此应用需要桌面端环境，请在桌面端打开')
            return
        }
        if (platform === 'ANDROID') {
            void modal.confirm({
                centered: true,
                keyboard: false,
                icon: <Icon style={{ color: theme.colorPrimary }} component={IconOxygenInfo} />,
                title: 'Android 端',
                content: (
                    <FlexBox className={styles.androidQrcode}>
                        <AntdQRCode value={getAndroidUrl(author.username, toolId)} size={300} />
                        <AntdTag>请使用手机端扫描上方二维码</AntdTag>
                    </FlexBox>
                ),
                okText: '确定',
                cancelText: '模拟器',
                onCancel() {
                    navigateToView(navigate, author.username, toolId, platform)
                }
            })
            return
        }
        navigateToView(navigate, author.username, toolId, platform)
    }

    const handleOnClickAuthor = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        navigateToStore(navigate, author.username)
    }

    const handleOnSourceBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        navigateToSource(navigate, author.username, toolId, platform)
    }

    const handleOnStarBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (!getLoginStatus()) {
            navigateToLogin(navigate, undefined, `${location.pathname}${location.search}`)
            return
        }
        if (favorite_) {
            void r_tool_remove_favorite({
                authorId: author.id,
                toolId,
                platform
            }).then((res) => {
                const response = res.data
                if (response.success) {
                    setFavorite_(false)
                } else {
                    void message.error('取消收藏失败，请稍后重试')
                }
            })
        } else {
            void r_tool_add_favorite({
                authorId: author.id,
                toolId,
                platform
            }).then((res) => {
                const response = res.data
                if (response.success) {
                    setFavorite_(true)
                } else {
                    void message.error('收藏失败，请稍后重试')
                }
            })
        }
    }

    const handleOnInstallBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (isInstalling) {
            return
        }
        setIsInstalling(true)

        void message.loading({
            content: isAvailableUpdate ? '更新中' : '安装中',
            key: 'INSTALLING',
            duration: 0
        })
        const newTools = {} as Record<Platform, ToolVo>
        const flags: boolean[] = []
        supportPlatform.forEach((platform) => {
            void r_tool_detail(author.username, toolId, 'latest', platform)
                .then((res) => {
                    const response = res.data
                    switch (response.code) {
                        case DATABASE_SELECT_SUCCESS:
                            newTools[platform] = response.data!
                            flags.push(true)
                            break
                        default:
                            flags.push(false)
                    }
                })
                .catch(() => {
                    flags.push(false)
                })
                .finally(() => {
                    message.destroy('INSTALLING')
                    setIsInstalling(false)
                    if (flags.length !== supportPlatform.length) {
                        return
                    }
                    if (flags.every((item) => item)) {
                        void n_tool_install(author.username, toolId, newTools).then(() => {
                            void message.success(isAvailableUpdate ? '更新成功' : '安装成功')
                            setIsInstalled(true)
                            setIsAvailableUpdate(false)
                        })
                    } else {
                        void message.error(
                            isAvailableUpdate ? '更新失败，请稍后重试' : '安装失败，请稍后重试'
                        )
                    }
                })
        })
    }

    const handleOnAndroidBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        void modal.confirm({
            centered: true,
            keyboard: false,
            icon: <Icon style={{ color: theme.colorPrimary }} component={IconOxygenInfo} />,
            title: 'Android 端',
            content: (
                <FlexBox className={styles.androidQrcode}>
                    <AntdQRCode value={getAndroidUrl(author.username, toolId)} size={300} />
                    <AntdTag>请使用手机端扫描上方二维码</AntdTag>
                </FlexBox>
            ),
            okText: '确定',
            cancelText: '模拟器',
            onCancel() {
                navigateToView(navigate, author.username, toolId, 'ANDROID')
            }
        })
    }

    const handleOnDesktopBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (!checkDesktop()) {
            void message.loading({ content: '启动桌面端中……', key: 'LOADING', duration: 0 })
            protocolCheck(
                `${import.meta.env.VITE_DESKTOP_PROTOCOL}://openurl/view/${author.username}/${toolId}`,
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
        navigateToView(navigate, author.username, toolId, 'DESKTOP')
    }

    const handleOnWebBtnClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        navigateToView(navigate, author.username, toolId, 'WEB')
    }

    useEffect(() => {
        void n_tool_get(author.username, toolId).then((tools) => {
            if (!tools) {
                setIsInstalled(false)
                return
            }
            setIsInstalled(true)

            if (
                Object.keys(tools).length !== supportPlatform.length ||
                !supportPlatform.every((platform) => Object.keys(tools).includes(platform))
            ) {
                setIsAvailableUpdate(true)
                return
            }

            if (supportPlatform.some((platform) => vers[platform] !== tools[platform].ver)) {
                setIsAvailableUpdate(true)
                return
            }
        })
    }, [])

    return (
        <Draggable
            id={`${author.username}:${toolId}:${ver}:${platform}`}
            data={{
                icon,
                toolName,
                toolId,
                authorUsername: author.username,
                ver: '',
                platform
            }}
        >
            <Card
                style={{ overflow: 'visible', ...style }}
                ref={cardRef}
                {...props}
                onClick={handleCardOnClick}
            >
                <FlexBox className={styles.root}>
                    <div className={styles.header}>
                        <div className={styles.version}>
                            <AntdTag>
                                {platform.slice(0, 1)}-{ver}
                            </AntdTag>
                        </div>
                        <div className={styles.operation}>
                            {(!isInstalled || isAvailableUpdate) && (
                                <AntdTooltip title={isAvailableUpdate ? '更新' : '安装'}>
                                    <Icon
                                        component={IconOxygenDownload}
                                        onClick={handleOnInstallBtnClick}
                                        disabled={isInstalling}
                                    />
                                </AntdTooltip>
                            )}
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
                                    <Icon
                                        component={IconOxygenBrowser}
                                        onClick={handleOnWebBtnClick}
                                    />
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
                            {author.id !== userId && (
                                <AntdTooltip title={favorite_ ? '取消收藏' : '收藏'}>
                                    <Icon
                                        component={
                                            favorite_ ? IconOxygenStarFilled : IconOxygenStar
                                        }
                                        style={{
                                            color: favorite_ ? theme.colorPrimary : undefined
                                        }}
                                        onClick={handleOnStarBtnClick}
                                    />
                                </AntdTooltip>
                            )}
                            <DragHandle />
                        </div>
                    </div>
                    <div className={styles.icon}>
                        <img src={`data:image/svg+xml;base64,${icon}`} alt={'Icon'} />
                    </div>
                    <div className={styles.info}>
                        <div className={styles.toolName} title={toolName}>
                            {toolName}
                        </div>
                        <div>{`ID: ${toolId}`}</div>
                        {toolDesc && (
                            <div className={styles.toolDesc} title={toolDesc}>
                                {omitTextByByte(toolDesc, 64)}
                            </div>
                        )}
                    </div>
                    {showAuthor && (
                        <div className={styles.author} onClick={handleOnClickAuthor}>
                            <div className={styles.avatar}>
                                <AntdAvatar
                                    src={
                                        <AntdImage
                                            preview={false}
                                            src={`data:image/png;base64,${author.userInfo.avatar}`}
                                            alt={'Avatar'}
                                        />
                                    }
                                    style={{ background: theme.colorBgLayout }}
                                />
                            </div>
                            <div className={styles.authorName}>{author.userInfo.nickname}</div>
                        </div>
                    )}
                </FlexBox>
            </Card>
        </Draggable>
    )
}

export default StoreCard
