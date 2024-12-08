import { PropsWithChildren } from 'react'
import useStyles from '%/assets/css/menu-framework.style'

const MenuFramework = ({ children }: PropsWithChildren) => {
    const { styles } = useStyles()
    const rootRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!rootRef.current) {
            return
        }

        oxygenApi.updateMenuWidth(rootRef.current.clientWidth)
        const resizeObserver = new ResizeObserver(
            ([
                {
                    contentRect: { width }
                }
            ]) => {
                oxygenApi.updateMenuWidth(width)
            }
        )
        resizeObserver.observe(rootRef.current)

        return () => {
            resizeObserver.disconnect()
        }
    }, [])

    return (
        <div className={styles.root} ref={rootRef}>
            {children}
        </div>
    )
}

export default MenuFramework
