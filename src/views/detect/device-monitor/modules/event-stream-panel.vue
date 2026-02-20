<template>
  <div class="event-stream-panel">
    <EventStreamSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <div class="event-groups">
      <template v-if="groupedEvents.length > 0">
        <div v-for="group in groupedEvents" :key="group.day" class="event-group">
          <div class="group-header">
            <span class="group-title">{{ group.day }}</span>
            <el-divider />
          </div>
          <div class="event-list">
            <div
              v-for="event in group.events"
              :key="event.id"
              class="event-item"
              @click="showEventDetail(event)"
            >
              <div class="event-time">
                {{ event.createTime.split(' ')[1] }}
              </div>
              <div class="event-info">
                <div class="event-name">
                  {{ event.eventName }}
                  <el-tag
                    :type="getEventTypeTag(event.eventTypeName)"
                    size="small"
                    class="event-type-tag"
                  >
                    {{ event.eventTypeName }}
                  </el-tag>
                </div>
                <div class="event-detail">{{ event.deviceName }}</div>
              </div>
              <div class="event-confidence">
                <ElProgress
                  style="width: 250px"
                  :percentage="Math.round(event.confidence * 100)"
                  :color="getConfidenceColor(event.confidence)"
                  :show-text="false"
                  :stroke-width="6"
                />

                <span class="confidence-value">{{ Math.round(event.confidence * 100) }}%</span>
              </div>
              <el-icon class="arrow-right"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </template>
      <el-empty v-else description="暂无数据" />
    </div>

    <!-- 事件详情弹窗 -->
    <el-dialog v-model="detailVisible" title="事件详情" width="500px" :before-close="closeDetail">
      <el-descriptions v-if="selectedEvent" :column="1" border>
        <el-descriptions-item label="事件名称">{{ selectedEvent.eventName }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ selectedEvent.eventTypeName }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{
          selectedEvent.location || device.location
        }}</el-descriptions-item>
        <el-descriptions-item label="设备/摄像头">{{
          selectedEvent.deviceName
        }}</el-descriptions-item>
        <el-descriptions-item label="置信度"
          >{{ Math.round(selectedEvent.confidence * 100) }}%</el-descriptions-item
        >
        <el-descriptions-item label="发生时间">{{ selectedEvent.createTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="closeDetail">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElProgress, ElMessage } from 'element-plus'
  import { ArrowRight } from '@element-plus/icons-vue'
  import { eventStreamList } from '@/api/detect'
  import EventStreamSearch from './event-stream-search.vue'

  interface Props {
    device: any
  }

  const props = defineProps<Props>()

  const searchForm = ref({
    eventName: '',
    eventTypeName: ''
  })
  const detailVisible = ref(false)
  const selectedEvent = ref<Api.Detect.EventStreamListItem | null>(null)
  const events = ref<Api.Detect.EventStreamListItem[]>([])
  const loading = ref(false)

  /**
   * 处理搜索
   */
  const handleSearch = () => {
    if (props.device?.id) {
      loadDeviceEvents(Number(props.device.id))
    }
  }

  /**
   * 处理重置
   */
  const handleReset = () => {
    if (props.device?.id) {
      loadDeviceEvents(Number(props.device.id))
    }
  }

  /**
   * 加载设备事件流数据
   */
  const loadDeviceEvents = async (deviceId?: number) => {
    if (!deviceId) return
    loading.value = true
    try {
      const res = await eventStreamList({
        current: 1,
        size: 99999,
        deviceId,
        eventName: searchForm.value.eventName || undefined,
        deviceName: searchForm.value.eventName || undefined,
        eventTypeName: searchForm.value.eventTypeName || undefined
      })
      events.value = res.list || []
    } catch {
      ElMessage.error('加载事件流数据失败')
      events.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 监听设备变化，重新加载数据
   */
  watch(
    () => props.device?.id,
    (newDeviceId) => {
      if (newDeviceId) {
        loadDeviceEvents(Number(newDeviceId))
      }
    },
    { immediate: true }
  )

  // 置信度颜色
  const getConfidenceColor = (confidence: number) => {
    const percentage = Math.round(confidence * 100)
    if (percentage >= 90) return '#F56C6C'
    if (percentage >= 80) return '#E6A23C'
    if (percentage >= 70) return '#409EFF'
    return '#67C23A'
  }

  /**
   * 获取事件类型对应的Tag类型
   */
  const getEventTypeTag = (eventTypeName: string): 'danger' | 'warning' | 'primary' | 'info' => {
    const typeMap: Record<string, 'danger' | 'warning' | 'primary' | 'info'> = {
      火灾: 'danger',
      塌方: 'warning',
      交通事故: 'danger',
      抛洒物: 'warning'
    }
    return typeMap[eventTypeName] || 'info'
  }

  // 按日期分组
  const groupedEvents = computed(() => {
    const groups: { [key: string]: Api.Detect.EventStreamListItem[] } = {}

    events.value.forEach((event) => {
      const date = event.createTime.split(' ')[0]
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(event)
    })

    // 转换为数组并按日期降序排序
    return Object.keys(groups)
      .map((date) => ({
        day: formatDate(date),
        date,
        events: groups[date]
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return '今天'
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return '昨天'
    }
    return dateStr
  }

  // 显示事件详情
  const showEventDetail = (event: Api.Detect.EventStreamListItem) => {
    selectedEvent.value = event
    detailVisible.value = true
  }

  // 关闭详情
  const closeDetail = () => {
    detailVisible.value = false
    selectedEvent.value = null
  }
</script>

<style lang="scss" scoped>
  .event-stream-panel {
    display: flex;
    flex-direction: column;
    height: 100%;

    .event-groups {
      flex: 1;
      padding-top: 12px;
      padding-right: 4px;
      overflow: auto;

      .event-group {
        margin-bottom: 24px;

        .group-header {
          .group-title {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 12px;
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }

          .group-title::before {
            width: 4px;
            height: 16px;
            content: '';
            background: linear-gradient(to bottom, #409eff, #66b1ff);
            border-radius: 2px;
          }

          :deep(.el-divider) {
            margin: 12px 0;
          }
        }

        .event-list {
          .event-item {
            display: flex;
            align-items: center;
            padding: 16px;
            margin-bottom: 12px;
            cursor: pointer;
            background: #fff;
            border: 1px solid #ebeef5;
            border-radius: 8px;
            transition: all 0.3s;

            &:hover {
              border-color: #409eff;
              box-shadow: 0 4px 16px rgb(64 158 255 / 15%);
              transform: translateY(-2px);
            }

            .event-time {
              width: 100px;
              font-size: 18px;
              font-weight: 600;
              color: #409eff;
            }

            .event-info {
              flex: 1;
              margin-left: 16px;

              .event-name {
                display: flex;
                gap: 8px;
                align-items: center;
                margin-bottom: 6px;
                font-size: 18px;
                font-weight: 600;
                color: #303133;

                .event-type-tag {
                  padding: 2px 8px;
                  font-size: 12px;
                }
              }

              .event-detail {
                font-size: 13px;
                color: #909399;
              }
            }

            .event-confidence {
              display: flex;
              gap: 8px;
              align-items: center;
              width: 120px;

              .confidence-value {
                min-width: 36px;
                font-size: 14px;
                color: #909399;
              }
            }

            .arrow-right {
              font-size: 16px;
              color: #c0c4cc;
            }
          }
        }
      }
    }
  }
</style>
