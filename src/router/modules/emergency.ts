import { AppRouteRecord } from '@/types/router'

export const emergencyRoutes: AppRouteRecord = {
  path: '/emergency',
  name: 'Emergency',
  component: '/index/index',
  meta: {
    title: 'menus.emergency.title',
    icon: 'material-symbols:emergency-outline'
  },
  children: [
    {
      path: 'event-center',
      name: 'EventCenter',
      component: '/emergency/event-center',
      meta: {
        title: 'menus.emergency.eventCenter',
        keepAlive: true
      }
    },
    {
      path: 'resource-bind',
      name: 'ResourceBind',
      component: '/emergency/resource-bind',
      meta: {
        title: 'menus.emergency.resourceBind',
        keepAlive: true
      }
    },
    {
      path: 'report',
      name: 'Report',
      component: '/emergency/report',
      meta: {
        title: 'menus.emergency.report',
        keepAlive: true
      }
    }
  ]
}
