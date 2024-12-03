export const n_tool_get = () => window.baseApi.getInstalledTool()

export const n_tool_install = (tools: Record<string, Record<Platform, ToolVo>>) =>
    window.baseApi.installTool(tools)

export const n_tool_uninstall = (username: string, toolId: string) =>
    window.baseApi.uninstallTool(`${username}:${toolId}`)

export const n_tool_detail = async (
    username: string,
    toolId: string,
    platform: Platform
): Promise<ToolVo | undefined> => (await n_tool_get())?.[`${username}:${toolId}`]?.[platform]
