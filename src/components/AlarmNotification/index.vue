<script setup lang="ts">
  import { router } from '@/router'
  defineProps<{
    alarm: Api.Warning.AlarmMessageListItem
    showButton?: boolean
  }>()

  const handleClick = () => {
    router.push('/warning/message')
  }
</script>

<template>
  <div
    class="alarm-notification-body"
    :class="[`is-card alarm-level-${alarm.alarmLevel?.toLowerCase()}`]"
  >
    <div class="alarm-notification-content">
      <div class="alarm-name">{{ alarm.alarmName }}</div>
      <div class="alarm-meta">{{ alarm.deviceName }} · {{ alarm.location }}</div>
    </div>
    <el-button v-if="showButton !== false" type="primary" size="small" @click="handleClick">
      处理
    </el-button>
  </div>
</template>

<style scoped>
  .alarm-notification-body {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;

    &.is-card {
      padding: 10px 14px;
      cursor: pointer;
      background: var(--art-gray-100);
      border: 1px solid var(--art-gray-300);
      border-left: 3px solid transparent;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
      transition: all 0.2s;

      &:hover {
        background: var(--art-gray-200);
        border-color: var(--art-gray-400);
        box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
        transform: translateY(-1px);
      }

      .dark & {
        background: var(--art-gray-200);
        border-color: rgb(255 255 255 / 8%);
        box-shadow: 0 2px 8px rgb(0 0 0 / 30%);

        &:hover {
          background: var(--art-gray-300);
          border-color: rgb(255 255 255 / 12%);
          box-shadow: 0 4px 12px rgb(0 0 0 / 40%);
        }
      }
    }

    &.alarm-level-emergency,
    &.alarm-level-emergency.is-card {
      border-left-color: #ff5a5a;
    }

    &.alarm-level-high,
    &.alarm-level-high.is-card {
      border-left-color: #ff9a3c;
    }

    &.alarm-level-medium,
    &.alarm-level-medium.is-card {
      border-left-color: #ffd23f;
    }

    &.alarm-level-low,
    &.alarm-level-low.is-card {
      border-left-color: #4d9eff;
    }
  }

  .alarm-notification-content {
    flex: 1;
    min-width: 0;
  }

  .alarm-name {
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .alarm-meta {
    margin-top: 2px;
    overflow: hidden;
    font-size: 12px;
    color: var(--art-gray-600);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
