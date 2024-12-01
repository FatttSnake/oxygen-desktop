import { PropsWithChildren } from 'react'
import useStyles from '@/assets/css/window-frame.style'

const WindowFrame = ({ children }: PropsWithChildren) => {
    const { styles, theme } = useStyles()

    useEffect(() => {
        window.api.updateTitleBar(theme.colorBgContainer, theme.colorText)
    }, [theme])

    return (
        <div className={styles.root}>
            <div className={styles.titleBar}>
                <div className={styles.titleContent}>
                    <div className={styles.titleBarLeft}>left</div>
                    <div className={styles.titleBarRight}>right</div>
                </div>
            </div>
            <div className={styles.windowContent}>{children}</div>
        </div>
    )
}

export default WindowFrame
