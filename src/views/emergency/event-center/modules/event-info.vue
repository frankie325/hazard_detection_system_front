<!-- 事件基础信息 -->
<template>
  <div class="event-info">
    <ElDescriptions :column="2" border>
      <ElDescriptionsItem label="事件名称">{{ event?.eventName }}</ElDescriptionsItem>
      <ElDescriptionsItem label="事件等级">
        <ElTag :type="getLevelType(event?.eventLevel)" size="small">
          {{ event?.eventLevelName }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="事件类型">
        <ElTag size="small">{{ event?.eventTypeName }}</ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="事件状态">
        <ElTag :type="getStatusType(event?.status)" size="small">
          {{ event?.statusName }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="地点">{{ event?.location }}</ElDescriptionsItem>
      <ElDescriptionsItem label="处置部门">{{ event?.deptName }}</ElDescriptionsItem>
      <ElDescriptionsItem label="创建时间">{{ event?.createTime }}</ElDescriptionsItem>
      <ElDescriptionsItem label="更新时间">{{ event?.updateTime }}</ElDescriptionsItem>
    </ElDescriptions>
  </div>
</template>

<script setup lang="ts">
  import { AlarmLevel, EmeEventStatus } from '@/enums/formEnum'

  defineOptions({ name: 'EventInfo' })

  interface Props {
    event: Api.Emergency.EventListItem | null
  }

  defineProps<Props>()

  const getLevelType = (level?: AlarmLevel) => {
    if (!level) return 'info'
    const map: Record<AlarmLevel, 'info' | 'warning' | 'danger'> = {
      [AlarmLevel.LOW]: 'info',
      [AlarmLevel.MEDIUM]: 'warning',
      [AlarmLevel.HIGH]: 'danger',
      [AlarmLevel.EMERGENCY]: 'danger'
    }
    return map[level] || 'info'
  }

  const getStatusType = (status?: EmeEventStatus) => {
    if (!status) return 'info'
    const map: Record<EmeEventStatus, 'info' | 'warning' | 'success' | 'primary' | 'danger'> = {
      [EmeEventStatus.START]: 'info',
      [EmeEventStatus.CONFIRMED]: 'primary',
      [EmeEventStatus.DISPATCHING]: 'warning',
      [EmeEventStatus.PROCESSING]: 'success',
      [EmeEventStatus.CLOSED]: 'danger'
    }
    return map[status] || 'info'
  }
</script>

<style lang="scss" scoped>
  .event-info {
    padding: 20px;
  }
</style>
