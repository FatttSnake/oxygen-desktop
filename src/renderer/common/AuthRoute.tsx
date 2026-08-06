import { PRODUCTION_NAME } from '$/constants/common.constants'
import { setPageTitle, message } from '$/util/common'
import { getLoginStatus, getVerifyStatus } from '$/util/auth'
import { AppContext } from '$/App'
import { checkAuth } from '$/util/route'

const AuthRoute = () => {
    const { router } = useContext(AppContext)
    const matches = useMatches()
    const lastMatch = matches.reduce((_, second) => second)
    const handle = lastMatch.handle as RouteHandle
    const location = useLocation()
    const outlet = useOutlet()

    useBlocker(({ nextLocation }) => {
        if (checkAuth(router!.routes, nextLocation.pathname)) {
            if (!getLoginStatus()) {
                void message.warning('未登录')
                return true
            }
            if (getVerifyStatus() === false) {
                void message.warning('账户未验证')
                return true
            }
        }
        return false
    })

    useEffect(() => {
        oxygenApi.account.loginStatus.onUpdate(() => {
            document.location.reload()
        })

        return () => {
            oxygenApi.account.loginStatus.offUpdate()
        }
    }, [])

    return useMemo(() => {
        setPageTitle(
            `${handle?.titlePrefix ?? ''}${
                handle?.title ? handle?.title : PRODUCTION_NAME
            }${handle?.titlePostfix ?? ''}`
        )

        if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
            return <Navigate to={location.pathname.substring(0, location.pathname.length - 1)} />
        }

        return outlet
    }, [
        handle?.title,
        handle?.titlePostfix,
        handle?.titlePrefix,
        lastMatch.pathname,
        location.search,
        matches,
        outlet
    ])
}

export default AuthRoute
