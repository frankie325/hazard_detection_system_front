<!-- 区域管理页面 -->
<template>
  <div class="area-page art-full-height">
    <AreaSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></AreaSearch>

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增区域</ElButton>
            <ElButton
              type="danger"
              :disabled="!selectedRows.length"
              @click="handleBatchDelete"
              v-ripple
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
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>

    <AreaDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :area-data="currentAreaData"
      @submit="handleDialogSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    areaList,
    areaDeleteById,
    areaBatchDelete,
    areaAdd,
    areaUpdate
  } from '@/api/system-manage'
  import AreaSearch from './modules/area-search.vue'
  import AreaDialog from './modules/area-dialog.vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'AreaManage' })

  type AreaListItem = Api.SystemManage.AreaListItem

  // 搜索表单
  const searchForm = ref({
    areaName: undefined,
    deptName: undefined
  })

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentAreaData = ref<Partial<AreaListItem>>({})

  // 选中行
  const selectedRows = ref<AreaListItem[]>([])

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
      apiFn: areaList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'areaName',
          label: '区域名称',
          minWidth: 150
        },
        {
          prop: 'deptName',
          label: '负责部门',
          minWidth: 150
        },
        {
          prop: 'length',
          label: '长度(KM)',
          width: 100
        },
        {
          prop: 'laneCount',
          label: '车道数',
          width: 80
        },
        {
          prop: 'deviceCount',
          label: '设备数',
          width: 80
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 180,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteArea(row)
              })
            ])
        }
      ]
    }
  })

  /**
   * 搜索处理
   */
  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    refreshData()
  }

  /**
   * 显示弹窗
   */
  const showDialog = (type: DialogType, data?: AreaListItem): void => {
    dialogType.value = type
    currentAreaData.value = data || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除区域
   */
  const deleteArea = (data: AreaListItem): void => {
    ElMessageBox.confirm(`确定删除区域"${data.areaName}"吗？删除后不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await areaDeleteById(data.id)
      ElMessage.success('删除成功')
      refreshData()
    })
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择需要删除的数据！')
      return
    }
    ElMessageBox.confirm(`确定删除选中的${selectedRows.value.length}条数据吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        const ids = selectedRows.value.map((item) => item.id)
        await areaBatchDelete(ids)
        ElMessage.success(`已成功删除 ${selectedRows.value.length} 个区域`)
        selectedRows.value = []
        refreshData()
        refreshData()
      } catch (error) {
        console.error('批量删除失败:', error)
        ElMessage.error('批量删除失败，请重试')
      }
    })
  }

  /**
   * 弹窗提交
   */
  const handleDialogSubmit = async (formData: Api.SystemManage.AreaForm) => {
    if (dialogType.value === 'add') {
      await areaAdd(formData)
      ElMessage.success('新增成功')
    } else {
      await areaUpdate(formData)
      ElMessage.success('编辑成功')
    }
    dialogVisible.value = false
    currentAreaData.value = {}
    refreshData()
  }

  /**
   * 处理行选择
   */
  const handleSelectionChange = (selection: AreaListItem[]): void => {
    selectedRows.value = selection
  }
</script>
