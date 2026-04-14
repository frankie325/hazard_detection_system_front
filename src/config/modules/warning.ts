/**
 * 告警模块配置
 *
 * 统一管理告警规则相关的配置信息。
 *
 * ## 主要功能
 *
 * - 事件类型选项配置
 * - 告警等级选项配置
 * - 启用状态选项配置
 *
 * @module config/warning
 * @author Art Design Pro Team
 */

import { EventStreamTypeEnum, AlarmLevel } from '@/enums/formEnum'

/**
 * 事件类型 Iconify 图标名称映射
 */
export const eventTypeIconNameMap: Record<EventStreamTypeEnum, string> = {
  [EventStreamTypeEnum.CAST]: 'mdi:package-variant-closed',
  [EventStreamTypeEnum.FIRE]: 'mdi:fire',
  [EventStreamTypeEnum.LANDSLIDE]: 'mdi:landslide',
  [EventStreamTypeEnum.TRAFFIC_ACCIDENT]: 'mdi:car-emergency'
}

/**
 * 事件类型颜色映射
 */
export const eventTypeColorMap: Record<EventStreamTypeEnum, string> = {
  [EventStreamTypeEnum.CAST]: '#E6A23C',
  [EventStreamTypeEnum.FIRE]: '#F56C6C',
  [EventStreamTypeEnum.LANDSLIDE]: '#909399',
  [EventStreamTypeEnum.TRAFFIC_ACCIDENT]: '#409EFF'
}

/**
 * 事件类型选项
 */
export const eventTypeOptions = [
  { label: '抛洒物', value: EventStreamTypeEnum.CAST },
  { label: '火灾', value: EventStreamTypeEnum.FIRE },
  { label: '塌方', value: EventStreamTypeEnum.LANDSLIDE },
  { label: '交通事故', value: EventStreamTypeEnum.TRAFFIC_ACCIDENT }
]

/**
 * 告警等级选项
 */
export const alarmLevelOptions = [
  { label: '低级', value: AlarmLevel.LOW },
  { label: '中级', value: AlarmLevel.MEDIUM },
  { label: '高级', value: AlarmLevel.HIGH },
  { label: '紧急', value: AlarmLevel.EMERGENCY }
]

/**
 * 告警等级圆点样式映射（圆点颜色 + 文字颜色）
 * - 低级：蓝色
 * - 中级：橙色
 * - 高级：红色
 * - 紧急：深紫红色
 */
export const alarmLevelDotMap: Record<AlarmLevel, { label: string; color: string }> = {
  [AlarmLevel.LOW]: { label: '低级', color: '#409EFF' },
  [AlarmLevel.MEDIUM]: { label: '中级', color: '#E6A23C' },
  [AlarmLevel.HIGH]: { label: '高级', color: '#F56C6C' },
  [AlarmLevel.EMERGENCY]: { label: '紧急', color: '#8B0000' }
}

/**
 * 是否启用选项
 */
export const enabledOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]
