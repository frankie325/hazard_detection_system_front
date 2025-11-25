import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { systemRoutes } from './system'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'
import { detectRoutes } from './detect'
import { warningRoutes } from './warning'
import { emergencyRoutes } from './emergency'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  systemRoutes,
  detectRoutes,
  warningRoutes,
  emergencyRoutes,
  resultRoutes,
  exceptionRoutes
]
