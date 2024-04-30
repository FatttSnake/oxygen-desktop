import '@/assets/css/pages/tools-framework.scss'
import { tools } from '@/router/tools'
import FitFullscreen from '@/components/common/FitFullscreen'
import Sidebar from '@/components/common/Sidebar'
import FullscreenLoadingMask from '@/components/common/FullscreenLoadingMask'

const ToolsFramework = () => {
    return (
        <>
            <FitFullscreen data-component={'tools-framework'} className={'flex-horizontal'}>
                <div className={'left-panel'}>
                    <Sidebar title={'氧工具'}>
                        <Sidebar.ItemList>
                            <Sidebar.Item
                                end
                                path={'/store'}
                                icon={tools[0].icon}
                                text={tools[0].name}
                            />
                            <Sidebar.Item
                                end
                                path={'/repository'}
                                icon={tools[1].icon}
                                text={tools[1].name}
                            />
                        </Sidebar.ItemList>
                        <Sidebar.Separate style={{ marginBottom: 0 }} />
                        <Sidebar.Scroll>
                            <Sidebar.ItemList>
                                {tools.map((tool) => {
                                    return tool.menu &&
                                        tool.id !== 'tools-store' &&
                                        tool.id !== 'tools-repository' ? (
                                        <Sidebar.Item
                                            path={tool.absolutePath}
                                            icon={tool.icon}
                                            text={tool.name}
                                            key={tool.id}
                                        >
                                            {tool.children &&
                                                tool.children.map((subTool) => {
                                                    return (
                                                        <Sidebar.Item
                                                            path={subTool.absolutePath}
                                                            text={subTool.name}
                                                            key={subTool.id}
                                                        />
                                                    )
                                                })}
                                        </Sidebar.Item>
                                    ) : undefined
                                })}
                            </Sidebar.ItemList>
                        </Sidebar.Scroll>
                    </Sidebar>
                </div>
                <div className={'right-panel'}>
                    <Suspense
                        fallback={
                            <>
                                <FullscreenLoadingMask />
                            </>
                        }
                    >
                        <Outlet />
                    </Suspense>
                </div>
            </FitFullscreen>
        </>
    )
}

export default ToolsFramework
