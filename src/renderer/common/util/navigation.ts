import { NavigateFunction, NavigateOptions } from 'react-router'
import { getRedirectUrl } from '$/util/route'

export const navigateToRoot = (navigate: NavigateFunction, options?: NavigateOptions) => {
    navigate('/', options)
}

export const navigateToStore = (
    navigate: NavigateFunction,
    username?: string,
    options?: NavigateOptions
) => {
    navigate(`/store${username ? `/${username}` : ''}`, options)
}

export const navigateToRepository = (navigate: NavigateFunction, options?: NavigateOptions) => {
    navigate('/repository', options)
}

export const navigateToInstall = (navigate: NavigateFunction, options?: NavigateOptions) => {
    navigate('/install', options)
}

export const navigateToLogin = (
    navigate: NavigateFunction,
    locationSearch?: string,
    redirectUrl?: string,
    options?: NavigateOptions
) => {
    navigate(
        redirectUrl ? getRedirectUrl('/login', redirectUrl) : `/login${locationSearch}`,
        options
    )
}

export const navigateToView = (
    username: string,
    toolId: string,
    platform: Platform,
    version?: string,
    local?: boolean
) => {
    oxygenApi.tool.view.load(username, toolId, platform, version, local ? 'local' : undefined)
}

export const navigateToSource = (
    navigate: NavigateFunction,
    username: string,
    toolId: string,
    platform: Platform,
    version?: string,
    from?: string,
    options?: NavigateOptions
) => {
    const searchParams = new URLSearchParams()
    if (platform !== import.meta.env.VITE_PLATFORM) {
        searchParams.append('platform', platform)
    }
    from && searchParams.append('from', from)

    navigate(
        `/source/${username}/${toolId}${version ? `/${version}` : ''}${searchParams.size ? `?${searchParams.toString()}` : ''}`,
        options
    )
}

export const navigateToForget = (
    navigate: NavigateFunction,
    locationSearch: string,
    options?: NavigateOptions
) => {
    navigate(`/forget/${locationSearch}`, options)
}

export const navigateToRegister = (
    navigate: NavigateFunction,
    locationSearch: string,
    options?: NavigateOptions
) => {
    navigate(`/register/${locationSearch}`, options)
}

export const navigateToCode = (
    navigate: NavigateFunction,
    toolId: string,
    options?: NavigateOptions
) => {
    navigate(`/system/tools/code/${toolId}`, options)
}

export const navigateToEdit = (
    navigate: NavigateFunction,
    toolId: string,
    platform: Platform,
    options?: NavigateOptions
) => {
    const searchParams = new URLSearchParams()
    if (platform !== import.meta.env.VITE_PLATFORM) {
        searchParams.append('platform', platform)
    }

    navigate(`/edit/${toolId}${searchParams.size ? `?${searchParams.toString()}` : ''}`, options)
}

export const navigateToTools = (navigate: NavigateFunction, options?: NavigateOptions) => {
    navigate('/system/tools', options)
}

export const navigateToToolTemplate = (navigate: NavigateFunction, options?: NavigateOptions) => {
    navigate(`/system/tools/template`, options)
}

export const navigateToToolTemplateEditor = (
    navigate: NavigateFunction,
    toolTemplateId: string,
    options?: NavigateOptions
) => {
    navigate(`/system/tools/template/${toolTemplateId}`, options)
}

export const navigateToToolBase = (navigate: NavigateFunction, options?: NavigateOptions) => {
    navigate(`/system/tools/base`, options)
}

export const navigateToToolBaseEditor = (
    navigate: NavigateFunction,
    toolBaseId: string,
    version?: string,
    options?: NavigateOptions
) => {
    navigate(`/system/tools/base/${toolBaseId}${version ? `/${version}` : ''}`, options)
}

export const getAndroidUrl = (username: string, toolId: string) =>
    `${import.meta.env.VITE_APP_PROTOCOL}://opentool/${username}/${toolId}`
