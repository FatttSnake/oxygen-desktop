import { PropsWithChildren, ReactNode } from 'react'
import Icon from '@ant-design/icons'
import '@/assets/css/components/common/loading-mask.scss'
import { COLOR_FONT_MAIN } from '@/constants/common.constants'

interface LoadingMaskProps extends PropsWithChildren {
    hidden?: boolean
    maskContent?: ReactNode
}
const LoadingMask = (props: LoadingMaskProps) => {
    const loadingIcon = (
        <>
            <Icon
                component={IconOxygenLoading}
                style={{ fontSize: 24, color: COLOR_FONT_MAIN }}
                spin
            />
        </>
    )
    return props.hidden ? (
        props.children
    ) : (
        <>
            <div className={'loading-mask'}>
                {props.maskContent || <AntdSpin indicator={loadingIcon} />}
            </div>
        </>
    )
}

export default LoadingMask
