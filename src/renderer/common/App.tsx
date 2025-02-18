import { Router } from '@remix-run/router'
import { init } from '$/util/common'
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
    const [messageInstance, messageHolder] = message.useMessage()
    const [notificationInstance, notificationHolder] = notification.useNotification()
    const [modalInstance, modalHolder] = AntdModal.useModal()
    const [routerState, setRouterState] = useState(getRouterFunc)

    useEffect(() => {
        init(messageInstance, notificationInstance, modalInstance)
    }, [])

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
            {messageHolder}
            {notificationHolder}
            {modalHolder}
        </CommonFramework>
    )
}

export default App
