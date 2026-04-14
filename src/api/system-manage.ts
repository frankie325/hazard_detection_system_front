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

// 获取所有角色列表
export function allRoleList() {
  return request.get<Api.SystemManage.RoleListItem[]>({
    url: '/sys/role/allList'
  })
}

// 获取角色列表
export function roleList(data: Api.SystemManage.RoleSearchParams) {
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

// 获取用户列表
export function userList(data?: Api.SystemManage.UserSearchParams) {
  return request.post<Api.SystemManage.UserList>({
    url: '/sys/user/list',
    data
  })
}

// 新增用户
export function userAdd(data: Api.SystemManage.UserForm) {
  return request.post({
    url: '/sys/user/add',
    data
  })
}

// 更新用户
export function userUpdate(data: Api.SystemManage.UserForm) {
  return request.put({
    url: '/sys/user/update',
    data
  })
}

// 删除用户
export function userDeleteById(id: number) {
  return request.del({
    url: `/sys/user/delete/${id}`
  })
}

// 批量删除用户
export function userBatchDelete(ids?: number[]) {
  return request.del({
    url: '/sys/user/batchDelete',
    data: ids
  })
}

// 获取所有区域列表（不分页）
export function allAreaList() {
  return request.get<Api.SystemManage.AreaListItem[]>({
    url: '/sys/area/allList'
  })
}

// 查询区域以及区域下的设备列表
export function areaDeviceList() {
  return request.get<Api.SystemManage.AreaDeviceListItem[]>({
    url: '/sys/area/deviceList'
  })
}

// 获取区域列表
export function areaList(data?: Api.SystemManage.AreaSearchParams) {
  return request.post<Api.SystemManage.AreaList>({
    url: '/sys/area/list',
    data
  })
}

// 新增区域
export function areaAdd(data: Api.SystemManage.AreaForm) {
  return request.post({
    url: '/sys/area/add',
    data
  })
}

// 更新区域
export function areaUpdate(data: Api.SystemManage.AreaForm) {
  return request.put({
    url: '/sys/area/update',
    data
  })
}

// 删除区域
export function areaDeleteById(id: number) {
  return request.del({
    url: `/sys/area/delete/${id}`
  })
}

// 批量删除区域
export function areaBatchDelete(ids?: number[]) {
  return request.del({
    url: '/sys/area/batchDelete',
    data: ids
  })
}

// 获取设备列表
export function deviceList(data?: Api.SystemManage.DeviceSearchParams) {
  return request.post<Api.SystemManage.DeviceList>({
    url: '/sys/device/list',
    data
  })
}

// 新增设备
export function deviceAdd(data: Api.SystemManage.DeviceForm) {
  return request.post({
    url: '/sys/device/add',
    data
  })
}

// 更新设备
export function deviceUpdate(data: Api.SystemManage.DeviceForm) {
  return request.put({
    url: '/sys/device/update',
    data
  })
}

// 删除设备
export function deviceDeleteById(id: number) {
  return request.del({
    url: `/sys/device/delete/${id}`
  })
}

// 批量删除设备
export function deviceBatchDelete(ids?: number[]) {
  return request.del({
    url: '/sys/device/batchDelete',
    data: ids
  })
}
