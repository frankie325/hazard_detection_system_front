import request from '@/utils/http'

// 获取所有应急事件列表（不分页）
export function eventList() {
  return request.get<Api.Emergency.EventListItem[]>({
    url: '/emergency/eventCenter/allList'
  })
}

// 获取事件详情
export function eventDetail(id: number) {
  return request.get<Api.Emergency.EventListItem>({
    url: `/emergency/eventCenter/detail/${id}`
  })
}

// 获取事件时间线
export function eventTimeline(eventId: number) {
  return request.get<Api.Emergency.TimelineItem[]>({
    url: `/emergency/eventCenter/timeline/${eventId}`
  })
}

// 更新事件状态（统一接口）
export function updateStatus(data: Api.Emergency.UpdateStatusParams) {
  return request.post({
    url: '/emergency/eventCenter/updateStatus',
    data
  })
}

// 获取资源池列表
export function resourcePoolList() {
  return request.get<Api.Emergency.ResourceItem[]>({
    url: '/emergency/resource/allList'
  })
}
