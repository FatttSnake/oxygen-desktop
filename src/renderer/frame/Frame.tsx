import CommonFramework from '$/CommonFramework'
import FitFullscreen from '$/components/FitFullscreen'
import TitleBar from '#/components/TitleBar'
import ToolMenu from '#/menus/ToolMenu'
import MenuFramework from '#/components/MenuFramework'

const Frame = () => {
    const [isShowMenu, setIsShowMenu] = useState(false)

    return (
        <CommonFramework>
            <FitFullscreen className={'flex-vertical'}>
                <TitleBar onShowMenuChange={setIsShowMenu} />
                {isShowMenu && (
                    <MenuFramework>
                        <ToolMenu />
                    </MenuFramework>
                )}
            </FitFullscreen>
        </CommonFramework>
    )
}

export default Frame
