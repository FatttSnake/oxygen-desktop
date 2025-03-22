import _ from 'lodash'
import { DATABASE_SELECT_SUCCESS } from '$/constants/common.constants'
import { floorNumber } from '$/util/common'
import { getFullTitle } from '$/util/route'
import { r_sys_user_info_get } from '$/services/system'

let getUserInfoPromise: Promise<UserWithPowerInfoVo> | null = null

let accessToken = await oxygenApi.account.accessToken.get()
oxygenApi.account.accessToken.onUpdate((value) => (accessToken = value))
let refreshToken = await oxygenApi.account.refreshToken.get()
oxygenApi.account.refreshToken.onUpdate((value) => (refreshToken = value))
let userInfo = await oxygenApi.account.userInfo.get()
oxygenApi.account.userInfo.onUpdate((value) => (userInfo = value))

export const getAccessToken = () => accessToken

export const setAccessToken = (value: string) => {
    oxygenApi.account.accessToken.update(value)
    accessToken = value
}

export const getRefreshToken = () => refreshToken

export const setRefreshToken = (value: string) => {
    oxygenApi.account.refreshToken.update(value)
    refreshToken = value
}

export const requestUserInfo = async () => {
    let user: UserWithPowerInfoVo | undefined

    await r_sys_user_info_get().then((value) => {
        const response = value.data
        if (response.code === DATABASE_SELECT_SUCCESS) {
            user = response.data == null ? undefined : response.data
            setUserInfo(user)
        }
    })

    return new Promise<UserWithPowerInfoVo>((resolve, reject) => {
        if (user) {
            resolve(user)
        }
        reject(user)
    })
}

export const getUserInfo = async (force = false): Promise<UserWithPowerInfoVo> => {
    if (userInfo && !force) {
        return new Promise((resolve) => {
            resolve(userInfo!)
        })
    }
    return requestUserInfo()
}

export const getUserInfoQueue = async (): Promise<UserWithPowerInfoVo | undefined> => {
    if (!getUserInfoPromise) {
        getUserInfoPromise = getUserInfo().finally(() => {
            getUserInfoPromise = null
        })
    }
    await getUserInfoPromise

    return userInfo
}

export const setUserInfo = async (value?: UserWithPowerInfoVo) => {
    oxygenApi.account.userInfo.update(value)
    userInfo = value
}

export const removeAllToken = () => {
    oxygenApi.account.accessToken.update()
    accessToken = undefined
    oxygenApi.account.refreshToken.update()
    refreshToken = undefined
    oxygenApi.account.userInfo.update()
    userInfo = undefined
    oxygenApi.account.loginStatus.update(false)
}

export const getLoginStatus = () => refreshToken !== undefined

export const getVerifyStatus_async = () => userInfo?.verified

export const getNickname = async () => {
    const user = await getUserInfoQueue()

    return user?.userInfo.nickname
}

export const getAvatar = async () => {
    const user = await getUserInfoQueue()

    return user?.userInfo.avatar
}

export const getUsername = async () => {
    const user = await getUserInfoQueue()

    return user?.username
}

export const getUserId = async () => {
    const user = await getUserInfoQueue()

    return user?.id
}

export const powerListToPowerTree = (
    modules: ModuleVo[],
    menus: MenuVo[],
    funcs: FuncVo[],
    operations: OperationVo[]
): _DataNode[] => {
    const moduleChildrenMap = new Map<string, _DataNode[]>()
    const menuChildrenMap = new Map<string, _DataNode[]>()
    const funcChildrenMap = new Map<string, _DataNode[]>()

    operations.forEach((operation) => {
        if (funcChildrenMap.get(String(operation.funcId))) {
            funcChildrenMap.get(String(operation.funcId))?.push({
                title: operation.name,
                key: operation.id,
                value: operation.id
            })
        } else {
            funcChildrenMap.set(String(operation.funcId), [
                {
                    title: operation.name,
                    key: operation.id,
                    value: operation.id
                }
            ])
        }
    })

    const funcTrees = parentToTree(
        funcs.map((func) => ({
            title: func.name,
            key: func.id,
            value: func.id,
            parentId: func.parentId,
            children: funcChildrenMap.get(String(func.id))
        }))
    )

    funcTrees.forEach((func) => {
        if (menuChildrenMap.get(String(floorNumber(func.key as number, 5)))) {
            menuChildrenMap.get(String(floorNumber(func.key as number, 5)))?.push(func)
        } else {
            menuChildrenMap.set(String(floorNumber(func.key as number, 5)), [func])
        }
    })

    const menuTrees = parentToTree(
        menus.map((menu) => ({
            title: menu.name,
            key: menu.id,
            value: menu.id,
            parentId: menu.parentId,
            children: menuChildrenMap.get(String(menu.id))
        }))
    )

    menuTrees.forEach((menu) => {
        if (moduleChildrenMap.get(String(floorNumber(menu.key as number, 7)))) {
            moduleChildrenMap.get(String(floorNumber(menu.key as number, 7)))?.push(menu)
        } else {
            moduleChildrenMap.set(String(floorNumber(menu.key as number, 7)), [menu])
        }
    })

    return modules.map((module) =>
        getFullTitle({
            title: module.name,
            key: module.id,
            value: module.id,
            children: moduleChildrenMap.get(String(module.id))
        })
    )
}

const parentToTree = (data: _DataNode[]): _DataNode[] => {
    const parents = data.filter((value) => !value.parentId)
    const children = data.filter((value) => value.parentId)

    const translator = (parents: _DataNode[], children: _DataNode[]) => {
        parents.forEach((parent) => {
            children.forEach((current, index) => {
                if (current.parentId === parent.key) {
                    const temp = _.cloneDeep(children)
                    temp.splice(index, 1)
                    translator([current], temp)
                    typeof parent.children !== 'undefined'
                        ? parent.children.push({ ...current })
                        : (parent.children = [current])
                }
            })
        })
    }

    translator(parents, children)

    return parents
}

export const getPermissionPath = (): string[] => {
    if (!userInfo) {
        return []
    }

    return userInfo.menus.map((menu) => menu.url)
}

export const hasPathPermission = (path: string) =>
    getPermissionPath().some((value) => RegExp(value).test(path))

export const getPermission = (): string[] => {
    if (!userInfo) {
        return []
    }

    return userInfo.operations.map((operation) => operation.code)
}

export const hasPermission = (operationCode: string) => getPermission().includes(operationCode)
