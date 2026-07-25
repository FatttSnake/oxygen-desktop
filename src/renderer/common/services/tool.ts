import request from '$/services'
import {
    URL_TOOL,
    URL_TOOL_BASE,
    URL_TOOL_CATEGORY,
    URL_TOOL_DIST,
    URL_TOOL_FAVORITE,
    URL_TOOL_SOURCE,
    URL_TOOL_STORE,
    URL_TOOL_TEMPLATE,
    URL_TOOL_UPGRADE,
    URL_TOOL_UPGRADE_BASE
} from '$/constants/urls.constants'

export const r_tool_template_get = (param: { platform: string }) =>
    request.get<ToolTemplateVo[]>(URL_TOOL_TEMPLATE, param)

export const r_tool_template_get_one = (id: string) =>
    request.get<ToolTemplateWithSourceVo>(`${URL_TOOL_TEMPLATE}/${id}`)

export const r_tool_category_get = () => request.get<ToolCategoryVo[]>(URL_TOOL_CATEGORY)

export const r_tool_base_get_dist = (id: string, version: number) =>
    request.get<ToolBaseWithDistVo>(`${URL_TOOL_BASE}/${id}/${version}`)

export const r_tool_base_get_latest_version = (id: string) =>
    request.get<number>(`${URL_TOOL_BASE}/${id}/version`)

export const r_tool_get_source = (
    username: string,
    toolId: string,
    ver: string,
    platform: Platform
) => request.get<ToolWithSourceVo>(`${URL_TOOL_SOURCE}/${username}/${toolId}/${ver}`, { platform })

export const r_tool_get_dist = (
    username: string,
    toolId: string,
    ver: string,
    platform: Platform
) => request.get<ToolWithDistVo>(`${URL_TOOL_DIST}/${username}/${toolId}/${ver}`, { platform })

export const r_tool_get = (param: PageParam) => request.get<PageVo<ToolVo>>(URL_TOOL, param)

export const r_tool_create = (param: ToolCreateParam) =>
    request.post<ToolWithSourceVo>(URL_TOOL, param)

export const r_tool_update = (param: ToolUpdateParam) => request.put(URL_TOOL, param)

export const r_tool_update_source_add = (id: string, param: ToolCommonUpdateSourceAddParam) =>
    request.patch<string>(`${URL_TOOL_SOURCE}/${id}/add`, param)

export const r_tool_update_source_rename = (id: string, nodeId: string, fileName: string) =>
    request.patch(`${URL_TOOL_SOURCE}/${id}/rename/${nodeId}`, fileName, {
        headers: { 'Content-Type': 'text/plain' }
    })

export const r_tool_update_source_move = (id: string, nodeId: string, newParentId: string) =>
    request.patch(`${URL_TOOL_SOURCE}/${id}/move/${nodeId}`, newParentId, {
        headers: { 'Content-Type': 'application/json' }
    })

export const r_tool_update_source_content = (id: string, nodeId: string, content: string) =>
    request.patch(`${URL_TOOL_SOURCE}/${id}/content/${nodeId}`, content, {
        headers: { 'Content-Type': 'text/plain' }
    })

export const r_tool_update_source_remove = (id: string, nodeId: string) =>
    request.patch(`${URL_TOOL_SOURCE}/${id}/remove/${nodeId}`)

export const r_tool_upgrade = (param: ToolUpgradeParam) => request.patch(URL_TOOL_UPGRADE, param)

export const r_tool_upgrade_base = (param: ToolOrTemplateUpgradeBaseParam) =>
    request.patch(URL_TOOL_UPGRADE_BASE, param)

export const r_tool_submit = (id: string) => request.post(`${URL_TOOL}/${id}`)

export const r_tool_cancel = (id: string) => request.put(`${URL_TOOL}/${id}`)

export const r_tool_delete = (id: string) => request.delete(`${URL_TOOL}/${id}`)

export const r_tool_store_get = (param: ToolStoreGetParam) =>
    request.get<PageVo<ToolVo>>(URL_TOOL_STORE, param)

export const r_tool_store_get_by_username = (username: string, param: ToolStoreGetParam) =>
    request.get<PageVo<ToolVo>>(`${URL_TOOL_STORE}/${username}`, param)

export const r_tool_add_favorite = (param: ToolFavoriteAddRemoveParam) =>
    request.post(URL_TOOL_FAVORITE, param)

export const r_tool_remove_favorite = (param: ToolFavoriteAddRemoveParam) =>
    request.delete(URL_TOOL_FAVORITE, param)

export const r_tool_get_favorite = (param: PageParam) =>
    request.get<PageVo<ToolVo>>(URL_TOOL_FAVORITE, param)
