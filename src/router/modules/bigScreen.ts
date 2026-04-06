import { AppRouteRecord } from '@/types/router'

export const bigScreenRoutes: AppRouteRecord = {
  path: '/bigScreen/index',
  name: 'bigScreen',
  component: '/bigScreen/index',
  meta: {
    title: '数据大屏',
    isFullPage: true,
    icon: 'material-symbols:ambient-screen-outline'
  }
}
