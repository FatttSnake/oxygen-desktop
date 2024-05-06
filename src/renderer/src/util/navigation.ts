import { NavigateFunction, NavigateOptions } from 'react-router'
import { getRedirectUrl } from '@/util/route'

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
    navigate: NavigateFunction,
    username: string,
    toolId: string,
    platform: Platform,
    version?: string,
    options?: NavigateOptions
) => {
    navigate(
        `/view/${username}/${toolId}${version ? `/${version}` : ''}${platform !== import.meta.env.VITE_PLATFORM ? `?platform=${platform}` : ''}`,
        options
    )
}

export const navigateToSource = (
    navigate: NavigateFunction,
    username: string,
    toolId: string,
    platform: Platform,
    version?: string,
    options?: NavigateOptions
) => {
    navigate(
        `/source/${username}/${toolId}${version ? `/${version}` : ''}${platform !== import.meta.env.VITE_PLATFORM ? `?platform=${platform}` : ''}`,
        options
    )
}

export const navigateToRedirect = (
    navigate: NavigateFunction,
    searchParams: URLSearchParams,
    defaultUrl: '/repository' | '/',
    options?: NavigateOptions
) => {
    navigate(searchParams.get('redirect') ?? defaultUrl, options)
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

export const navigateToExecute = (
    navigate: NavigateFunction,
    toolId: string,
    options?: NavigateOptions
) => {
    navigate(`/system/tools/execute/${toolId}`, options)
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
    navigate(
        `/edit/${toolId}${platform !== import.meta.env.VITE_PLATFORM ? `?platform=${platform}` : ''}`,
        options
    )
}

export const navigateToUser = (navigate: NavigateFunction, options?: NavigateOptions) => {
    navigate('/user', options)
}

export const navigateToTools = (navigate: NavigateFunction, options?: NavigateOptions) => {
    navigate('/system/tools', options)
}

export const getViewPath = (
    username: string,
    toolId: string,
    platform: Platform,
    version?: string
) =>
    `/view/${username}/${toolId}${version ? `/${version}` : ''}${platform !== import.meta.env.VITE_PLATFORM ? `?platform=${platform}` : ''}`
