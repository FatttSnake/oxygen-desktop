import { PRODUCTION_NAME } from '$/constants/common.constants'
import { setPageTitle } from '$/util/common'
import { getLoginStatus } from '$/util/auth'

const AuthRoute = () => {
    const matches = useMatches()
    const lastMatch = matches.reduce((_, second) => second)
    const handle = lastMatch.handle as RouteHandle
    const isLogin = getLoginStatus()
    const outlet = useOutlet()

    return useMemo(() => {
        setPageTitle(
            `${handle?.titlePrefix ?? ''}${
                handle?.title ? handle?.title : PRODUCTION_NAME
            }${handle?.titlePostfix ?? ''}`
        )

        return outlet
    }, [
        handle?.title,
        handle?.titlePostfix,
        handle?.titlePrefix,
        isLogin,
        lastMatch.pathname,
        matches,
        outlet
    ])
}

export default AuthRoute
