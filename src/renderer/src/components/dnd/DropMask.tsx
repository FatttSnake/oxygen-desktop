import '@/assets/css/components/dnd/drop-mask.scss'
import Icon from '@ant-design/icons'

const DropMask = () => {
    return (
        <div data-component={'component-drop-mask'}>
            <div className={'drop-mask-border'}>
                <Icon component={IconOxygenReceive} />
            </div>
        </div>
    )
}

export default DropMask
