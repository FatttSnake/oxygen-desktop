import CommonFramework from '!/CommonFramework'
import MenuFramework from '%/MenuFramework'
import Tool from '%/menus/Tool'

const App = () => {
    return (
        <CommonFramework>
            <MenuFramework>
                <Tool />
            </MenuFramework>
        </CommonFramework>
    )
}

export default App
