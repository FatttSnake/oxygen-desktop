import request from '@/services/index'
import {
    URL_TOOL,
    URL_TOOL_CATEGORY,
    URL_TOOL_DETAIL,
    URL_TOOL_STORE,
    URL_TOOL_TEMPLATE
} from '@/constants/urls.constants'

export const r_tool_template_get = () => request.get<ToolTemplateVo[]>(URL_TOOL_TEMPLATE)

export const r_tool_template_get_one = (id: string) =>
    request.get<ToolTemplateVo>(`${URL_TOOL_TEMPLATE}/${id}`)

export const r_tool_category_get = () => request.get<ToolCategoryVo[]>(URL_TOOL_CATEGORY)

export const r_tool_create = (param: ToolCreateParam) => request.post<ToolVo>(URL_TOOL, param)

export const r_tool_upgrade = (param: ToolUpgradeParam) => request.patch<ToolVo>(URL_TOOL, param)

export const r_tool_get = () => request.get<ToolVo[]>(URL_TOOL)

export const r_tool_detail = (username: string, toolId: string, ver: string) =>
    request.get<ToolVo>(`${URL_TOOL_DETAIL}/${username}/${toolId}/${ver}`)

export const r_tool_update = (param: ToolUpdateParam) => request.put<ToolVo>(URL_TOOL, param)

export const r_tool_submit = (id: string) => request.post(`${URL_TOOL}/${id}`)

export const r_tool_cancel = (id: string) => request.put(`${URL_TOOL}/${id}`)

export const r_tool_delete = (id: string) => request.delete(`${URL_TOOL}/${id}`)

export const r_tool_store_get = (param: ToolStoreGetParam) =>
    request.get<PageVo<ToolVo>>(URL_TOOL_STORE, param)

export const r_tool_store_get_by_username = (username: string, param: ToolStoreGetParam) =>
    request.get<PageVo<ToolVo>>(`${URL_TOOL_STORE}/${username}`, param)
