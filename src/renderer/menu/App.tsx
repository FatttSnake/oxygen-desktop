import CommonFramework from '!/CommonFramework'
import { getRouter } from '%/router'
import MenuFramework from '%/MenuFramework'

const App = () => {
    const [routerState] = useState(getRouter)

    return (
        <CommonFramework>
            <MenuFramework>
                <RouterProvider router={routerState} />
            </MenuFramework>
        </CommonFramework>
    )
}

export default App
