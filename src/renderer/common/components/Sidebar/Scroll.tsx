import { PropsWithChildren } from 'react'
import useStyles from '!/assets/css/cpmponents/sidebar/scroll.style'
import HideScrollbar from '!/components/HideScrollbar'

const Scroll = (props: PropsWithChildren) => {
    const { styles } = useStyles()

    return (
        <div className={styles.scroll}>
            <HideScrollbar
                isShowVerticalScrollbar={true}
                scrollbarWidth={2}
                autoHideWaitingTime={800}
            >
                {props.children}
            </HideScrollbar>
        </div>
    )
}

export default Scroll
