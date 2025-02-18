import _ from 'lodash'
import { getAuthRoute, mapJsonToRoute } from '$/util/route'

const root: RouteJsonObject[] = [
    {
        path: '/',
        absolutePath: '/',
        component: lazy(() => import('$/AuthRoute')),
        children: [
            {
                path: '*',
                absolutePath: '*',
                element: <Navigate to={'/'} replace />
            }
        ]
    }
]

export const getRouter = () => createBrowserRouter(mapJsonToRoute(getAuthRoute(_.cloneDeep(root))))
