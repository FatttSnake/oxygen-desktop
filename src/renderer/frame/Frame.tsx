import CommonFramework from '$/CommonFramework'
import FitFullscreen from '$/components/FitFullscreen'
import TitleBar from '#/components/TitleBar'
import ToolMenu from '#/menus/ToolMenu'
import MenuFramework from '#/components/MenuFramework'
import ToolLoader from '#/components/ToolLoader'
import SimpleTitleBar from '#/components/SimpleTitleBar'

const Frame = () => {
    const [isShowMenu, setIsShowMenu] = useState(false)

    useEffect(() => {
        oxygenApi.window.common.afterLoad()
    }, [])

    return (
        <CommonFramework>
            <FitFullscreen className={'flex-vertical'}>
                {oxygenApi.windowType === 'main' ? (
                    <>
                        <TitleBar onShowMenuChange={setIsShowMenu} />
                        <MenuFramework isVisible={isShowMenu}>
                            <ToolMenu />
                        </MenuFramework>
                    </>
                ) : (
                    <SimpleTitleBar />
                )}
            </FitFullscreen>
            <ToolLoader />
        </CommonFramework>
    )
}

export default Frame
