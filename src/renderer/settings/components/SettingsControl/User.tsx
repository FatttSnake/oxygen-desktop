import Icon from '@ant-design/icons'
import useStyles from '%/assets/css/components/settings-control/user.style'
import { message, notification } from '$/util/common'
import { removeAllToken } from '$/util/auth'
import { r_auth_logout } from '$/services/auth'
import { navigateToRoot } from '$/util/navigation'

interface UserProps {
    avatar?: string
    nickname?: string
    username?: string
    isLoading?: boolean
    onClickAvatar?: () => void
    onClickChangeNickname?: () => void
}

const User = ({
    avatar,
    nickname,
    username,
    isLoading,
    onClickAvatar,
    onClickChangeNickname
}: UserProps) => {
    const { styles, theme } = useStyles()
    const navigate = useNavigate()
    const [isExiting, setIsExiting] = useState(false)

    const handleOnCopyToClipboard = () => {
        username &&
            navigator.clipboard
                .writeText(new URL(`/store/${username}`, import.meta.env.VITE_UI_URL).href)
                .then(() => {
                    void message.success('已复制到剪切板')
                })
    }

    const handleOnLogout = () => {
        if (isExiting) {
            return
        }

        setIsExiting(true)
        r_auth_logout().finally(() => {
            navigateToRoot(navigate)
            removeAllToken()
            notification.info({
                message: '已退出登录',
                icon: <Icon component={IconOxygenExit} style={{ color: theme.colorErrorText }} />
            })
        })
    }

    return (
        <div className={styles.root}>
            <AntdTooltip title={'点击获取新头像'}>
                <span className={styles.avatar} onClick={onClickAvatar}>
                    {avatar ? (
                        <img src={`data:image/png;base64,${avatar}`} alt={''} />
                    ) : (
                        <Icon viewBox={'-20 0 1024 1024'} component={IconOxygenUser} />
                    )}
                </span>
            </AntdTooltip>
            <div className={styles.info}>
                {username && (
                    <>
                        <span className={styles.nickname}>{nickname}</span>
                        <a className={styles.url} onClick={handleOnCopyToClipboard}>
                            {username &&
                                new URL(`/store/${username}`, import.meta.env.VITE_UI_URL).href}
                            <Icon component={IconOxygenCopy} />
                        </a>
                        <a className={styles.modifyNickname} onClick={onClickChangeNickname}>
                            修改昵称
                        </a>
                    </>
                )}
            </div>
            <AntdButton disabled={isLoading} loading={isExiting} onClick={handleOnLogout}>
                退出登录
            </AntdButton>
        </div>
    )
}

export default User
