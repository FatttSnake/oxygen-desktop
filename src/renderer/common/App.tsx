import { ConfigProvider, useConfig } from '$/components/config/ConfigContext'
import CommonFramework from '$/CommonFramework'
import FullscreenLoadingMask from '$/components/FullscreenLoadingMask'

export const AppContext = createContext<{
    router?: ReturnType<typeof createBrowserRouter>
}>({})

interface AppProps {
    getRouterFunc: (mode: ConnectivityMode) => ReturnType<typeof createBrowserRouter>
}

const App = ({ getRouterFunc }: AppProps) => {
    return (
        <CommonFramework>
            <ConfigProvider>
                <AppRouter getRouterFunc={getRouterFunc} />
            </ConfigProvider>
        </CommonFramework>
    )
}

const AppRouter = ({ getRouterFunc }: AppProps) => {
    const { mode } = useConfig()
    const [routerMap] = useState(() => ({
        online: getRouterFunc('online'),
        offline: getRouterFunc('offline')
    }))
    const router = mode === 'offline' ? routerMap.offline : routerMap.online

    return (
        <AppContext.Provider
            value={{
                router
            }}
        >
            <Suspense fallback={<FullscreenLoadingMask />}>
                <RouterProvider key={mode} router={router} />
            </Suspense>
        </AppContext.Provider>
    )
}

export default App
