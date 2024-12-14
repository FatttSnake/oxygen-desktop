import { init } from '$/util/common'
import CommonFramework from '$/CommonFramework'
import FullscreenLoadingMask from '$/components/FullscreenLoadingMask'
import { getRouter } from '@/router'

export const AppContext = createContext({
    refreshRouter: () => {}
})

const App = () => {
    const [messageInstance, messageHolder] = message.useMessage()
    const [notificationInstance, notificationHolder] = notification.useNotification()
    const [modalInstance, modalHolder] = AntdModal.useModal()
    const [routerState, setRouterState] = useState(getRouter)

    useEffect(() => {
        init(messageInstance, notificationInstance, modalInstance)
    }, [])

    return (
        <CommonFramework>
            <AppContext.Provider
                value={{
                    refreshRouter: () => {
                        setRouterState(getRouter())
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
