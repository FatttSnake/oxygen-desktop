import { PropsWithChildren } from 'react'

const ItemList = (props: PropsWithChildren) => {
    return <ul>{props.children}</ul>
}

export default ItemList
