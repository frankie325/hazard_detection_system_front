<template>
  <div class="event-stream-panel">
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入设备名称/地点"
        prefix-icon="Search"
        clearable
        style="width: 300px"
      />
      <el-select v-model="eventType" placeholder="全部类型" clearable style="width: 150px">
        <el-option label="抛洒物" value="抛洒物" />
        <el-option label="塌方" value="塌方" />
        <el-option label="火灾" value="火灾" />
        <el-option label="交通事故" value="交通事故" />
      </el-select>
    </div>

    <div class="event-groups">
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
              {{ event.timestamp.split(' ')[1] }}
            </div>
            <div class="event-info">
              <div class="event-name">{{ event.eventType }}</div>
              <div class="event-detail"> {{ event.eventName }} | {{ event.deviceName }} </div>
            </div>
            <div class="event-confidence">
              <el-progress
                :percentage="event.confidence"
                :color="getConfidenceColor(event.confidence)"
                :show-text="false"
                :stroke-width="6"
              />
              <span class="confidence-value">{{ event.confidence }}%</span>
            </div>
            <el-icon class="arrow-right"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 事件详情弹窗 -->
    <el-dialog v-model="detailVisible" title="事件详情" width="500px" :before-close="closeDetail">
      <el-descriptions v-if="selectedEvent" :column="1" border>
        <el-descriptions-item label="事件名称">{{ selectedEvent.eventName }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ selectedEvent.eventType }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{
          selectedEvent.location || device.location
        }}</el-descriptions-item>
        <el-descriptions-item label="设备/摄像头">
          {{ selectedEvent.deviceCode || device.code }}
        </el-descriptions-item>
        <el-descriptions-item label="置信度">{{ selectedEvent.confidence }}%</el-descriptions-item>
        <el-descriptions-item label="发生时间">{{ selectedEvent.timestamp }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="closeDetail">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ArrowRight } from '@element-plus/icons-vue'

  interface EventItem {
    id: string
    eventName: string
    eventType: string
    deviceId: string
    deviceName: string
    deviceCode?: string
    location?: string
    confidence: number
    timestamp: string
  }

  interface Props {
    device: any
    events: EventItem[]
  }

  const props = defineProps<Props>()

  const searchKeyword = ref('')
  const eventType = ref('')
  const detailVisible = ref(false)
  const selectedEvent = ref<EventItem | null>(null)

  // 置信度颜色
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return '#67C23A'
    if (confidence >= 80) return '#409EFF'
    if (confidence >= 70) return '#E6A23C'
    return '#F56C6C'
  }

  // 过滤事件
  const filteredEvents = computed(() => {
    return props.events.filter((event) => {
      const matchKeyword =
        !searchKeyword.value ||
        event.eventName.includes(searchKeyword.value) ||
        event.deviceName.includes(searchKeyword.value)
      const matchType = !eventType.value || event.eventType === eventType.value
      return matchKeyword && matchType
    })
  })

  // 按日期分组
  const groupedEvents = computed(() => {
    const groups: { [key: string]: EventItem[] } = {}

    filteredEvents.value.forEach((event) => {
      const date = event.timestamp.split(' ')[0]
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
  const showEventDetail = (event: EventItem) => {
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
    .search-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    .event-groups {
      .event-group {
        .group-header {
          .group-title {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            color: #909399;
          }

          :deep(.el-divider) {
            margin: 8px 0;
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
              box-shadow: 0 2px 12px rgb(64 158 255 / 10%);
            }

            .event-time {
              width: 100px;
              font-size: 16px;
              font-weight: 500;
              color: #303133;
            }

            .event-info {
              flex: 1;
              margin-left: 16px;

              .event-name {
                margin-bottom: 4px;
                font-size: 16px;
                font-weight: 500;
                color: #303133;
              }

              .event-detail {
                font-size: 14px;
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
