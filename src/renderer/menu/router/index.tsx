import Tool from '%/menus/Tool'

const root: RouteObject[] = [
    {
        path: '*',
        Component: Tool
    }
]

export const getRouter = () => createBrowserRouter(root)
