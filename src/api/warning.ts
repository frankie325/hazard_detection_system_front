import request from '@/utils/http'

// 获取告警规则列表
export function alarmRuleList(data?: Api.Warning.AlarmRuleSearchParams) {
  return request.post<Api.Warning.AlarmRuleList>({
    url: '/alarm/rule/list',
    data
  })
}

// 新增告警规则
export function alarmRuleAdd(data: Api.Warning.AlarmRuleForm) {
  return request.post({
    url: '/alarm/rule/add',
    data
  })
}

// 更新告警规则
export function alarmRuleUpdate(data: Api.Warning.AlarmRuleForm) {
  return request.put({
    url: '/alarm/rule/update',
    data
  })
}

// 删除告警规则
export function alarmRuleDeleteById(id: number) {
  return request.del({
    url: `/alarm/rule/delete/${id}`
  })
}

// 批量删除告警规则
export function alarmRuleBatchDelete(ids?: number[]) {
  return request.del({
    url: '/alarm/rule/batchDelete',
    data: ids
  })
}
