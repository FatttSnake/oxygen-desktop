export const useConnectivityMode = (): ConnectivityMode => {
    const [mode, setMode] = useState<ConnectivityMode>('loading')

    useEffect(() => {
        oxygenApi.app.config.get().then((state) => setMode(state.mode))
        oxygenApi.app.config.onUpdate((state) => setMode(state.mode))

        return () => {
            oxygenApi.app.config.offUpdate()
        }
    }, [])

    return mode
}
