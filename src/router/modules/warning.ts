import { AppRouteRecord } from '@/types/router'

export const warningRoutes: AppRouteRecord = {
  path: '/warning',
  name: 'Warning',
  component: '/index/index',
  meta: {
    title: 'menus.warning.title',
    icon: 'ri:alarm-warning-line'
  },
  children: [
    {
      path: 'rule',
      name: 'Rule',
      component: '/warning/rule',
      meta: {
        title: 'menus.warning.rule',
        keepAlive: true
      }
    },
    {
      path: 'message',
      name: 'Message',
      component: '/warning/message',
      meta: {
        title: 'menus.warning.message',
        keepAlive: true
      }
    },
    {
      path: 'detail',
      name: 'MessageDetail',
      component: '/warning/message/detail',
      meta: {
        title: 'menus.warning.messageDetail',
        keepAlive: true,
        isHide: true
      }
    }
  ]
}
