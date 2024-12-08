import { PropsWithChildren } from 'react'
import { hasPathPermission, hasPermission } from '@/util/auth'

interface PermissionProps extends PropsWithChildren {
    operationCode?: string[]
    path?: string
}

const Permission = (props: PermissionProps) => {
    if (
        (!props.operationCode || props.operationCode.some(hasPermission)) &&
        (!props.path || hasPathPermission(props.path))
    ) {
        return props.children
    }

    return <></>
}

export default Permission
