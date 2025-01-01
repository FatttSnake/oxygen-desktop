import Icon from '@ant-design/icons'
import useStyles from '#/assets/css/title-bar.style'
import TabList from '#/components/TabList'

const TitleBar = () => {
    const { styles, cx } = useStyles()
    const { x } = navigator.windowControlsOverlay!.getTitlebarAreaRect()
    const [isCollapse, setIsCollapse] = useState(false)

    const handleOnClickExpand = () => {
        setIsCollapse(!isCollapse)
    }

    return (
        <div className={styles.root}>
            <div className={styles.titleBarLeft} />
            <div className={styles.titleBarCenter}>
                <div className={styles.operation}>
                    {x === 0 && <Icon component={IconOxygenLogo} />}
                    <AntdButton size={'small'} onClick={handleOnClickExpand}>
                        <Icon
                            component={IconOxygenExpand}
                            className={cx(
                                styles.expandIcon,
                                isCollapse ? styles.collapse : undefined
                            )}
                        />
                    </AntdButton>
                </div>
                <div className={styles.tabs}>
                    <TabList
                        pinTabs={[{ title: 'PinTab' }]}
                        tabs={[
                            { title: 'tab1' },
                            { title: 'tab2' },
                            { title: 'tab3' },
                            { title: 'tab4' }
                        ]}
                    />
                </div>
            </div>
            <div className={styles.titleBarRight} />
        </div>
    )
}

export default TitleBar
