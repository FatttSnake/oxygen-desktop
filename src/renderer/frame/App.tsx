import CommonFramework from '$/CommonFramework'
import FitFullscreen from '$/components/FitFullscreen'
import TitleBar from '#/TitleBar'
import ToolMenu from '#/menus/Tool'
import MenuFramework from '#/MenuFramework'

const App = () => {
    return (
        <CommonFramework>
            <FitFullscreen className={'flex-vertical'}>
                <TitleBar />
                <MenuFramework>
                    <ToolMenu />
                </MenuFramework>
            </FitFullscreen>
        </CommonFramework>
    )
}

export default App
