import request from '@/utils/http'

// 数据面板概览
export function getDashboardOverview() {
  return request.get<{
    /**
     * 今日告警数量
     */
    todayAlarmCount: number
    /**
     * 设备总数
     */
    deviceCount: number

    /**
     * 待处理告警数量（OPEN状态）
     */
    pendingAlarmCount: number

    /**
     * 活跃应急事件数量（DISPATCHING, PROCESSING）
     */
    activeEventCount: number
  }>({
    url: '/dashboard/overview'
  })
}

// 获取告警等级统计数据
export function getAlarmLevelStats() {
  return request.get<
    {
      name: string
      value: number
    }[]
  >({
    url: '/dashboard/alarm/level'
  })
}

// 获取告警危害类型统计
export function getEventTypeLevelStats() {
  return request.get<{
    series: { name: string; data: number[] }[]
    xaxis: string[]
  }>({
    url: '/dashboard/alarm/eventTypeLevel'
  })
}

// 获取事件状态统计直方图
export function getEventStatusStats() {
  return request.get<{
    xaxis: string[]
    data: number[]
  }>({
    url: '/dashboard/event/status'
  })
}
