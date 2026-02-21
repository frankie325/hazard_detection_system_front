<template>
  <div class="art-full-height">
    <RuleSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></RuleSearch>

    <ElCard class="art-table-card art-full-height" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增告警规则</ElButton>
            <ElButton
              @click="handleBatchDelete"
              :disabled="!selectedRows.length"
              v-ripple
              type="danger"
              >删除</ElButton
            >
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
        @selection-change="handleSelectionChange"
      >
      </ArtTable>
    </ElCard>

    <!-- 编辑弹窗 -->
    <RuleEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :rule-data="currentRuleData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, h } from 'vue'
  import { ElMessageBox, ElMessage, ElTag } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import { alarmRuleList, alarmRuleBatchDelete, alarmRuleDeleteById } from '@/api/warning'
  import { AlarmLevel } from '@/enums/formEnum'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import RuleSearch from './modules/rule-search.vue'
  import RuleEditDialog from './modules/rule-edit-dialog.vue'

  defineOptions({ name: 'WarningRule' })

  // 搜索表单
  const searchForm = ref({
    ruleName: undefined,
    eventType: undefined,
    alarmLevel: undefined,
    isEnabled: undefined
  })

  // 表格配置
  const {
    columns,
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
      apiFn: alarmRuleList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection', width: 50 },
        { prop: 'id', label: '规则ID', width: 100 },
        { prop: 'ruleName', label: '规则名称', minWidth: 200 },
        {
          prop: 'eventType',
          label: '危害类型',
          width: 120,
          formatter: (row: Api.Warning.AlarmRuleListItem) => {
            const eventTypeMap: Record<string, string> = {
              CAST: '抛洒物',
              FIRE: '火灾',
              LANDSLIDE: '塌方',
              TRAFFIC_ACCIDENT: '交通事故'
            }
            const typeName = eventTypeMap[row.eventType] || row.eventType
            return h(ElTag, { size: 'small' }, () => typeName)
          }
        },
        {
          prop: 'alarmLevel',
          label: '告警等级',
          width: 100,
          formatter: (row: Api.Warning.AlarmRuleListItem) => {
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
          prop: 'matchCondition',
          label: '匹配条件',
          width: 300,
          formatter: (row: Api.Warning.AlarmRuleListItem) => {
            return JSON.stringify(row.matchCondition)
          }
        },
        {
          prop: 'isEnabled',
          label: '是否启用',
          width: 100,
          formatter: (row: Api.Warning.AlarmRuleListItem) => {
            const enabled = row.isEnabled === 1
            return h(ElTag, { type: enabled ? 'success' : 'info', size: 'small' }, () =>
              enabled ? '启用' : '禁用'
            )
          }
        },
        { prop: 'createTime', label: '创建时间', width: 170 },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: Api.Warning.AlarmRuleListItem) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => handleDelete(row)
              })
            ])
        }
      ]
    }
  })

  const selectedRows = ref<Api.Warning.AlarmRuleListItem[]>([])

  // 编辑弹窗
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentRuleData = ref<Api.Warning.AlarmRuleListItem | null>(null)

  /**
   * 搜索处理
   */
  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    refreshData()
  }

  /**
   * 显示编辑弹窗
   */
  const showDialog = (type: 'add' | 'edit', data?: Api.Warning.AlarmRuleListItem) => {
    dialogType.value = type
    currentRuleData.value = data || null
    dialogVisible.value = true
  }

  /**
   * 删除单条数据
   */
  const handleDelete = async (row: Api.Warning.AlarmRuleListItem) => {
    try {
      await ElMessageBox.confirm('确定要删除该告警规则吗？删除后不可恢复！', '确认删除', {
        type: 'warning'
      })
      await alarmRuleDeleteById(row.id)
      ElMessage.success('删除成功')
      refreshData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
      }
    }
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = async () => {
    if (!selectedRows.value.length) {
      ElMessage.warning('请选择需要删除的数据！')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 条数据吗？删除后不可恢复！`,
        '确认删除',
        { type: 'warning' }
      )
      const ids = selectedRows.value.map((row) => row.id)
      await alarmRuleBatchDelete(ids)
      ElMessage.success('删除成功')
      selectedRows.value = []
      refreshData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量删除失败:', error)
      }
    }
  }

  /**
   * 表格选择变化
   */
  const handleSelectionChange = (rows: Api.Warning.AlarmRuleListItem[]) => {
    selectedRows.value = rows
  }
</script>
