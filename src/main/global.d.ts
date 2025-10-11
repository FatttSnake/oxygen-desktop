/// <reference types="./electron" />

type Platform = 'WEB' | 'DESKTOP' | 'ANDROID'

interface ImportMetaEnv {
    readonly VITE_PLATFORM: Platform
    readonly VITE_DESKTOP_PROTOCOL: string
    readonly VITE_APP_PROTOCOL: string
    readonly VITE_UI_URL: string
    readonly VITE_API_URL: string
    readonly VITE_API_TOKEN_URL: string
    readonly VITE_TURNSTILE_SITE_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

type WindowType = 'main' | 'message' | 'independent'

type TabType = 'core' | 'settings' | 'sign' | 'tool'

interface Tab {
    key: string
    type: TabType
    padding: number
    icon?: string
    title: string
    pin?: boolean
    persistent?: boolean
}

interface ViewInfo extends Tab {
    view: _WebContentsView
}

interface SharedObject {
    menuWidth: number
    windows: WindowInfo[]
}

interface WindowBounds {
    width: number
    height: number
}

type WindowTheme = 'FOLLOW_SYSTEM' | 'LIGHT' | 'DARK'

interface SideBarMenuItem {
    authorUsername: string
    icon: string
    platform: Platform
    toolId: string
    toolName: string
    version: string
}

interface UserInfoVo {
    id: string
    userId: string
    nickname: string
    avatar: string
    email: string
}

interface ModuleVo {
    id: number
    name: string
}

interface MenuVo {
    id: number
    name: string
    url: string
    parentId: number
    moduleId: number
    children: MenuVo[]
}

interface FuncVo {
    id: number
    name: string
    parentId: number
    menuId: number
    children: FuncVo[]
}

interface OperationVo {
    id: number
    name: string
    code: string
    funcId: number
}

interface UserWithPowerInfoVo {
    id: string
    username: string
    twoFactor: boolean
    verified: boolean
    locking: boolean
    expiration: string
    credentialsExpiration: string
    enable: boolean
    currentLoginTime: string
    currentLoginIp: string
    lastLoginTime: string
    lastLoginIp: string
    createTime: string
    updateTime: string
    userInfo: UserInfoVo
    modules: ModuleVo[]
    menus: MenuVo[]
    funcs: FuncVo[]
    operations: OperationVo[]
}

interface StoreSchema {
    window_bounds: WindowBounds
    window_isMaximize: boolean
    window_theme: WindowTheme
    sidebar_isCollapsed: boolean
    sidebar_menuItems: SideBarMenuItem[]
    account_loginAccount?: string
    account_accessToken?: string
    account_refreshToken?: string
    account_userInfo?: UserWithPowerInfoVo
}

interface ToolInfo {
    username: string
    toolId: string
    platform: Platform
    version?: string
}
