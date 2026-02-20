<template>
  <div class="art-full-height">
    <EventsSearch v-model="searchForm" @search="handleSearch" @reset="handleReset"></EventsSearch>

    <ElCard class="art-table-card art-full-height" shadow="never">
      <ArtTable
        :show-table-header="false"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        height="100%"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    <!-- 事件详情弹窗 -->
    <el-dialog v-model="detailVisible" title="事件详情" width="500px" :before-close="closeDetail">
      <el-descriptions v-if="selectedEvent" :column="1" border>
        <el-descriptions-item label="事件名称">{{ selectedEvent.eventName }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ selectedEvent.eventTypeName }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ selectedEvent.location }}</el-descriptions-item>
        <el-descriptions-item label="设备/摄像头">{{
          selectedEvent.deviceName
        }}</el-descriptions-item>
        <el-descriptions-item label="置信度"
          >{{ selectedEvent.confidence * 100 }}%</el-descriptions-item
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
  import { ref, h } from 'vue'
  import { ElProgress, ElTag } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import { eventStreamList } from '@/api/detect'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import EventsSearch from './modules/events-search.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'

  defineOptions({ name: 'Events' })

  // 搜索表单
  const searchForm = ref({
    deviceName: undefined,
    areaName: undefined,
    eventName: undefined,
    eventType: undefined,
    startTime: undefined,
    endTime: undefined
  })

  const {
    data,
    loading,
    pagination,
    searchParams,
    refreshData,
    handleSizeChange,
    handleCurrentChange,
    columns
  } = useTable({
    core: {
      apiFn: eventStreamList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { prop: 'eventName', label: '事件名称', width: 150 },
        {
          prop: 'eventTypeName',
          label: '类型',
          width: 100,
          formatter: (row: Api.Detect.EventStreamListItem) => {
            return h(ElTag, { type: 'info' }, row.eventTypeName)
          }
        },
        { prop: 'deviceName', label: '设备', width: 120 },
        { prop: 'location', label: '地点', width: 140 },
        { prop: 'areaName', label: '区域', width: 100 },
        {
          prop: 'confidence',
          label: '置信度',
          width: 150,
          formatter: (row: Api.Detect.EventStreamListItem) => {
            const percentage = Math.round(row.confidence * 100)
            const color =
              percentage >= 90
                ? '#F56C6C'
                : percentage >= 80
                  ? '#E6A23C'
                  : percentage >= 70
                    ? '#409EFF'
                    : '#67C23A'
            return h(ElProgress, {
              percentage,
              color,
              strokeWidth: 8,
              textInside: false
            })
          }
        },
        { prop: 'createTime', label: '时间', width: 170 },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: Api.Detect.EventStreamListItem) =>
            h('div', [h(ArtButtonTable, { type: 'view', onClick: () => handleViewDetail(row) })])
        }
      ]
    }
  })

  // 详情弹窗
  const detailVisible = ref(false)
  const selectedEvent = ref<Api.Detect.EventStreamListItem | null>(null)

  /**
   * 搜索处理
   */
  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    refreshData()
  }

  const handleReset = () => {
    searchForm.value = {
      deviceName: undefined,
      areaName: undefined,
      eventName: undefined,
      eventType: undefined,
      startTime: undefined,
      endTime: undefined
    }
    refreshData()
  }

  // 查看详情
  const handleViewDetail = (row: Api.Detect.EventStreamListItem) => {
    selectedEvent.value = row
    detailVisible.value = true
  }

  // 关闭详情
  const closeDetail = () => {
    detailVisible.value = false
    selectedEvent.value = null
  }
</script>
