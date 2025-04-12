import { PropsWithChildren } from 'react'
import useStyles from '#/assets/css/menu-framework.style'

const MenuFramework = ({ children }: PropsWithChildren) => {
    const { styles, cx } = useStyles()
    const menuRef = useRef<HTMLDivElement>(null)
    const [isCollapse, setIsCollapse] = useState((menuRef.current?.clientWidth ?? 0) <= 80)

    useEffect(() => {
        if (!menuRef.current) {
            return
        }

        oxygenApi.sidebar.width.update(menuRef.current.clientWidth)
        const resizeObserver = new ResizeObserver(
            ([
                {
                    contentRect: { width }
                }
            ]) => {
                oxygenApi.sidebar.width.update(width)
                setIsCollapse(width <= 80)
            }
        )
        resizeObserver.observe(menuRef.current)

        return () => {
            resizeObserver.disconnect()
        }
    }, [])

    return (
        <div className={cx(styles.root, isCollapse ? styles.collapsed : undefined)}>
            <div className={styles.menu} ref={menuRef}>
                {children}
            </div>
            <div className={styles.content} />
        </div>
    )
}

export default MenuFramework
