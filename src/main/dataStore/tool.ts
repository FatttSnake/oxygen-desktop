import store from '.'

export const listTool = () => store.get('installedTools')

export const installTool = (tools: Record<string, Record<Platform, ToolVo>>) => {
    const installedTools = listTool()
    store.set('installedTools', { ...installedTools, ...tools })

    return store.get('installedTools')
}
