import localforage from 'localforage'

const toolDB = localforage.createInstance({ name: 'toolDB' })

export const n_tool_get = async (username: string, toolId: string) => {
    return toolDB.getItem<Record<Platform, ToolVo>>(`${username}:${toolId}`)
}

export const n_tool_list = async () => {
    const toolList: Record<Platform, ToolVo>[] = []
    await toolDB.iterate<Record<Platform, ToolVo>, void>((value) => {
        toolList.push(value)
    })
    return toolList
}

export const n_tool_map = async () => {
    const toolMap: Record<string, Record<Platform, ToolVo>> = {}
    await toolDB.iterate<Record<Platform, ToolVo>, void>((value, key) => {
        toolMap[key] = value
    })
    return toolMap
}

export const n_tool_install = async (
    username: string,
    toolId: string,
    tools: Record<Platform, ToolVo>
) => toolDB.setItem(`${username}:${toolId}`, tools)

export const n_tool_uninstall = async (username: string, toolId: string) =>
    toolDB.removeItem(`${username}:${toolId}`)

export const n_tool_detail = async (
    username: string,
    toolId: string,
    platform: Platform
): Promise<ToolVo | undefined> => (await n_tool_get(username, toolId))?.[platform]
