import { AppRouteRecord } from '@/types/router'

export const detectRoutes: AppRouteRecord = {
  path: '/detect',
  name: 'Detect',
  component: '/index/index',
  meta: {
    title: 'menus.detect.title',
    icon: 'iconoir:radiation'
  },
  children: [
    {
      path: 'device-monitor',
      name: 'DeviceMonitor',
      component: '/detect/device-monitor/index',
      meta: {
        title: 'menus.detect.deviceMonitor',
        keepAlive: true
      }
    },
    {
      path: 'events',
      name: 'DetectEvents',
      component: '/detect/events/index',
      meta: {
        title: 'menus.detect.events',
        keepAlive: true
      }
    }
  ]
}
