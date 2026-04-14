import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/system/department',
  name: 'SystemDepartment',
  component: () => import('@/views/system/department/index.vue'),
  meta: {
    title: '部门管理',
    icon: 'ep:folder',
    affix: false
  }
} as RouteRecordRaw
