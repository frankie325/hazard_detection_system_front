/**
 * 表单相关枚举定义模块
 *
 * ## 主要功能
 *
 * - 页面模式枚举（新增、编辑）
 * - 表格尺寸枚举（默认、紧凑、宽松）
 *
 * @module enums/formEnum
 * @author Art Design Pro Team
 */

// 页面类型
export enum PageModeEnum {
  Add, // 新增
  Edit // 编辑
}

// 表格大小
export enum TableSizeEnum {
  DEFAULT = 'default',
  SMALL = 'small',
  LARGE = 'large'
}

/** 性别 */
export enum GenderEnum {
  MALE = 'M',
  FEMALE = 'F'
}

/** 设备类型 */
export enum DeviceTypeEnum {
  CAMERA = 'CAMERA',
  SENSOR = 'SENSOR'
}

/** 设备状态 */
export enum DeviceStatusEnum {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE'
}

export enum EventStreamTypeEnum {
  CAST = 'CAST',
  FIRE = 'FIRE',
  LANDSLIDE = 'LANDSLIDE',
  TRAFFIC_ACCIDENT = 'TRAFFIC_ACCIDENT'
}
export enum AlarmLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EMERGENCY = 'EMERGENCY'
}

export enum AlarmStatus {
  OPEN = 'OPEN',
  PROCESSING = 'PROCESSING',
  CLOSED = 'CLOSED'
}

export enum EmeEventStatus {
  START = 'START',
  CONFIRMED = 'CONFIRMED',
  DISPATCHING = 'DISPATCHING',
  PROCESSING = 'PROCESSING',
  CLOSED = 'CLOSED'
}

// 时间线操作类型(确认CONFIRM, 资源绑定BIND, 现场签到SIGN, 行动备注REMARK, 上传资料ATTCHMENT, 关闭事件CLOSED)
export enum TimelineType {
  CONFIRM = 'CONFIRM',
  BIND = 'BIND',
  SIGN = 'SIGN',
  REMARK = 'REMARK',
  ATTACHMENT = 'ATTACHMENT',
  CLOSED = 'CLOSED'
}
