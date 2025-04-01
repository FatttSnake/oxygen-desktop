import CommonFramework from '$/CommonFramework'
import FitFullscreen from '$/components/FitFullscreen'
import TitleBar from '#/components/TitleBar'
import ToolMenu from '#/menus/ToolMenu'
import MenuFramework from '#/components/MenuFramework'
import ToolLoader from '#/components/ToolLoader'

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
            <ToolLoader />
        </CommonFramework>
    )
}

export default Frame
