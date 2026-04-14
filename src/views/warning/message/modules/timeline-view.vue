<!-- 事件轴视图 -->
<template>
  <div class="timeline-view">
    <ElScrollbar v-loading="loading">
      <div class="timeline-container">
        <ElTimeline>
          <ElTimelineItem
            v-for="item in data"
            :key="item.id"
            :timestamp="item.createTime"
            placement="top"
            :color="getTimelineColor(item.alarmStatus)"
            size="large"
          >
            <ElCard class="timeline-card" shadow="hover">
              <div class="card-header">
                <div class="title-row">
                  <span class="alarm-name">{{ item.alarmName }}</span>
                  <ElTag :type="getStatusType(item.alarmStatus)" size="small">
                    {{ getStatusLabel(item.alarmStatus) }}
                  </ElTag>
                </div>
              </div>
              <div class="card-content">
                <div class="content-row">
                  <div class="content-item">
                    <span class="label">告警等级</span>
                    <AlarmLevelDot :level="item.alarmLevel" />
                  </div>
                  <div class="content-item">
                    <span class="label">告警分类</span>
                    <EventTypeTag :type="item.eventType" />
                  </div>
                </div>
                <div class="content-row">
                  <div class="content-item">
                    <span class="label">发生设备</span>
                    <span class="value">{{ item.deviceName }}</span>
                  </div>
                  <div class="content-item">
                    <span class="label">地点</span>
                    <span class="value">{{ item.location }}</span>
                  </div>
                </div>
                <div class="content-row">
                  <div class="content-item">
                    <span class="label">规则</span>
                    <span class="value">{{ item.ruleName }}</span>
                  </div>
                </div>
                <div v-if="item.closeTime || item.confirmer" class="content-row extra-info">
                  <div v-if="item.closeTime" class="content-item">
                    <span class="label">关闭时间</span>
                    <span class="value">{{ item.closeTime }}</span>
                  </div>
                  <div v-if="item.confirmer" class="content-item">
                    <span class="label">确认人</span>
                    <span class="value">{{ item.confirmer }}</span>
                  </div>
                </div>
                <div v-if="item.alarmStatus !== AlarmStatus.CLOSED" class="card-footer">
                  <ElButton
                    v-if="item.alarmStatus === AlarmStatus.OPEN"
                    type="primary"
                    size="small"
                    @click="emit('confirm', item)"
                  >
                    确认
                  </ElButton>
                  <ElButton type="danger" size="small" @click="emit('close', item)">关闭</ElButton>
                </div>
              </div>
            </ElCard>
          </ElTimelineItem>
        </ElTimeline>
      </div>
      <div v-if="!loading && data.length === 0" class="empty-data">
        <ElEmpty description="暂无数据" />
      </div>
    </ElScrollbar>
    <div class="pagination-wrapper custom-pagination">
      <ElPagination
        :current-page="pagination.current"
        :page-size="pagination.size"
        :total="pagination.total"
        v-bind="paginationOptions"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { AlarmStatus } from '@/enums/formEnum'
  import { usePaginationOptions } from '@/hooks/common/usePaginationOptions'
  import AlarmLevelDot from '@/components/AlarmLevelDot/index.vue'
  import EventTypeTag from '@/components/EventTypeTag/index.vue'

  defineOptions({ name: 'TimelineView' })

  const { defaultPaginationOptions: paginationOptions } = usePaginationOptions()

  interface Props {
    loading: boolean
    data: Api.Warning.AlarmMessageListItem[]
    pagination: { current: number; size: number; total: number }
  }

  interface Emits {
    (e: 'size-change', size: number): void
    (e: 'current-change', current: number): void
    (e: 'confirm', row: Api.Warning.AlarmMessageListItem): void
    (e: 'close', row: Api.Warning.AlarmMessageListItem): void
  }

  defineProps<Props>()
  const emit = defineEmits<Emits>()

  const handleSizeChange = (size: number) => {
    emit('size-change', size)
  }

  const handleCurrentChange = (current: number) => {
    emit('current-change', current)
  }

  const statusMap: Record<AlarmStatus, { label: string; type: 'success' | 'warning' | 'info' }> = {
    [AlarmStatus.OPEN]: { label: '开启', type: 'success' },
    [AlarmStatus.PROCESSING]: { label: '处理中', type: 'warning' },
    [AlarmStatus.CLOSED]: { label: '已关闭', type: 'info' }
  }

  const statusColorMap: Record<AlarmStatus, string> = {
    [AlarmStatus.OPEN]: '#67c23a',
    [AlarmStatus.PROCESSING]: '#e6a23c',
    [AlarmStatus.CLOSED]: '#909399'
  }

  const getStatusLabel = (status: AlarmStatus) => statusMap[status]?.label || status
  const getStatusType = (status: AlarmStatus) => statusMap[status]?.type || 'info'
  const getTimelineColor = (status: AlarmStatus) => statusColorMap[status] || '#909399'
</script>

<style lang="scss" scoped>
  .timeline-view {
    display: flex;
    flex-direction: column;
    height: 100%;

    .timeline-container {
      padding: 10px;
    }

    .timeline-card {
      margin-bottom: 0;

      .card-header {
        margin-bottom: 12px;

        .title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .alarm-name {
            font-size: 15px;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }
        }
      }

      .card-content {
        .content-row {
          display: flex;
          gap: 24px;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }

          &.extra-info {
            padding-top: 8px;
            margin-top: 8px;
            border-top: 1px dashed var(--el-border-color-lighter);
          }

          .content-item {
            display: flex;
            gap: 8px;
            align-items: center;

            .label {
              font-size: 13px;
              color: var(--el-text-color-secondary);
              white-space: nowrap;
            }

            .value {
              font-size: 13px;
              color: var(--el-text-color-primary);
            }
          }
        }

        .card-footer {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          padding-top: 12px;
          margin-top: 12px;
          border-top: 1px solid var(--el-border-color-lighter);
        }
      }
    }

    .empty-data {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      padding: 16px 16px 0;
      background: var(--el-bg-color);
      border-top: 1px solid var(--el-border-color-light);
    }
  }
</style>
