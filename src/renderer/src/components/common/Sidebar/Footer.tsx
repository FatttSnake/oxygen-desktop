import Icon from '@ant-design/icons'
import { COLOR_ERROR } from '@/constants/common.constants'
import { getRedirectUrl } from '@/util/route'
import { getAvatar, getLoginStatus, getNickname, removeToken } from '@/util/auth'
import { navigateToLogin, navigateToUser } from '@/util/navigation'
import { r_auth_logout } from '@/services/auth'

const Footer = () => {
    const matches = useMatches()
    const lastMatch = matches.reduce((_, second) => second)
    const location = useLocation()
    const navigate = useNavigate()
    const [exiting, setExiting] = useState(false)
    const [nickname, setNickname] = useState('')
    const [avatar, setAvatar] = useState('')

    const handleClickAvatar = () => {
        if (getLoginStatus()) {
            navigateToUser(navigate)
        } else {
            navigateToLogin(navigate, undefined, `${lastMatch.pathname}${location.search}`)
        }
    }

    const handleLogout = () => {
        if (exiting) {
            return
        }

        setExiting(true)
        void r_auth_logout().finally(() => {
            removeToken()
            notification.info({
                message: '已退出登录',
                icon: <Icon component={IconOxygenExit} style={{ color: COLOR_ERROR }} />
            })
            setTimeout(() => {
                window.location.reload()
            }, 1500)
        })
    }

    const loginStatus = getLoginStatus()

    useEffect(() => {
        if (getLoginStatus()) {
            void getNickname().then((nickname) => {
                setNickname(nickname)

                void getAvatar().then((avatar) => {
                    setAvatar(`data:image/png;base64,${avatar}`)
                })
            })
        }
    }, [loginStatus])

    return (
        <div className={'footer'}>
            <span
                className={'icon-user'}
                onClick={handleClickAvatar}
                title={getLoginStatus() ? '个人中心' : '登录'}
            >
                {avatar ? (
                    <img src={avatar} alt={'Avatar'} />
                ) : (
                    <Icon viewBox={'-20 0 1024 1024'} component={IconOxygenUser} />
                )}
            </span>
            <span hidden={getLoginStatus()} className={'text'}>
                未
                <NavLink to={getRedirectUrl('/login', `${lastMatch.pathname}${location.search}`)}>
                    登录
                </NavLink>
            </span>
            <span hidden={!getLoginStatus()} className={'text'} title={nickname}>
                {nickname}
            </span>
            <div
                hidden={!getLoginStatus()}
                className={`submenu-exit${!getLoginStatus() ? ' hide' : ''}`}
            >
                <div className={'content'}>
                    <span hidden={!getLoginStatus()} className={'icon-exit'} onClick={handleLogout}>
                        <Icon
                            component={exiting ? IconOxygenLoading : IconOxygenExit}
                            spin={exiting}
                        />
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Footer
