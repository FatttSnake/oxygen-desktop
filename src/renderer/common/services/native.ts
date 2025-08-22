import localforage from 'localforage'

const toolDB = localforage.createInstance({ name: 'toolDB' })

export const n_tool_get = async (username: string, toolId: string) => {
    return toolDB.getItem<Record<Platform, LocalToolVo>>(`${username}:${toolId}`)
}

export const n_tool_list = async () => {
    const toolList: Record<Platform, LocalToolVo>[] = []
    await toolDB.iterate<Record<Platform, LocalToolVo>, void>((value) => {
        toolList.push(value)
    })
    return toolList
}

export const n_tool_map = async () => {
    const toolMap: Record<string, Record<Platform, LocalToolVo>> = {}
    await toolDB.iterate<Record<Platform, LocalToolVo>, void>((value, key) => {
        toolMap[key] = value
    })
    return toolMap
}

export const n_tool_install = async (
    username: string,
    toolId: string,
    tools: Record<Platform, LocalToolVo>
) => toolDB.setItem(`${username}:${toolId}`, tools)

export const n_tool_uninstall = async (username: string, toolId: string) =>
    toolDB.removeItem(`${username}:${toolId}`)

export const n_tool_get_one = async (
    username: string,
    toolId: string,
    platform: Platform
): Promise<LocalToolVo | undefined> => (await n_tool_get(username, toolId))?.[platform]
