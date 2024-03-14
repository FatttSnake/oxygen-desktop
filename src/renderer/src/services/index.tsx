import axios, { type AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import {
    PERMISSION_ACCESS_DENIED,
    PERMISSION_TOKEN_HAS_EXPIRED,
    PERMISSION_TOKEN_ILLEGAL,
    PERMISSION_TOKEN_RENEW_SUCCESS,
    PERMISSION_UNAUTHORIZED,
    SYSTEM_REQUEST_TOO_FREQUENT
} from '@/constants/common.constants'
import { getRedirectUrl } from '@/util/route'
import { getToken, setToken, removeToken } from '@/util/auth'

const service: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000,
    withCredentials: false
})

service.defaults.paramsSerializer = (params: Record<string, string>) => {
    return Object.keys(params)
        .filter((it) => {
            return Object.prototype.hasOwnProperty.call(params, it)
        })
        .reduce((pre, curr) => {
            return params[curr] !== null && params[curr] !== undefined
                ? (pre !== '' ? pre + '&' : '') + curr + '=' + encodeURIComponent(params[curr])
                : pre
        }, '')
}

service.interceptors.request.use(
    async (config) => {
        let token = getToken()
        if (token !== null) {
            const jwt = jwtDecode<JwtPayload>(token)
            if (!jwt.exp) {
                return config
            }
            if (
                jwt.exp * 1000 - new Date().getTime() < 1200000 &&
                jwt.exp * 1000 - new Date().getTime() > 0
            ) {
                await axios
                    .get(import.meta.env.VITE_API_TOKEN_URL, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    .then((value: AxiosResponse<_Response<TokenVo>>) => {
                        const response = value.data
                        if (response.code === PERMISSION_TOKEN_RENEW_SUCCESS) {
                            setToken(response.data?.token ?? '')
                        }
                    })
            }

            token = getToken()
            config.headers.set('Authorization', `Bearer ${token}`)
        }
        return config
    },
    async (error) => {
        return await Promise.reject(error)
    }
)

service.interceptors.response.use(
    (response: AxiosResponse<_Response<never>>) => {
        switch (response.data.code) {
            case PERMISSION_UNAUTHORIZED:
                removeToken()
                void message.error({
                    content: (
                        <>
                            <strong>未登录</strong>
                        </>
                    ),
                    key: 'NO_LOGIN'
                })
                setTimeout(() => {
                    location.reload()
                }, 1500)
                throw response?.data
            case PERMISSION_TOKEN_ILLEGAL:
            case PERMISSION_TOKEN_HAS_EXPIRED:
                removeToken()
                void message.error({
                    content: (
                        <>
                            <strong>登录已过期</strong>
                        </>
                    ),
                    key: 'LOGIN_HAS_EXPIRED'
                })
                setTimeout(() => {
                    location.replace(
                        getRedirectUrl('/login', `${location.pathname}${location.search}`)
                    )
                }, 1500)
                throw response?.data
            case PERMISSION_ACCESS_DENIED:
                void message.error({
                    content: (
                        <>
                            <strong>暂无权限操作</strong>
                        </>
                    ),
                    key: 'ACCESS_DENIED'
                })
                throw response?.data
            case SYSTEM_REQUEST_TOO_FREQUENT:
                void message.warning({
                    content: (
                        <>
                            <strong>请求过于频繁，请稍后重试</strong>
                        </>
                    ),
                    key: 'REQUEST_TOO_FREQUENT'
                })
                throw response?.data
        }
        return response
    },
    async (error: AxiosError) => {
        if (
            error.code === 'ETIMEDOUT' ||
            (error.code === 'ECONNABORTED' && error.message.includes('timeout'))
        ) {
            void message.error({ content: '请求超时，请稍后重试', key: 'TIMEOUT' })
        } else {
            void message.error({
                content: (
                    <>
                        <strong>服务器出错</strong>，请稍后重试
                    </>
                ),
                key: 'SERVER_ERROR'
            })
        }
        return await Promise.reject(error?.response?.data)
    }
)

const request = {
    async get<T>(url: string, data?: object): Promise<AxiosResponse<_Response<T>>> {
        return await request.request('GET', url, { params: data })
    },
    async post<T>(url: string, data?: object): Promise<AxiosResponse<_Response<T>>> {
        return await request.request('POST', url, { data })
    },
    async put<T>(url: string, data?: object): Promise<AxiosResponse<_Response<T>>> {
        return await request.request('PUT', url, { data })
    },
    async patch<T>(url: string, data?: object): Promise<AxiosResponse<_Response<T>>> {
        return await request.request('PATCH', url, { data })
    },
    async delete<T>(url: string, data?: object): Promise<AxiosResponse<_Response<T>>> {
        return await request.request('DELETE', url, { data })
    },
    async request<T>(
        method = 'GET',
        url: string,
        data?: AxiosRequestConfig
    ): Promise<AxiosResponse<_Response<T>>> {
        return await new Promise((resolve, reject) => {
            service({ method, url, ...data })
                .then((res) => {
                    resolve(res as unknown as Promise<AxiosResponse<_Response<T>>>)
                })
                .catch((e: Error | AxiosError) => {
                    reject(e)
                })
        })
    }
}

export default request
