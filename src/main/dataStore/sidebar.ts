import store from './store'

const getIsCollapsed = () => store.get('sidebar_isCollapsed')

const saveIsCollapsed = (value: boolean) => store.set('sidebar_isCollapsed', value)

const getMenuItems = () => store.get('sidebar_menuItems')

const saveMenuItems = (value: SideBarMenuItem[]) => store.set('sidebar_menuItems', value)

export default {
    getIsCollapsed,
    saveIsCollapsed,
    getMenuItems,
    saveMenuItems
}
