<template>
  <div class="art-full-height">
    <MessageSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></MessageSearch>

    <!-- 视图切换按钮 -->
    <div class="view-switch-bar art-card-xs">
      <ElRadioGroup v-model="viewMode" size="default">
        <ElRadioButton value="table">
          <div class="flex items-center gap-1">
            <ElIcon><Grid /></ElIcon>
            表格
          </div>
        </ElRadioButton>
        <ElRadioButton value="card">
          <div class="flex items-center gap-1">
            <ElIcon><Menu /></ElIcon>
            卡片
          </div>
        </ElRadioButton>
        <ElRadioButton value="timeline">
          <div class="flex items-center gap-1">
            <ElIcon><Clock /></ElIcon>
            时间轴
          </div>
        </ElRadioButton>
      </ElRadioGroup>
      <ElButton v-ripple :loading="loading" @click="refreshData">刷新</ElButton>
    </div>

    <ElCard class="art-table-card art-full-height" shadow="never">
      <!-- 表格视图 -->
      <TableView
        v-if="viewMode === 'table'"
        :loading="loading"
        :data="data"
        :pagination="pagination"
        :column-checks="columnChecks"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @update:column-checks="columnChecks = $event"
        @confirm="handleConfirm"
        @close="handleClose"
      />

      <!-- 卡片视图 -->
      <CardView
        v-if="viewMode === 'card'"
        :loading="loading"
        :data="data"
        :pagination="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @confirm="handleConfirm"
        @close="handleClose"
      />

      <!-- 时间轴视图 -->
      <TimelineView
        v-if="viewMode === 'timeline'"
        :loading="loading"
        :data="data"
        :pagination="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @confirm="handleConfirm"
        @close="handleClose"
      />
    </ElCard>

    <!-- 确认告警弹窗 -->
    <ConfirmDialog v-model="confirmVisible" :alarm-data="currentAlarm" @success="refreshData" />

    <!-- 关闭告警弹窗 -->
    <CloseDialog v-model="closeVisible" :alarm-data="currentAlarm" @success="refreshData" />
  </div>
</template>

<script setup lang="ts">
  import { Grid, Menu, Clock } from '@element-plus/icons-vue'
  import { useTable } from '@/hooks/core/useTable'
  import { alarmMessageList } from '@/api/warning'
  import MessageSearch from './modules/message-search.vue'
  import TableView from './modules/table-view.vue'
  import CardView from './modules/card-view.vue'
  import TimelineView from './modules/timeline-view.vue'
  import ConfirmDialog from './modules/confirm-dialog.vue'
  import CloseDialog from './modules/close-dialog.vue'

  defineOptions({ name: 'WarningMessage' })

  // 视图模式
  const viewMode = ref<'table' | 'card' | 'timeline'>('table')

  // 搜索表单
  const searchForm = ref({
    alarmName: undefined,
    alarmLevel: undefined,
    eventType: undefined,
    status: undefined,
    startTime: undefined,
    endTime: undefined
  })

  // 表格配置
  const {
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: alarmMessageList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { prop: 'alarmName', label: '告警名称', minWidth: 200 },
        { prop: 'alarmLevel', label: '告警等级', width: 100 },
        { prop: 'eventType', label: '告警分类', width: 120 },
        { prop: 'deviceName', label: '发生设备', width: 120 },
        { prop: 'location', label: '地点', width: 150 },
        { prop: 'ruleName', label: '规则', width: 150 },
        { prop: 'createTime', label: '发生时间', width: 170 },
        { prop: 'status', label: '告警状态', width: 100 },
        { prop: 'closeTime', label: '关闭时间', width: 170 },
        { prop: 'confirmer', label: '确认人', width: 100 }
      ]
    }
  })

  // 弹窗相关
  const confirmVisible = ref(false)
  const closeVisible = ref(false)
  const currentAlarm = ref<Api.Warning.AlarmMessageListItem | null>(null)

  /**
   * 确认告警
   */
  const handleConfirm = (row: Api.Warning.AlarmMessageListItem) => {
    currentAlarm.value = row
    confirmVisible.value = true
  }

  /**
   * 关闭告警
   */
  const handleClose = (row: Api.Warning.AlarmMessageListItem) => {
    currentAlarm.value = row
    closeVisible.value = true
  }

  /**
   * 搜索处理
   */
  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    refreshData()
  }
</script>

<style lang="scss" scoped>
  .view-switch-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 8px 16px;
  }
</style>
