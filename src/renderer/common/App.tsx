import { Router } from '@remix-run/router'
import CommonFramework from '$/CommonFramework'
import FullscreenLoadingMask from '$/components/FullscreenLoadingMask'

export const AppContext = createContext<{
    router?: Router
    refreshRouter: () => void
}>({
    refreshRouter: () => {}
})

interface AppProps {
    getRouterFunc: () => Router
}

const App = ({ getRouterFunc }: AppProps) => {
    const [routerState, setRouterState] = useState(getRouterFunc)

    return (
        <CommonFramework>
            <AppContext.Provider
                value={{
                    router: routerState,
                    refreshRouter: () => {
                        setRouterState(getRouterFunc())
                    }
                }}
            >
                <Suspense fallback={<FullscreenLoadingMask />}>
                    <RouterProvider router={routerState} />
                </Suspense>
            </AppContext.Provider>
        </CommonFramework>
    )
}

export default App
