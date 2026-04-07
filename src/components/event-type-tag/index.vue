<!--
 * @Author: frank fugangkuang4@gmail.com
 * @Date: 2026-04-07 15:10:40
 * @LastEditors: frank fugangkuang4@gmail.com
 * @LastEditTime: 2026-04-07 16:05:17
 * @FilePath: /art-design-pro/src/components/event-type-tag/index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<!-- 事件类型标签组件 -->
<!-- 展示事件类型图标 + 文字标签 -->
<template>
  <span class="event-type-tag">
    <Icon :icon="iconName" :color="iconColor" :width="size" :height="size" />
    <span class="label">{{ displayLabel }}</span>
  </span>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Icon } from '@iconify/vue'
  import { EventStreamTypeEnum } from '@/enums/formEnum'
  import {
    eventTypeIconNameMap,
    eventTypeColorMap,
    eventTypeOptions
  } from '@/config/modules/warning'

  defineOptions({ name: 'EventTypeTag' })

  /** 事件类型枚举 → 中文标签映射 */
  const eventTypeLabelMap: Record<string, string> = {}
  eventTypeOptions.forEach((opt) => {
    eventTypeLabelMap[opt.value] = opt.label
  })

  interface Props {
    /** 事件类型枚举值 */
    type?: EventStreamTypeEnum
    /** 自定义显示文本，不传则自动使用中文标签 */
    label?: string
    /** 图标尺寸，默认 16 */
    size?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 16
  })

  /** 图标名称 */
  const iconName = computed(() => eventTypeIconNameMap[props.type!] || 'mdi:alert-circle-outline')

  /** 图标颜色 */
  const iconColor = computed(() => eventTypeColorMap[props.type!] || '#909399')

  /** 显示文本：优先自定义 label → 查找中文标签 → 枚举值本身 */
  const displayLabel = computed(() => {
    if (props.label) return props.label
    if (props.type) return eventTypeLabelMap[props.type] || props.type
    return '-'
  })
</script>

<style lang="scss" scoped>
  .event-type-tag {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 13px;
    line-height: 26px;
    color: var(--el-text-color-primary);
  }
</style>
