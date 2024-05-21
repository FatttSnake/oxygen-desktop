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

interface StoreSchema {
    installedTools: Record<string, Record<Platform, ToolVo>>
}

interface ToolVo {
    id: string
    name: string
    toolId: string
    icon: string
    platform: Platform
    description: string
    base: ToolBaseVo
    author: UserWithInfoVo
    ver: string
    keywords: string[]
    categories: ToolCategoryVo[]
    source: ToolDataVo
    dist: ToolDataVo
    entryPoint: string
    publish: string
    review: 'NONE' | 'PROCESSING' | 'PASS' | 'REJECT'
    createTime: string
    updateTime: string
    favorite: boolean
}

interface ToolBaseVo {
    id: string
    name: string
    source: ToolDataVo
    dist: ToolDataVo
    platform: Platform
    compiled: boolean
    createTime: string
    updateTime: string
}

interface ToolDataVo {
    id: string
    data?: string
    createTime?: string
    updateTime?: string
}

interface UserWithInfoVo {
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
}

interface UserInfoVo {
    id: string
    userId: string
    nickname: string
    avatar: string
    email: string
}

interface ToolCategoryVo {
    id: string
    name: string
    enable: boolean
    createTime: string
    updateTime: string
}
