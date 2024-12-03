import { PropsWithChildren } from 'react'
import Icon from '@ant-design/icons'
import useStyles from '@/assets/css/window-frame.style'

const WindowFrame = ({ children }: PropsWithChildren) => {
    const { styles, theme } = useStyles()
    const { x } = navigator.windowControlsOverlay!.getTitlebarAreaRect()
    const [title, setTitle] = useState<string>(document.title)

    useEffect(() => {
        window.baseApi.updateTitleBar(theme.colorBgContainer, theme.colorText)
    }, [theme])

    useEffect(() => {
        const titleChangeObserver = new MutationObserver(() => {
            setTitle(document.title)
        })
        const titleNode = document.querySelector('title')
        titleNode && titleChangeObserver.observe(titleNode, { childList: true })

        return () => {
            titleChangeObserver.disconnect()
        }
    })

    return (
        <div className={styles.root}>
            <div className={styles.titleBar}>
                <div className={styles.titleContent}>
                    <div className={styles.titleBarLeft}>
                        {x === 0 && <Icon component={IconOxygenLogo} />}
                    </div>
                    <div className={styles.titleBarCenter}>{title}</div>
                    <div className={styles.titleBarRight}></div>
                </div>
            </div>
            <div className={styles.windowContent}>{children}</div>
        </div>
    )
}

export default WindowFrame
