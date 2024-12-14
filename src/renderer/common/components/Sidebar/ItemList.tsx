import { PropsWithChildren } from 'react'
import useStyles from '$/assets/css/cpmponents/sidebar/item-list.style'

const ItemList = (props: PropsWithChildren) => {
    const { styles } = useStyles()

    return <ul className={styles.root}>{props.children}</ul>
}

export default ItemList
