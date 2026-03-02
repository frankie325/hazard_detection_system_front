<!-- 事件时间线 -->
<template>
  <div class="event-timeline">
    <ElScrollbar v-if="timeline.length > 0">
      <ElTimeline>
        <ElTimelineItem
          v-for="item in timeline"
          :key="item.id"
          :timestamp="item.operateTime"
          placement="top"
          :color="getTimelineColor(item.actionType)"
        >
          <ElCard shadow="hover">
            <div class="timeline-header">
              <ElTag :type="getTimelineTagType(item.actionType)" size="small">
                {{ getTimelineTypeName(item.actionType) }}
              </ElTag>
              <span class="operator">{{ item.operatorName }}</span>
            </div>
            <div class="timeline-content">{{ item.actionText }}</div>
            <div v-if="item.departure || item.destination" class="timeline-route">
              <span v-if="item.departure">出发地：{{ item.departure }}</span>
              <span v-if="item.destination">目的地：{{ item.destination }}</span>
            </div>
            <div v-if="item.remark" class="timeline-remark">
              <span class="label">备注：</span>
              <span>{{ item.remark }}</span>
            </div>
          </ElCard>
        </ElTimelineItem>
      </ElTimeline>
    </ElScrollbar>
    <ElEmpty v-else description="暂无时间线记录" />
  </div>
</template>

<script setup lang="ts">
  import { eventTimeline } from '@/api/emergency'

  defineOptions({ name: 'EventTimeline' })

  type TimelineType = Api.Emergency.TimelineType

  interface Props {
    eventId: number
  }

  const props = defineProps<Props>()

  const timeline = ref<Api.Emergency.TimelineItem[]>([])
  const loading = ref(false)

  // 时间线类型名称映射
  const typeNameMap: Record<TimelineType, string> = {
    CONFIRM: '确认',
    BIND: '资源绑定',
    SIGN: '到场签到',
    REMARK: '行动备注',
    ATTACHMENT: '上传资料',
    CLOSED: '关闭事件'
  }

  // 时间线颜色映射
  const typeColorMap: Record<TimelineType, string> = {
    CONFIRM: '#409EFF',
    BIND: '#67C23A',
    SIGN: '#E6A23C',
    REMARK: '#909399',
    ATTACHMENT: '#909399',
    CLOSED: '#F56C6C'
  }

  // 标签类型映射
  const tagTypeMap: Record<TimelineType, 'info' | 'primary' | 'success' | 'warning' | 'danger'> = {
    CONFIRM: 'primary',
    BIND: 'success',
    SIGN: 'warning',
    REMARK: 'info',
    ATTACHMENT: 'info',
    CLOSED: 'danger'
  }

  const getTimelineTypeName = (type: TimelineType) => typeNameMap[type] || type
  const getTimelineColor = (type: TimelineType) => typeColorMap[type] || '#909399'
  const getTimelineTagType = (type: TimelineType) => tagTypeMap[type] || 'info'

  // 加载时间线
  const loadTimeline = async () => {
    if (!props.eventId) return
    loading.value = true
    try {
      const res = await eventTimeline(props.eventId)
      timeline.value = res
    } catch (error) {
      console.error('加载时间线失败:', error)
    } finally {
      loading.value = false
    }
  }

  watch(
    () => props.eventId,
    () => {
      loadTimeline()
    },
    { immediate: true }
  )

  defineExpose({ refresh: loadTimeline })
</script>

<style lang="scss" scoped>
  .event-timeline {
    height: 100%;
    padding: 20px;

    :deep(.el-timeline) {
      padding-left: 0;
    }

    .timeline-header {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 8px;

      .operator {
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }

    .timeline-content {
      font-size: 14px;
      line-height: 1.6;
    }

    .timeline-route,
    .timeline-remark {
      margin-top: 8px;
      font-size: 13px;
      color: var(--el-text-color-secondary);

      .label {
        margin-right: 4px;
      }
    }

    .timeline-route {
      display: flex;
      gap: 16px;
    }
  }
</style>
