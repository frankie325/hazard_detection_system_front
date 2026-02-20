/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      list: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'

    /** 性别 */
    enum GenderEnum {
      MALE = 'M',
      FEMALE = 'F'
    }
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      username: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken: string
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      userId: number
      userName: string
      email: string
      avatar?: string

      // 用户信息
      id: number
      idCard: string
      name: string // 真实姓名
      username: string // 用户名
      phone: string
      gender: string
      remark: string
      roleId: number
      roleName: string
      deptId: number
      deptName: string
      createTime: string
      updateTime: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    type GenderEnum = import('@/enums/formEnum').GenderEnum

    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      name: string
      username: string
      idCard: string
      phone: string
      gender: GenderEnum
      remark: string
      roleId: number
      roleName: string
      deptName: string
      createTime: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'username' | 'roleName' | 'deptName'> & Api.Common.CommonSearchParams
    >

    /** 用户表单 */
    interface UserForm {
      id?: number
      name: string
      gender: GenderEnum
      username: string
      password?: string
      phone: string
      idCard: string
      roleId: number | undefined
      remark: string
    }

    /** 部门搜索参数 */
    interface DepartmentSearch {
      deptName?: string
      deptCode?: string
    }
    /** 部门列表项 */
    interface DepartmentListItem {
      id: number
      parentId: number
      deptName: string
      deptCode: string
      description?: string
      status: string
      createTime: string
      updateTime: string
      children: DepartmentListItem[]
    }

    /** 部门表单 */
    interface DepartmentForm {
      id?: number
      parentId: number | undefined
      deptName: string
      parentId: number
      deptCode: string
      description: string
    }
    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleName' | 'deptName'> & Api.Common.CommonSearchParams
    >

    /** 角色列表项 */
    interface RoleListItem {
      id: number
      roleName: string
      deptId: number
      deptName: string
      remark: string
      permissions: string
      createTime: string
      updateTime: string
    }

    /** 角色表单 */
    interface RoleForm {
      id?: number
      roleName: string
      deptId: number | undefined
      remark: string
      // permissions: string
    }

    /** 区域列表 */
    type AreaList = Api.Common.PaginatedResponse<AreaListItem>

    /** 区域列表项 */
    interface AreaListItem {
      id: number
      areaName: string
      deptName: string
      deptId: number
      length?: number
      laneCount?: number
      deviceCount: number
      createTime: string
      updateTime: string
    }

    /** 区域表单 */
    interface AreaForm {
      id?: number
      areaName: string
      deptId: number | undefined
      deptName: string
      length?: number
      laneCount?: number
    }

    /** 区域搜索参数 */
    type AreaSearchParams = Partial<
      Pick<AreaListItem, 'areaName' | 'deptName'> & Api.Common.CommonSearchParams
    >

    /** 设备列表 */
    type DeviceList = Api.Common.PaginatedResponse<DeviceListItem>

    /** 设备类型 */
    type DeviceType = import('@/enums/formEnum').DeviceTypeEnum

    /** 设备状态 */
    type DeviceStatus = import('@/enums/formEnum').DeviceStatusEnum

    /** 设备列表项 */
    interface DeviceListItem {
      id: number
      deviceName: string
      deviceCode: string
      deviceType: DeviceType
      deviceTypeName?: string
      model?: string
      location?: string
      ipAddress?: string
      status: DeviceStatus
      statusName?: string
      areaId: number
      areaName: string
      createTime: string
      updateTime: string
    }

    /** 设备表单 */
    interface DeviceForm {
      id?: number
      deviceName: string
      deviceCode: string
      deviceType: DeviceType
      model?: string
      location?: string
      ipAddress?: string
      areaId: number
      areaName: string
    }

    /** 设备搜索参数 */
    type DeviceSearchParams = Partial<
      Pick<DeviceListItem, 'deviceName' | 'deviceCode' | 'deviceType' | 'status' | 'areaId'> &
        Api.Common.CommonSearchParams
    >

    /** 区域设备列表项（用于设备监控树） */
    interface AreaDeviceListItem extends AreaListItem {
      deviceList: DeviceListItem[]
    }

    /** 设备监控树节点 */
    interface DeviceMonitorNode {
      id: string
      label: string
      type: 'folder' | 'device'
      deviceType?: DeviceType
      children?: DeviceMonitorNode[]
      [key: string]: any
    }
  }

  /** 危害检测模块类型 */

  namespace Detect {
    type EventStreamList = Api.Common.PaginatedResponse<Api.Detect.EventStreamListItem>

    /** 事件流搜索参数 */
    type EventStreamSearchParams = Partial<
      Pick<
        EventStreamListItem,
        | 'startTime'
        | 'endTime'
        | 'eventName'
        | 'areaName'
        | 'deviceId'
        | 'deviceName'
        | 'eventType'
        | 'eventTypeName'
      > &
        Api.Common.CommonSearchParams
    >

    /** 事件流列表项 */
    interface EventStreamListItem {
      id: number
      eventName: string
      eventType: string
      confidence: number
      createTime: string
      areaId: number
      deviceId: number
      deviceName: string
      location: string
      areaName: string
      eventTypeName: string
    }
  }
}
