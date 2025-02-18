import { Location } from 'react-router'
import { PRODUCTION_NAME } from '$/constants/common.constants'
import { setPageTitle, message } from '$/util/common'
import { getLoginStatus, getVerifyStatus_async } from '$/util/auth'
import { navigateToLocation } from '$/util/navigation'

const AuthRoute = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const matches = useMatches()
    const lastMatch = matches.reduce((_, second) => second)
    const handle = lastMatch.handle as RouteHandle
    const location = useLocation()
    const outlet = useOutlet()
    const isLogin = getLoginStatus()
    const isVerify = getVerifyStatus_async()

    const [prevLocation, setPrevLocation] = useState<Location>()
    useBlocker(({ currentLocation }) => {
        console.log('currentLocation', currentLocation)
        setPrevLocation(currentLocation)
        return false
    })

    return useMemo(() => {
        setPageTitle(
            `${handle?.titlePrefix ?? ''}${
                handle?.title ? handle?.title : PRODUCTION_NAME
            }${handle?.titlePostfix ?? ''}`
        )

        if (matches.some(({ handle }) => (handle as RouteHandle)?.auth)) {
            if (!isLogin) {
                console.log('qwe')
                void message.warning({ key: 'no-login', content: '未登录' })
                setTimeout(() => {
                    navigateToLocation(navigate, prevLocation)
                })
                return undefined
            }
            if (isVerify === false && lastMatch.pathname !== '/verify') {
                return <Navigate to={'/verify'} />
            }
        }
        if (isLogin && ['/login', '/forget'].includes(lastMatch.pathname)) {
            if (searchParams.has('redirect')) {
                return <Navigate to={searchParams.get('redirect') ?? '/'} />
            } else {
                return <Navigate to={'/'} />
            }
        }

        if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
            return <Navigate to={location.pathname.substring(0, location.pathname.length - 1)} />
        }

        return outlet
    }, [
        handle?.title,
        handle?.titlePostfix,
        handle?.titlePrefix,
        isLogin,
        lastMatch.pathname,
        location.search,
        matches,
        outlet
    ])
}

export default AuthRoute
