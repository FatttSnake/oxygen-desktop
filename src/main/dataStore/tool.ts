import store from '.'

export const listTool = () => store.get('installedTools')

export const installTool = (tools: Record<string, Record<Platform, ToolVo>>) => {
    const installedTools = listTool()
    store.set('installedTools', { ...installedTools, ...tools })

    return listTool()
}

export const uninstallTool = (key: string) => {
    const { [key]: _, ...newTools } = listTool()
    store.set('installedTools', newTools)

    return listTool()
}
