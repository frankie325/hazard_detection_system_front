<!-- 区域管理页面 -->
<template>
  <div class="area-page art-full-height">
    <AreaSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></AreaSearch>

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增区域</ElButton>
            <ElButton @click="handleBatchDelete" v-ripple>删除</ElButton>
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
  import AreaSearch from './modules/area-search.vue'
  import AreaDialog from './modules/area-dialog.vue'
  import { ElMessageBox } from 'element-plus'
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
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: async (params) => {
        await new Promise((resolve) => setTimeout(resolve, 300))

        const mockData: Api.SystemManage.AreaListItem[] = [
          {
            id: 1,
            areaName: '京哈高速管理处A',
            deptName: '京哈高速管理处',
            deptId: 1,
            length: 18,
            laneCount: 15,
            deviceCount: 4,
            createTime: '2024-01-01 10:00:00',
            updateTime: '2024-03-15 14:30:00'
          },
          {
            id: 2,
            areaName: '京沪高速管理处B',
            deptName: '京沪高速管理处',
            deptId: 2,
            length: 9,
            laneCount: 30,
            deviceCount: 12,
            createTime: '2024-01-02 09:15:00',
            updateTime: '2024-03-14 16:45:00'
          },
          {
            id: 3,
            areaName: '京港澳高速管理处C',
            deptName: '京港澳高速管理处',
            deptId: 3,
            length: 20,
            laneCount: 12,
            deviceCount: 6,
            createTime: '2024-01-03 14:20:00',
            updateTime: '2024-03-13 10:20:00'
          },
          {
            id: 4,
            areaName: '大广高速管理处D',
            deptName: '大广高速管理处',
            deptId: 4,
            length: 6,
            laneCount: 15,
            deviceCount: 26,
            createTime: '2024-01-04 11:30:00',
            updateTime: '2024-03-12 15:50:00'
          },
          {
            id: 5,
            areaName: '京哈高速管理处A-K125-K140',
            deptName: '京哈高速管理处',
            deptId: 1,
            length: 15,
            laneCount: 4,
            deviceCount: 12,
            createTime: '2024-01-05 16:40:00',
            updateTime: '2024-03-11 09:35:00'
          },
          {
            id: 6,
            areaName: '京沪高速管理处B-K200-K212',
            deptName: '京沪高速管理处',
            deptId: 2,
            length: 12,
            laneCount: 4,
            deviceCount: 15,
            createTime: '2024-01-06 13:50:00',
            updateTime: '2024-03-10 17:25:00'
          },
          {
            id: 7,
            areaName: '京港澳高速管理处C-K50-K62',
            deptName: '京港澳高速管理处',
            deptId: 3,
            length: 20,
            laneCount: 4,
            deviceCount: 12,
            createTime: '2024-01-07 10:15:00',
            updateTime: '2024-03-09 14:10:00'
          },
          {
            id: 8,
            areaName: '大广高速管理处D-K305-K320',
            deptName: '大广高速管理处',
            deptId: 4,
            length: 6,
            laneCount: 26,
            deviceCount: 15,
            createTime: '2024-01-08 15:25:00',
            updateTime: '2024-03-08 11:45:00'
          }
        ]

        let filteredData = mockData
        if (params.areaName) {
          filteredData = filteredData.filter((item) => item.areaName.includes(params.areaName))
        }
        if (params.deptName) {
          filteredData = filteredData.filter((item) => item.deptName.includes(params.deptName))
        }

        const total = filteredData.length
        const start = (params.current - 1) * params.size
        const end = start + params.size
        const records = filteredData.slice(start, end)

        return {
          records,
          current: params.current,
          size: params.size,
          total
        }
      },
      apiParams: {
        current: 1,
        size: 20
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
    getData()
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
    })
      .then(() => {
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.info('已取消删除')
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
    })
      .then(() => {
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }

  /**
   * 弹窗提交
   */
  const handleDialogSubmit = () => {
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
