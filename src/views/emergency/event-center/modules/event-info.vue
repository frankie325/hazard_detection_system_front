<!-- 事件基础信息 -->
<template>
  <div class="event-info">
    <ElDescriptions :column="2" border>
      <ElDescriptionsItem label="事件名称">{{ event?.eventName }}</ElDescriptionsItem>
      <ElDescriptionsItem label="事件等级">
        <AlarmLevelDot v-if="event?.eventLevel" :level="event.eventLevel" />
      </ElDescriptionsItem>
      <ElDescriptionsItem label="事件类型">
        <EventTypeTag :type="event?.eventType" :label="event?.eventTypeName" />
      </ElDescriptionsItem>
      <ElDescriptionsItem label="事件状态">
        <span class="info-text" :class="'status-' + getStatusColorClass(event?.status)">{{
          event?.statusName
        }}</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="地点">{{ event?.location }}</ElDescriptionsItem>
      <ElDescriptionsItem label="处置部门">{{ event?.deptName }}</ElDescriptionsItem>
      <ElDescriptionsItem label="创建时间">{{ event?.createTime }}</ElDescriptionsItem>
      <ElDescriptionsItem label="更新时间">{{ event?.updateTime }}</ElDescriptionsItem>
    </ElDescriptions>
  </div>
</template>

<script setup lang="ts">
  import { EmeEventStatus } from '@/enums/formEnum'
  import AlarmLevelDot from '@/components/alarm-level-dot/index.vue'
  import EventTypeTag from '@/components/event-type-tag/index.vue'

  defineOptions({ name: 'EventInfo' })

  interface Props {
    event: Api.Emergency.EventListItem | null
  }

  defineProps<Props>()

  const getStatusColorClass = (status?: EmeEventStatus) => {
    if (!status) return 'gray'
    const map: Record<EmeEventStatus, string> = {
      [EmeEventStatus.START]: 'green',
      [EmeEventStatus.CONFIRMED]: 'blue',
      [EmeEventStatus.DISPATCHING]: 'orange',
      [EmeEventStatus.PROCESSING]: 'green',
      [EmeEventStatus.CLOSED]: 'gray'
    }
    return map[status] || 'gray'
  }
</script>

<style lang="scss" scoped>
  .event-info {
    padding: 20px;

    .info-text {
      display: inline-flex;
      gap: 4px;
      align-items: center;
      font-size: 13px;

      &.status-green {
        color: #67c23a;
      }

      &.status-blue {
        color: #409eff;
      }

      &.status-orange {
        color: #e6a23c;
      }

      &.status-gray {
        color: #909399;
      }
    }
  }
</style>
