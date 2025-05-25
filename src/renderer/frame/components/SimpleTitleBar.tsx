import Icon from '@ant-design/icons'
import useStyles from '#/assets/css/title-bar.style'

const SimpleTitleBar = () => {
    const { styles, theme } = useStyles()
    const { x } = navigator.windowControlsOverlay!.getTitlebarAreaRect()

    useEffect(() => {
        oxygenApi.window.titleBarOverlay.setColor(theme.colorBgContainer, theme.colorText)
    }, [theme])

    return (
        <div className={styles.root}>
            <div className={styles.titleBarLeft} />
            <div className={styles.titleBarCenter}>
                <div className={styles.operation}>
                    {x === 0 && <Icon component={IconOxygenLogo} />}
                </div>
            </div>
            <div className={styles.titleBarRight} />
        </div>
    )
}

export default SimpleTitleBar
