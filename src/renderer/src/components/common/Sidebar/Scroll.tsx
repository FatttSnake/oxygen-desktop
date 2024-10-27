import { PropsWithChildren } from 'react'
import styles from '@/assets/css/components/common/sidebar.module.less'
import HideScrollbar from '@/components/common/HideScrollbar'

const Scroll = (props: PropsWithChildren) => {
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
