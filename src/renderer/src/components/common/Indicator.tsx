import _ from 'lodash'
import styles from '@/assets/css/components/common/indicator.module.less'

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
            <ul className={`${styles.dotList} flex-vertical`}>
                {_.range(0, total).map((_value, index) => {
                    return (
                        <li
                            key={index}
                            className={`${styles.item} center-box${index === current ? ` ${styles.active}` : ''}`}
                            onClick={handleClick(index)}
                        >
                            <div className={styles.dot} />
                        </li>
                    )
                })}
            </ul>
        </>
    )
}

export default Indicator
