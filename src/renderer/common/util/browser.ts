export const getQueryVariable = (variable: string) => {
    const query = window.location.search.substring(1)
    const vars = query.split('&')
    for (const value of vars) {
        const pair = value.split('=')
        if (pair[0] === variable) {
            return decodeURIComponent(pair[1].replace(/\+/g, ' '))
        }
    }
    return null
}

export const setCookie = (
    name: string,
    value: string,
    daysToLive: number | null,
    path: string | null
) => {
    let cookie = `${name}=${encodeURIComponent(value)}`

    if (typeof daysToLive === 'number') {
        cookie = `${cookie}; max-age=${daysToLive * 24 * 60 * 60}`
    }

    if (typeof path === 'string') {
        cookie = `${cookie}; path=${path}`
    }

    document.cookie = cookie
}

export const getCookie = (name: string) => {
    const cookieArr = document.cookie.split(';')

    for (const cookie of cookieArr) {
        const cookiePair = cookie.split('=')
        if (cookiePair[0].trim() === name) {
            return decodeURIComponent(cookiePair[1])
        }
    }

    return null
}

export const removeCookie = (name: string) => {
    document.cookie = `${name}=; max-age=0`
}

export const setLocalStorage = (name: string, value: string) => {
    localStorage.setItem(name, value)
}

export const getLocalStorage = (name: string) => {
    return localStorage.getItem(name)
}

export const removeLocalStorage = (name: string) => {
    localStorage.removeItem(name)
}

export const clearLocalStorage = () => {
    localStorage.clear()
}
