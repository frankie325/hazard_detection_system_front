<!-- 应急指挥 - 事件中心 -->
<template>
  <div class="event-center">
    <!-- 左侧事件列表 -->
    <div class="event-list-panel">
      <div class="panel-header">
        <h3 class="title">事件列表</h3>
        <ElInput
          v-model="searchKeyword"
          placeholder="搜索事件ID/类型/地点"
          clearable
          :prefix-icon="Search"
          class="search-input"
        />
      </div>
      <ElScrollbar class="event-list">
        <div v-if="loading" class="loading-wrapper">
          <ElIcon class="is-loading"><Loading /></ElIcon>
        </div>
        <template v-else>
          <div
            v-for="event in filteredEvents"
            :key="event.id"
            class="event-item"
            :class="{ active: selectedEvent?.id === event.id }"
            @click="handleSelectEvent(event)"
          >
            <div class="event-header">
              <span class="event-type">{{ event.eventName }}</span>
              <ElTag :type="getLevelType(event.eventLevel)" size="small">
                {{ event.eventLevelName }}
              </ElTag>
            </div>
            <div class="event-location">{{ event.location }}</div>
            <div class="event-footer">
              <span class="event-time">{{ formatTime(event.createTime) }}</span>
              <ElTag :type="getStatusType(event.status)" size="small" effect="plain">
                {{ event.statusName }}
              </ElTag>
            </div>
          </div>
          <ElEmpty v-if="filteredEvents.length === 0" description="暂无事件" />
        </template>
      </ElScrollbar>
    </div>

    <!-- 右侧事件详情 -->
    <div class="event-detail-panel">
      <template v-if="selectedEvent">
        <!-- 事件详情头部 -->
        <div class="detail-header">
          <div class="header-left">
            <span class="event-name">{{ selectedEvent.eventName }}</span>
            <ElTag :type="getLevelType(selectedEvent.eventLevel)">
              {{ selectedEvent.eventLevelName }}
            </ElTag>
          </div>
          <div class="header-right">
            <span class="create-time">发生时间: {{ formatTime(selectedEvent.createTime) }}</span>
          </div>
        </div>

        <!-- 内容区域 -->
        <ElScrollbar class="detail-content">
          <!-- 基础信息 -->
          <div class="info-section">
            <div class="section-title">基础信息</div>
            <EventInfo :event="selectedEvent" />
          </div>

          <!-- 时间线 -->
          <div class="info-section">
            <div class="section-title">时间线</div>
            <EventTimeline ref="timelineRef" :event-id="selectedEvent.id" />
          </div>
        </ElScrollbar>

        <!-- 操作按钮区 -->
        <div class="action-bar">
          <ElButton
            v-if="selectedEvent.status === EmeEventStatus.START"
            type="primary"
            @click="handleConfirm"
          >
            确认(ACK)
          </ElButton>
          <ElButton
            v-if="selectedEvent.status === EmeEventStatus.CONFIRMED"
            type="success"
            @click="handleResourceBind"
          >
            资源绑定
          </ElButton>
          <!-- 只有接收角色下的用户才能到场签到 -->
          <ElButton
            v-if="
              userInfo.roleId === selectedEvent.receiverRoleId &&
              selectedEvent.status === EmeEventStatus.DISPATCHING
            "
            type="warning"
            @click="handleArrive"
          >
            到场
          </ElButton>
          <ElButton
            v-if="selectedEvent.status !== EmeEventStatus.CLOSED"
            type="danger"
            @click="handleClose"
          >
            关闭
          </ElButton>
          <ElButton v-if="selectedEvent.status !== EmeEventStatus.CLOSED" @click="handleAddNote">
            行动备注
          </ElButton>
          <ElButton v-if="selectedEvent.status !== EmeEventStatus.CLOSED" @click="handleUpload">
            上传资料
          </ElButton>
        </div>
      </template>
      <ElEmpty v-else description="请选择一个事件查看详情" />
    </div>

    <!-- 确认弹窗 -->
    <ConfirmDialog v-model="confirmVisible" :event="selectedEvent" @success="handleActionSuccess" />

    <!-- 关闭弹窗 -->
    <CloseDialog v-model="closeVisible" :event="selectedEvent" @success="handleActionSuccess" />

    <!-- 备注弹窗 -->
    <NoteDialog v-model="noteVisible" :event="selectedEvent" @success="handleActionSuccess" />
  </div>
</template>

<script setup lang="ts">
  import { Search, Loading } from '@element-plus/icons-vue'
  import { ElMessageBox } from 'element-plus'
  import { EmeEventStatus, AlarmLevel, TimelineType } from '@/enums/formEnum'
  import { eventList, eventDetail, updateStatus } from '@/api/emergency'
  import EventInfo from './modules/event-info.vue'
  import EventTimeline from './modules/event-timeline.vue'
  import ConfirmDialog from './modules/confirm-dialog.vue'
  import CloseDialog from './modules/close-dialog.vue'
  import NoteDialog from './modules/note-dialog.vue'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'EventCenter' })

  const router = useRouter()
  const loading = ref(false)
  const searchKeyword = ref('')
  const eventListData = ref<Api.Emergency.EventListItem[]>([])
  const selectedEvent = ref<Api.Emergency.EventListItem | null>(null)
  const { info: userInfo } = useUserStore()
  // 弹窗状态
  const confirmVisible = ref(false)
  const closeVisible = ref(false)
  const noteVisible = ref(false)

  // 时间线组件引用
  const timelineRef = ref<{ refresh: () => void } | null>(null)

  // 过滤事件列表
  const filteredEvents = computed(() => {
    if (!searchKeyword.value) return eventListData.value
    const keyword = searchKeyword.value.toLowerCase()
    return eventListData.value.filter(
      (event) =>
        String(event.id).includes(keyword) ||
        event.eventTypeName.toLowerCase().includes(keyword) ||
        event.location.toLowerCase().includes(keyword)
    )
  })

  // 获取等级标签类型
  const getLevelType = (level: AlarmLevel) => {
    const map: Record<AlarmLevel, 'info' | 'warning' | 'danger'> = {
      [AlarmLevel.LOW]: 'info',
      [AlarmLevel.MEDIUM]: 'warning',
      [AlarmLevel.HIGH]: 'danger',
      [AlarmLevel.EMERGENCY]: 'danger'
    }
    return map[level] || 'info'
  }

  // 获取状态标签类型
  const getStatusType = (status: EmeEventStatus) => {
    const map: Record<EmeEventStatus, 'info' | 'warning' | 'success' | 'primary' | 'danger'> = {
      [EmeEventStatus.START]: 'success',
      [EmeEventStatus.CONFIRMED]: 'primary',
      [EmeEventStatus.DISPATCHING]: 'warning',
      [EmeEventStatus.PROCESSING]: 'success',
      [EmeEventStatus.CLOSED]: 'info'
    }
    return map[status] || 'info'
  }

  // 格式化时间
  const formatTime = (time: string) => {
    if (!time) return '-'
    return time.replace('T', ' ')
  }

  // 加载事件列表
  const loadEventList = async () => {
    loading.value = true
    try {
      const res = await eventList()
      eventListData.value = res
      // 默认选中第一个
      if (res.length > 0 && !selectedEvent.value) {
        selectedEvent.value = res[0]
      }
    } catch (error) {
      console.error('加载事件列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 选择事件
  const handleSelectEvent = async (event: Api.Emergency.EventListItem) => {
    selectedEvent.value = event
  }

  // 刷新选中事件详情
  const refreshSelectedEvent = async () => {
    if (!selectedEvent.value) return
    try {
      const res = await eventDetail(selectedEvent.value.id)
      selectedEvent.value = res
    } catch (error) {
      console.error('刷新事件详情失败:', error)
    }
  }

  // 操作成功回调
  const handleActionSuccess = () => {
    refreshSelectedEvent()
    loadEventList()
    // 刷新时间线
    timelineRef.value?.refresh()
  }

  // 确认事件
  const handleConfirm = () => {
    confirmVisible.value = true
  }

  // 资源绑定
  const handleResourceBind = () => {
    if (!selectedEvent.value) return
    router.push({
      path: '/emergency/resource-bind',
      query: { eventId: selectedEvent.value.id }
    })
  }

  // 到场签到
  const handleArrive = async () => {
    if (!selectedEvent.value) return
    try {
      await ElMessageBox.confirm('确认到达现场？', '到场签到', {
        type: 'warning'
      })
      await updateStatus({
        eventId: selectedEvent.value.id,
        actionType: TimelineType.SIGN
      })
      ElMessage.success('签到成功')
      handleActionSuccess()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('签到失败:', error)
      }
    }
  }

  // 关闭事件
  const handleClose = () => {
    closeVisible.value = true
  }

  // 添加备注
  const handleAddNote = () => {
    noteVisible.value = true
  }

  // 上传资料
  const handleUpload = () => {
    ElMessage.info('上传资料功能开发中')
  }

  onMounted(() => {
    loadEventList()
  })

  // 页面激活时刷新数据（从资源绑定页面返回时）
  onActivated(() => {
    loadEventList()
    // 如果有选中事件，刷新详情和时间线
    if (selectedEvent.value) {
      refreshSelectedEvent()
      timelineRef.value?.refresh()
    }
  })
</script>

<style lang="scss" scoped>
  .event-center {
    display: flex;
    gap: 16px;
    height: var(--art-full-height);
    padding: 16px;
    background: var(--el-bg-color-page);
  }

  .event-list-panel {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: 320px;
    background: var(--el-bg-color);
    border-radius: 8px;

    .panel-header {
      padding: 16px;
      border-bottom: 1px solid var(--el-border-color-light);

      .title {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 600;
      }

      .search-input {
        width: 100%;
      }
    }

    .event-list {
      flex: 1;
      padding: 12px;
      overflow: auto;
    }

    .loading-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
    }

    .event-item {
      padding: 12px;
      margin-bottom: 12px;
      cursor: pointer;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      transition: all 0.2s;

      &:last-child {
        margin-bottom: 0;
      }

      &:hover {
        border-color: var(--el-color-primary-light-5);
        box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
      }

      &.active {
        background: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary);
      }

      .event-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;

        .event-type {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }

      .event-location {
        margin-bottom: 8px;
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }

      .event-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .event-time {
          font-size: 12px;
          color: var(--el-text-color-placeholder);
        }
      }
    }
  }

  .event-detail-panel {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    background: var(--el-bg-color);
    border-radius: 8px;

    .detail-header {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--el-border-color-light);

      .header-left {
        display: flex;
        gap: 12px;
        align-items: center;

        .event-name {
          font-size: 18px;
          font-weight: 600;
        }
      }

      .header-right {
        .create-time {
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .detail-content {
      flex: 1;
      overflow: auto;

      .info-section {
        padding: 16px 20px;
        border-bottom: 1px solid var(--el-border-color-light);

        &:last-child {
          border-bottom: none;
        }

        .section-title {
          margin-bottom: 12px;
          font-size: 15px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
    }

    .action-bar {
      display: flex;
      flex-shrink: 0;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px 20px;
      background: var(--el-bg-color);
      border-top: 1px solid var(--el-border-color-light);
    }
  }
</style>
