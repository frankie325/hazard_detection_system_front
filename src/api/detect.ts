import request from '@/utils/http'

/** 获取事件流列表 */
export function eventStreamList(data?: Api.Detect.EventStreamSearchParams) {
  return request.post<Api.Detect.EventStreamList>({
    url: '/detect/eventStream/list',
    data
  })
}
