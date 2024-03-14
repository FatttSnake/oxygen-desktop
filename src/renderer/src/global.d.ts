/// <reference types="vite/client" />
/// <reference types="./ant-design" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_API_TOKEN_URL: string
    readonly VITE_TURNSTILE_SITE_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

interface RouteJsonObject {
    path: string
    absolutePath: string
    id?: string
    element?: React.JSX.Element
    component?: React.ComponentType
    name?: string
    titlePrefix?: string
    title?: string
    titlePostfix?: string
    icon?: IconComponent
    menu?: boolean
    auth?: boolean
    permission?: boolean
    operationCode?: string
    autoHide?: boolean
    children?: RouteJsonObject[]
}

interface RouteHandle {
    absolutePath: string
    name?: string
    titlePrefix?: string
    title?: string
    titlePostfix?: string
    icon?: IconComponent
    menu?: boolean
    auth?: boolean
    permission?: boolean
    autoHide?: boolean
}

interface _Response<T> {
    code: number
    success: boolean
    msg: string
    data: T | null
}

interface Captcha {
    value: string
    base64Src: string
}

interface TokenVo {
    token: string
}

interface UserInfoUpdateParam {
    avatar?: string
    nickname?: string
}

interface RegisterParam {
    username: string
    email: string
    password: string
    captchaCode: string
}

interface VerifyParam {
    code: string
    nickname?: string
    avatar?: string
}

interface ForgetParam {
    email: string
    captchaCode: string
}

interface RetrieveParam {
    code: string
    password: string
    captchaCode: string
}

interface LoginParam {
    account: string
    password: string
    captchaCode: string
    twoFactorCode?: string
}

interface UserChangePasswordParam {
    originalPassword: string
    newPassword: string
}

interface TwoFactorValidateParam {
    code: string
}

interface TwoFactorRemoveParam {
    code: string
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

interface UserWithRoleInfoVo {
    id: string
    username: string
    twoFactor: boolean
    verify: string
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
    roles: RoleVo[]
    groups: GroupVo[]
}

interface UserInfoVo {
    id: string
    userId: string
    nickname: string
    avatar: string
    email: string
}

interface TwoFactorVo {
    qrCodeSVGBase64: string
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

interface RoleVo {
    id: string
    name: string
    enable: boolean
    createTime: string
    updateTime: string
}

interface GroupVo {
    id: string
    name: string
    enable: boolean
    createTime: string
    updateTime: string
}

interface PageVo<T> {
    current: number
    pages: number
    size: number
    total: number
    records: T[]
}

interface PageParam {
    currentPage?: number
    pageSize?: number
    sortField?: string
    sortOrder?: string
}

interface TableParam {
    pagination?: _TablePaginationConfig
    sortField?: React.Key | readonly React.Key[]
    sortOrder?: _SortOrder
    filters?: Record<string, _FilterValue | null>
}

interface UserGetParam extends PageParam {
    searchType?: string
    searchValue?: string
    searchRegex?: boolean
}

interface UserAddEditParam {
    id?: string
    username: string
    password?: string
    verified: boolean
    locking?: boolean
    expiration?: string
    credentialsExpiration?: string
    enable?: boolean
    nickname?: string
    avatar?: string
    email?: string
    roleIds: number[]
    groupIds: number[]
}

interface UserUpdatePasswordParam {
    id: string
    password: string
    credentialsExpiration?: string
}

interface SysLogGetParam extends PageParam {
    searchRequestUrl?: string
    searchStartTime?: string
    searchEndTime?: string
}

interface SysLogGetVo {
    id: string
    logType: string
    operateUserId: string
    operateTime: string
    requestUri: string
    requestMethod: string
    requestParams: string
    requestIp: string
    requestServerAddress: string
    exception: boolean
    exceptionInfo: string
    startTime: string
    endTime: string
    executeTime: number
    userAgent: string
    operateUsername: string
}

interface RoleGetParam extends PageParam {
    searchName?: string
    searchRegex?: boolean
}

interface RoleWithPowerGetVo {
    id: string
    name: string
    enable: string
    createTime: string
    updateTime: string
    modules: ModuleVo[]
    menus: MenuVo[]
    funcs: FuncVo[]
    operations: OperationVo[]
    tree: _DataNode[]
}

interface RoleChangeStatusParam {
    id: string
    enable: boolean
}

interface RoleAddEditParam {
    id?: string
    name: string
    powerIds: number[]
    enable: boolean
}

interface PowerSetVo {
    moduleList: ModuleVo[]
    menuList: MenuVo[]
    funcList: FuncVo[]
    operationList: OperationVo[]
}

interface GroupGetParam extends PageParam {
    searchName?: string
    searchRegex?: boolean
}

interface GroupWithRoleGetVo {
    id: string
    name: string
    enable: boolean
    createTime: string
    updateTime: string
    roles: RoleVo[]
}

interface GroupAddEditParam {
    id?: string
    name: string
    roleIds: number[]
    enable: boolean
}

interface GroupChangeStatusParam {
    id: string
    enable: boolean
}

interface AvatarBase64Vo {
    base64: string
}

interface BaseSettingsVo {
    appName?: string
    appUrl?: string
}

interface BaseSettingsParam {
    appName: string
    appUrl: string
}

interface MailSettingsVo {
    host?: string
    port?: number
    securityType?: string
    username?: string
    password?: string
    from?: string
    fromName?: string
}

interface MailSettingsParam {
    host?: string
    port?: number
    securityType?: string
    username?: string
    password?: string
    from?: string
    fromName?: string
}

interface MailSendParam {
    to: string
}

interface SensitiveWordVo {
    id: string
    word: string
    useFor: string[]
    enable: boolean
}

interface SensitiveWordAddParam {
    word: string
    useFor?: string[]
    enable?: boolean
}

interface SensitiveWordUpdateParam {
    ids: string[]
}

interface TwoFactorSettingsVo {
    issuer: string
    secretKeyLength: number
}

interface TwoFactorSettingsParam {
    issuer: string
    secretKeyLength: number
}

interface SoftwareInfoVo {
    os: string
    bitness: number
    javaVersion: string
    javaVersionDate: string
    javaVendor: string
    javaRuntime: string
    javaRuntimeVersion: string
    jvm: string
    jvmVersion: string
    jvmInfo: string
    jvmVendor: string
    javaClassVersion: string
    osBootTime: string
    serverStartupTime: string
}

interface HardwareInfoVo {
    cpu: string
    arch: string
    is64Bit: boolean
    cpuPhysicalPackageCount: number
    cpuPhysicalProcessorCount: number
    cpuLogicalProcessorCount: number
    microarchitecture: string
    memories: string
    disks: string
}

interface CpuInfoVo {
    user: number
    nice: number
    system: number
    idle: number
    iowait: number
    irq: number
    softirq: number
    steal: number
    total: number
    processors: CpuInfoVo[]
}

interface StorageInfoVo {
    memoryTotal: number
    memoryFree: number
    virtualMemoryInUse: number
    virtualMemoryMax: number
    swapTotal: number
    swapUsed: number
    jvmTotal: number
    jvmFree: number
    fileStores: FileStoreInfoVo[]
}

interface FileStoreInfoVo {
    mount: string
    total: number
    free: number
}

interface OnlineInfoVo {
    current: number
    history: {
        time: string
        record: string
    }[]
}

interface OnlineInfoGetParam {
    scope: string
}

interface ActiveInfoVo {
    registerHistory: {
        time: string
        count: number
    }[]
    loginHistory: {
        time: string
        count: number
    }[]
    verifyHistory: {
        time: string
        count: number
    }[]
}

interface ActiveInfoGetParam {
    scope: string
}

interface ToolCategoryVo {
    id: string
    name: string
    enable: boolean
    createTime: string
    updateTime: string
}

interface ToolCategoryAddEditParam {
    id?: string
    name: string
    enable: string
}

interface ToolDataVo {
    id: string
    data?: string
    createTime?: string
    updateTime?: string
}

interface ToolBaseVo {
    id: string
    name: string
    source: ToolDataVo
    dist: ToolDataVo
    compiled: boolean
    createTime: string
    updateTime: string
}

interface ToolBaseAddEditParam {
    id?: string
    name?: string
    source?: string
    dist?: string
}

interface ToolTemplateVo {
    id: string
    name: string
    baseId: string
    source: ToolDataVo
    entryPoint: string
    enable: boolean
    createTime: string
    updateTime: string
    base: ToolBaseVo
}

interface ToolTemplateAddEditParam {
    id?: string
    name?: string
    baseId?: string
    source?: string
    entryPoint?: string
    enable?: boolean
}

interface ToolVo {
    id: string
    name: string
    toolId: string
    icon: string
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
}

interface ToolCreateParam {
    name: string
    toolId: string
    icon: string
    description: string
    ver: string
    templateId: string
    keywords: string[]
    categories: string[]
}

interface ToolUpgradeParam {
    toolId: string
    ver: string
}

interface ToolUpdateParam {
    id: string
    name?: string
    icon?: string
    description?: string
    keywords?: string[]
    categories?: string[]
    source?: string
}

interface ToolManagementGetParam extends PageParam {
    searchType?: string
    searchValue?: string
    searchRegex?: boolean
}

interface ToolManagementPassParam {
    dist: string
}

interface ToolStoreGetParam extends PageParam {
    searchValue?: string
}
