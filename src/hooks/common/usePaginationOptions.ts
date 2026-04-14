import { useWindowSize } from '@vueuse/core'

/**
 * 分页配置选项
 */
export interface PaginationOptions {
  pageSizes?: number[]
  align?: 'left' | 'center' | 'right'
  background?: boolean
  layout?: string
  hideOnSinglePage?: boolean
  size?: 'small' | 'default' | 'large'
  pagerCount?: number
}

/**
 * 默认分页配置 Hook
 * 根据屏幕宽度动态计算分页布局
 */
export function usePaginationOptions() {
  const { width } = useWindowSize()

  const LAYOUT = {
    MOBILE: 'prev, pager, next, sizes, jumper, total',
    IPAD: 'prev, pager, next, jumper, total',
    DESKTOP: 'total, prev, pager, next, sizes, jumper'
  }

  const layout = computed(() => {
    if (width.value < 768) {
      return LAYOUT.MOBILE
    } else if (width.value < 1024) {
      return LAYOUT.IPAD
    } else {
      return LAYOUT.DESKTOP
    }
  })

  const defaultPaginationOptions = computed<PaginationOptions>(() => ({
    pageSizes: [10, 20, 30, 50, 100],
    align: 'center',
    background: true,
    layout: layout.value,
    hideOnSinglePage: false,
    size: 'default',
    pagerCount: width.value > 1200 ? 7 : 5
  }))

  return {
    defaultPaginationOptions,
    layout
  }
}
