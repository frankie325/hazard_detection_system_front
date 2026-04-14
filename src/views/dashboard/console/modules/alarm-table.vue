<template>
  <div class="art-card p-4 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>告警信息</h4>
        <p>最新告警列表</p>
      </div>
      <div>
        <el-button type="primary" @click="handleToAlarmMessage">查看</el-button>
      </div>
    </div>
    <ArtTable
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      @pagination:size-change="handleSizeChange"
      @pagination:current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, h, onMounted } from 'vue'
  import { alarmMessageList } from '@/api/warning'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import AlarmLevelDot from '@/components/AlarmLevelDot/index.vue'
  import EventTypeTag from '@/components/EventTypeTag/index.vue'
  import type { ColumnOption } from '@/types'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const tableData = ref<Api.Warning.AlarmMessageListItem[]>([])
  const loading = ref(false)

  const pagination = ref({
    current: 1,
    size: 10,
    total: 0
  })

  const columns: ColumnOption[] = [
    { prop: 'alarmName', label: '告警名称', minWidth: 120, showOverflowTooltip: true },
    {
      prop: 'alarmLevel',
      label: '告警等级',
      width: 100,
      align: 'center',
      formatter: (row: Api.Warning.AlarmMessageListItem) =>
        h(AlarmLevelDot, { level: row.alarmLevel })
    },
    {
      prop: 'eventType',
      label: '告警分类',
      width: 120,
      align: 'center',
      formatter: (row: Api.Warning.AlarmMessageListItem) => h(EventTypeTag, { type: row.eventType })
    },
    { prop: 'deviceName', label: '设备名称', minWidth: 100, showOverflowTooltip: true },
    { prop: 'createTime', label: '发生时间', width: 160, align: 'center' }
  ]

  const loadData = async () => {
    loading.value = true
    try {
      const res = await alarmMessageList({
        current: pagination.value.current,
        size: pagination.value.size
      })
      if (res) {
        tableData.value = res.list || []
        pagination.value.total = res.total || 0
      }
    } catch (e) {
      console.error('加载告警信息失败:', e)
    } finally {
      loading.value = false
    }
  }

  const handleSizeChange = (val: number) => {
    pagination.value.size = val
    pagination.value.current = 1
    loadData()
  }

  const handleCurrentChange = (val: number) => {
    pagination.value.current = val
    loadData()
  }

  const handleToAlarmMessage = () => {
    router.push('/warning/message')
  }

  onMounted(() => {
    loadData()
  })
</script>
