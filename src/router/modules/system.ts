import { AppRouteRecord } from '@/types/router'

export const systemRoutes: AppRouteRecord = {
  path: '/system',
  name: 'System',
  component: '/index/index',
  meta: {
    title: 'menus.system.title',
    icon: 'ri:user-3-line'
  },
  children: [
    {
      path: 'department',
      name: 'Department',
      component: '/system/department',
      meta: {
        title: 'menus.system.department',
        keepAlive: true
      }
    },
    {
      path: 'role',
      name: 'Role',
      component: '/system/role',
      meta: {
        title: 'menus.system.role',
        keepAlive: true
      }
    },
    {
      path: 'user',
      name: 'User',
      component: '/system/user',
      meta: {
        title: 'menus.system.user',
        keepAlive: true
      }
    },
    {
      path: 'area',
      name: 'Area',
      component: '/system/area',
      meta: {
        title: 'menus.system.area',
        keepAlive: true
      }
    },
    {
      path: 'device',
      name: 'Device',
      component: '/system/device',
      meta: {
        title: 'menus.system.device',
        keepAlive: true
      }
    },
    {
      path: 'user-center',
      name: 'UserCenter',
      component: '/system/user-center',
      meta: {
        title: 'menus.system.userCenter',
        isHide: true,
        keepAlive: true,
        isHideTab: true
      }
    }
    // {
    //   path: 'menu',
    //   name: 'Menus',
    //   component: '/system/menu',
    //   meta: {
    //     title: 'menus.system.menu',
    //     keepAlive: true,
    //     roles: ['R_SUPER'],
    //     authList: [
    //       { title: '新增', authMark: 'add' },
    //       { title: '编辑', authMark: 'edit' },
    //       { title: '删除', authMark: 'delete' }
    //     ]
    //   }
    // }
  ]
}
