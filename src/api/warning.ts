/*
 * @Author: frank fugangkuang4@gmail.com
 * @Date: 2026-02-20 23:44:04
 * @LastEditors: frank fugangkuang4@gmail.com
 * @LastEditTime: 2026-02-24 18:46:45
 * @FilePath: /art-design-pro/src/api/warning.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/http'

// 获取所有告警规则（不分页）
export function allAlarmRule(data?: Api.Warning.AlarmRuleSearchParams) {
  return request.get<Api.Warning.AlarmRuleListItem[]>({
    url: '/alarm/rule/allList',
    data
  })
}

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

// 获取告警消息列表
export function alarmMessageList(data?: Api.Warning.AlarmMessageSearchParams) {
  return request.post<Api.Warning.AlarmMessageList>({
    url: '/alarm/message/list',
    data
  })
}

// 确认告警
export function alarmMessageConfirm(data: { alarmId: number; deptId: number }) {
  return request.post({
    url: '/alarm/message/confirm',
    data
  })
}

// 关闭告警
export function alarmMessageClose(data: Api.Warning.AlarmMessageCloseParams) {
  return request.post({
    url: '/alarm/message/update',
    data
  })
}

// 获取告警消息详情
export function alarmMessageDetail(id: number) {
  return request.get<Api.Warning.AlarmMessageDetail>({
    url: `/alarm/message/${id}`
  })
}
