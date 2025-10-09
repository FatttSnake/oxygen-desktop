import Icon from '@ant-design/icons'
import useStyles from '#/assets/css/title-bar.style'

const SimpleTitleBar = () => {
    const { styles, theme } = useStyles()
    const { x } = navigator.windowControlsOverlay!.getTitlebarAreaRect()
    const [windowIcon, setWindowIcon] = useState(oxygenApi.windowIcon)
    const [windowTitle, setWindowTitle] = useState(oxygenApi.windowTitle)

    useEffect(() => {
        oxygenApi.window.titleBarOverlay.setColor(theme.colorBgContainer, theme.colorText)
    }, [theme])

    useEffect(() => {
        oxygenApi.window.common.onIcon(setWindowIcon)
        oxygenApi.window.common.onTitle(setWindowTitle)

        return () => {
            oxygenApi.window.common.offIcon()
            oxygenApi.window.common.offTitle()
        }
    }, [])

    return (
        <div className={styles.root}>
            <div className={styles.titleBarLeft} />
            <div className={styles.titleBarCenter}>
                <div className={styles.operation}>
                    {x === 0 &&
                        (windowIcon ? (
                            <img className={styles.icon} src={windowIcon} alt={''} />
                        ) : (
                            <Icon component={IconOxygenLogo} />
                        ))}
                </div>
                <div className={styles.title}>{windowTitle}</div>
            </div>
            <div className={styles.titleBarRight} />
        </div>
    )
}

export default SimpleTitleBar
