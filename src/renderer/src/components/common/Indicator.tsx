import _ from 'lodash'
import '@/assets/css/components/common/indicator.scss'

interface IndicatorProps {
    total: number
    current: number
    onSwitch?: (index: number) => void
}

const Indicator = ({ total, current, onSwitch }: IndicatorProps) => {
    const handleClick = (index: number) => {
        return () => {
            onSwitch?.(index)
        }
    }

    return (
        <>
            <ul className={'dot-list flex-vertical'}>
                {_.range(0, total).map((_value, index) => {
                    return (
                        <li
                            key={index}
                            className={`item center-box${index === current ? ' active' : ''}`}
                            onClick={handleClick(index)}
                        >
                            <div className={'dot'} />
                        </li>
                    )
                })}
            </ul>
        </>
    )
}

export default Indicator
