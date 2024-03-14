import { PropsWithChildren } from 'react'
import HideScrollbar from '@/components/common/HideScrollbar'

const Scroll = (props: PropsWithChildren) => {
    return (
        <div className={'scroll'}>
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
