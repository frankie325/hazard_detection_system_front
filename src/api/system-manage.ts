import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/user/list',
    params
  })
}

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}

// 获取菜单列表
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/v3/system/menus/simple'
  })
}

// 获取部门列表
export function departmentList(params?: Api.Common.CommonSearchParams) {
  return request.get<Api.SystemManage.DepartmentList>({
    url: '/sys/dept/list',
    params
  })
}
// // 编辑部门
// export function fetchUpdateDepartment(data: Api.SystemManage.DepartmentForm, config?: AxiosRequestConfig) {
//   return request.put('/api/system/department', data, config)
// }

// // 删除部门
// export function fetchDeleteDepartment(id: string, config?: AxiosRequestConfig) {
//   return request.delete(`/api/system/department/${id}`, config)
// }

// // 批量删除部门
// export function fetchBatchDeleteDepartment(ids: string[], config?: AxiosRequestConfig) {
//   return request.delete('/api/system/department/batch', {
//     data: { ids },
//     ...config
//   })
// }
