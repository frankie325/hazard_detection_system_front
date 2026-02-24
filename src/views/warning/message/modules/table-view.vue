<!-- 表格视图 -->
<template>
  <div class="table-view">
    <ArtTableHeader v-model:columns="columnChecks" :loading="loading" />
    <ArtTable
      :loading="loading"
      :data="data"
      :columns="columns"
      :pagination="pagination"
      @pagination:size-change="handleSizeChange"
      @pagination:current-change="handleCurrentChange"
    >
      <template #operation="{ row }">
        <ArtButtonTable
          v-if="row.alarmStatus === AlarmStatus.OPEN"
          icon="ri:checkbox-circle-line"
          icon-class="bg-primary/12 text-primary"
          @click="emit('confirm', row)"
        />
        <ArtButtonTable
          v-if="row.alarmStatus !== AlarmStatus.CLOSED"
          icon="ri:close-circle-line"
          icon-class="bg-error/12 text-error"
          @click="emit('close', row)"
        />
      </template>
    </ArtTable>
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElTag } from 'element-plus'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { AlarmLevel, AlarmStatus, EventStreamTypeEnum } from '@/enums/formEnum'
  import type { ColumnOption } from '@/types'

  defineOptions({ name: 'TableView' })

  interface Props {
    loading: boolean
    data: Api.Warning.AlarmMessageListItem[]
    pagination: { current: number; size: number; total: number }
    columnChecks: any[]
  }

  interface Emits {
    (e: 'size-change', size: number): void
    (e: 'current-change', current: number): void
    (e: 'update:columnChecks', value: any[]): void
    (e: 'confirm', row: Api.Warning.AlarmMessageListItem): void
    (e: 'close', row: Api.Warning.AlarmMessageListItem): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 双向绑定 columnChecks
  const columnChecks = computed({
    get: () => props.columnChecks,
    set: (val) => emit('update:columnChecks', val)
  })

  const handleSizeChange = (size: number) => {
    emit('size-change', size)
  }

  const handleCurrentChange = (current: number) => {
    emit('current-change', current)
  }

  const columns: ColumnOption[] = [
    { prop: 'alarmName', label: '告警名称', minWidth: 200 },
    {
      prop: 'alarmLevel',
      label: '告警等级',
      width: 100,
      formatter: (row: Api.Warning.AlarmMessageListItem) => {
        const levelMap: Record<
          AlarmLevel,
          { label: string; type: 'success' | 'info' | 'warning' | 'danger' }
        > = {
          [AlarmLevel.LOW]: { label: '低级', type: 'info' },
          [AlarmLevel.MEDIUM]: { label: '中级', type: 'warning' },
          [AlarmLevel.HIGH]: { label: '高级', type: 'danger' },
          [AlarmLevel.EMERGENCY]: { label: '紧急', type: 'danger' }
        }
        const level = levelMap[row.alarmLevel as AlarmLevel] || {
          label: row.alarmLevel,
          type: 'info'
        }
        return h(ElTag, { type: level.type, size: 'small' }, () => level.label)
      }
    },
    {
      prop: 'eventType',
      label: '告警分类',
      width: 120,
      formatter: (row: Api.Warning.AlarmMessageListItem) => {
        const eventTypeMap: Record<EventStreamTypeEnum, string> = {
          [EventStreamTypeEnum.CAST]: '抛洒物',
          [EventStreamTypeEnum.FIRE]: '火灾',
          [EventStreamTypeEnum.LANDSLIDE]: '塌方',
          [EventStreamTypeEnum.TRAFFIC_ACCIDENT]: '交通事故'
        }
        const typeName = eventTypeMap[row.eventType as EventStreamTypeEnum] || row.eventType
        return h(ElTag, { size: 'small' }, () => typeName)
      }
    },
    { prop: 'deviceName', label: '发生设备', width: 120 },
    { prop: 'location', label: '地点', width: 150 },
    { prop: 'ruleName', label: '规则', width: 150 },
    { prop: 'createTime', label: '发生时间', width: 170 },
    {
      prop: 'status',
      label: '告警状态',
      width: 100,
      formatter: (row: Api.Warning.AlarmMessageListItem) => {
        const statusMap: Record<AlarmStatus, { label: string; type: any }> = {
          [AlarmStatus.OPEN]: { label: '开启', type: 'success' },
          [AlarmStatus.PROCESSING]: { label: '处理中', type: 'warning' },
          [AlarmStatus.CLOSED]: { label: '已关闭', type: 'info' }
        }
        const status = statusMap[row.alarmStatus as AlarmStatus] || {
          label: row.alarmStatus,
          type: 'info'
        }
        return h(ElTag, { type: status.type, size: 'small' }, () => status.label)
      }
    },
    { prop: 'closeTime', label: '关闭时间', width: 170 },
    { prop: 'confirmer', label: '确认人', width: 100 },
    { prop: 'operation', label: '操作', width: 120, useSlot: true, fixed: 'right' }
  ]
</script>

<style lang="scss" scoped>
  .table-view {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>
