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
 * 是否启用选项
 */
export const enabledOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]
