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
export function departmentTreeList(data?: Api.SystemManage.DepartmentSearch) {
  return request.post<Api.SystemManage.DepartmentListItem[]>({
    url: '/sys/dept/tree',
    data
  })
}

// 新增部门
export function departmentAdd(data?: Api.SystemManage.DepartmentForm) {
  return request.post({
    url: '/sys/dept/add',
    data
  })
}

// 根据id获取部门详情
export function departmentGetById(id: number) {
  return request.get<Api.SystemManage.DepartmentListItem>({
    url: `/sys/dept/${id}`
  })
}

// 更新部门
export function departmentUpdate(data?: Api.SystemManage.DepartmentForm) {
  return request.put({
    url: '/sys/dept/update',
    data
  })
}

// 删除单个部门
export function departmentDeleteById(id: number) {
  return request.del({
    url: `/sys/dept/delete/${id}`
  })
}

// 批量删除部门
export function departmentBatchDelete(ids?: number[]) {
  return request.del({
    url: '/sys/dept/batchDelete',
    data: ids
  })
}

// 获取角色列表
export function roleList(data?: Api.SystemManage.RoleSearchParams) {
  return request.post<Api.SystemManage.RoleList>({
    url: '/sys/role/list',
    data
  })
}

// 新增角色
export function roleAdd(data: Api.SystemManage.RoleForm) {
  return request.post({
    url: '/sys/role/add',
    data
  })
}

// 新增角色
export function roleUpdate(data: Api.SystemManage.RoleForm) {
  return request.put({
    url: '/sys/role/update',
    data
  })
}

// 删除角色
export function roleDeleteById(id: number) {
  return request.del({
    url: `/sys/role/delete/${id}`
  })
}

// 批量删除部门
export function roleBatchDelete(ids?: number[]) {
  return request.del({
    url: '/sys/role/batchDelete',
    data: ids
  })
}
