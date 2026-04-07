<!-- 告警等级脉冲圆点组件 -->
<!-- 等级越高，脉冲越快、光晕越大 -->
<!-- 紧急：快速脉冲(1s) + 大光晕 + 轻微抖动 -->
<!-- 高级：中速脉冲(2s) + 中光晕 -->
<!-- 中级：慢速脉冲(3s) + 小光晕 -->
<!-- 低级：静态圆点，无脉冲 -->
<template>
  <span class="alarm-level-dot" :class="[`level-${props.level?.toLowerCase()}`]">
    <span class="dot-wrapper">
      <i class="dot"></i>
      <i v-if="showPulse" class="pulse-ring"></i>
      <i v-if="showGlow" class="glow"></i>
    </span>
    <span v-if="$slots.default || !hideLabel" class="label-text">
      <slot>{{ label }}</slot>
    </span>
  </span>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { AlarmLevel } from '@/enums/formEnum'
  import { alarmLevelDotMap } from '@/config/modules/warning'

  defineOptions({ name: 'AlarmLevelDot' })

  interface Props {
    /** 告警等级枚举值 */
    level?: AlarmLevel
    /** 自定义显示文本，不传则使用默认标签 */
    label?: string
    /** 是否隐藏文字标签，仅显示圆点 */
    hideLabel?: boolean
  }

  const props = defineProps<Props>()

  const levelConfig = computed(() => alarmLevelDotMap[props.level])

  /** 默认显示标签 */
  const label = computed(() => props.label || levelConfig.value?.label || props.level)

  /** 是否显示脉冲动画（紧急、高级、中级显示） */
  const showPulse = computed(
    () =>
      props.level === AlarmLevel.EMERGENCY ||
      props.level === AlarmLevel.HIGH ||
      props.level === AlarmLevel.MEDIUM
  )

  /** 是否显示光晕效果（紧急、高级显示） */
  const showGlow = computed(
    () => props.level === AlarmLevel.EMERGENCY || props.level === AlarmLevel.HIGH
  )
</script>

<style lang="scss" scoped>
  /* 颜色变量 — 读取自 alarmLevelDotMap */
  .alarm-level-dot {
    --dot-color: #909399;

    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    font-weight: 500;
    line-height: 26px;
    color: var(--dot-color);

    /* 紧急 — 深红 */
    &.level-emergency {
      --dot-color: #ef4444;
      --glow-color: rgb(239 68 68 / 40%);
      --pulse-speed: 1s;
    }

    /* 高级 — 橙红 */
    &.level-high {
      --dot-color: #f97316;
      --glow-color: rgb(249 115 22 / 35%);
      --pulse-speed: 2s;
    }

    /* 中级 — 黄 */
    &.level-medium {
      --dot-color: #eab308;
      --pulse-speed: 3s;
    }

    /* 低级 — 蓝 */
    &.level-low {
      --dot-color: #3b82f6;
    }

    .dot-wrapper {
      position: relative;
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 12px;
      height: 12px;
    }

    /* 实心圆点 */
    .dot {
      position: relative;
      z-index: 2;
      width: 8px;
      height: 8px;
      background: var(--dot-color);
      border-radius: 50%;
    }

    /* 脉冲扩散环 */
    .pulse-ring {
      position: absolute;
      z-index: 1;
      width: 8px;
      height: 8px;
      border: 2px solid var(--dot-color);
      border-radius: 50%;
      animation: pulse-expand var(--pulse-speed, 2s) ease-out infinite;
    }

    /* 光晕效果 */
    .glow {
      position: absolute;
      z-index: 0;
      width: 24px;
      height: 24px;
      background: var(--glow-color, transparent);
      filter: blur(6px);
      border-radius: 50%;
      animation: glow-breathe var(--pulse-speed, 2s) ease-in-out infinite;
    }
  }

  /* 紧急等级额外的抖动效果 */
  .alarm-level-dot.level-emergency .dot {
    animation: emergency-shake 0.8s ease-in-out infinite;
  }

  /* 脉冲扩散动画 */
  @keyframes pulse-expand {
    0% {
      opacity: 0.8;
      transform: scale(1);
    }

    100% {
      opacity: 0;
      transform: scale(2.8);
    }
  }

  /* 光晕呼吸动画 */
  @keyframes glow-breathe {
    0%,
    100% {
      opacity: 0.4;
      transform: scale(0.8);
    }

    50% {
      opacity: 0.8;
      transform: scale(1.3);
    }
  }

  /* 紧急抖动 */
  @keyframes emergency-shake {
    0%,
    100% {
      transform: translateX(0);
    }

    10% {
      transform: translateX(-1px);
    }

    20% {
      transform: translateX(1px);
    }

    30% {
      transform: translateX(-1px);
    }

    40% {
      transform: translateX(1px);
    }

    50% {
      transform: translateX(0);
    }
  }
</style>
