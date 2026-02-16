<!-- 设备管理页面 -->
<template>
  <div class="device-page art-full-height">
    <div class="device-layout">
      <!-- 左侧区域树 -->
      <div class="device-sidebar">
        <ElInput
          v-model="searchArea"
          placeholder="搜索区域..."
          clearable
          prefix-icon="Search"
          class="area-search"
        />
        <ElTree
          ref="areaTreeRef"
          :data="areaData"
          :props="treeProps"
          :filter-node-method="filterNode"
          node-key="id"
          :expand-on-click-node="false"
          :highlight-current="true"
          @node-click="handleAreaClick"
        >
          <template #default="{ data }">
            <span class="custom-tree-node">
              <span>{{ data.areaName }}</span>
              <span v-if="data.deviceCount" class="device-count">
                {{ data.deviceCount }}台设备
              </span>
            </span>
          </template>
        </ElTree>
      </div>

      <!-- 右侧设备列表 -->
      <div class="device-main">
        <DeviceSearch
          v-model="searchForm"
          @search="handleSearch"
          @reset="resetSearchParams"
        ></DeviceSearch>

        <ElCard class="art-table-card" shadow="never">
          <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
            <template #left>
              <ElSpace wrap>
                <ElButton @click="handleAddDevice" :disabled="!selectedAreaId" v-ripple>
                  添加设备
                </ElButton>
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
      </div>
    </div>

    <DeviceDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :device-data="currentDeviceData"
      :area-data="selectedAreaData"
      @submit="handleDialogSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { deviceList, deviceDeleteById, deviceBatchDelete, allAreaList } from '@/api/system-manage'
  import DeviceSearch from './modules/device-search.vue'
  import DeviceDialog from './modules/device-dialog.vue'
  import { ElMessageBox, ElTag, ElTree, ElMessage } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'DeviceManage' })

  type DeviceListItem = Api.SystemManage.DeviceListItem

  const searchArea = ref('')

  const selectedAreaId = ref<number | null>()
  const selectedAreaData = ref<Api.SystemManage.AreaListItem | null>(null)

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentDeviceData = ref<Partial<DeviceListItem>>({})

  const selectedRows = ref<DeviceListItem[]>([])
  const areaTreeRef = ref<InstanceType<typeof ElTree>>()

  const treeProps = {
    label: 'areaName',
    children: 'children'
  }

  // 区域树形数据
  const areaData = ref<Api.SystemManage.AreaListItem[]>([])

  // 加载区域树数据
  const loadAreaData = async () => {
    try {
      areaData.value = await allAreaList()
    } catch (error) {
      console.error('加载区域列表失败', error)
    }
  }

  onMounted(() => {
    loadAreaData()
  })

  const searchForm = ref<Api.SystemManage.DeviceSearchParams>({
    deviceName: undefined,
    deviceCode: undefined,
    deviceType: undefined,
    status: undefined
  })

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
      apiFn: deviceList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'deviceName',
          label: '设备名称',
          minWidth: 150
        },
        {
          prop: 'deviceCode',
          label: '设备编码',
          width: 120
        },
        {
          prop: 'deviceType',
          label: '类型',
          width: 100,
          formatter: (row) => {
            const typeMap = {
              CAMERA: { text: '摄像头', type: 'primary' as const },
              SENSOR: { text: '传感器', type: 'success' as const }
            }
            const config = typeMap[row.deviceType] || { text: '未知', type: 'info' as const }
            return h(ElTag, { type: config.type }, () => config.text)
          }
        },
        {
          prop: 'model',
          label: '型号',
          width: 180
        },
        {
          prop: 'areaName',
          label: '区域',
          width: 120
        },
        {
          prop: 'ipAddress',
          label: 'IP地址',
          width: 130
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) => {
            const statusMap = {
              ONLINE: { text: '在线', type: 'success' as const },
              OFFLINE: { text: '离线', type: 'info' as const },
              MAINTENANCE: { text: '维护', type: 'warning' as const }
            }
            const config = statusMap[row.status] || { text: '未知', type: 'info' as const }
            return h(ElTag, { type: config.type }, () => config.text)
          }
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
                onClick: () => deleteDevice(row)
              })
            ])
        }
      ]
    },
    hooks: {
      resetFormCallback() {
        selectedAreaId.value = null
        selectedAreaData.value = null
        // 取消树节点高亮
        areaTreeRef.value?.setCurrentKey()
      }
    }
  })

  watch(searchArea, (val) => {
    areaTreeRef.value?.filter(val)
  })

  const filterNode = (value: string, data: any) => {
    if (!value) return true
    return data.areaName.includes(value)
  }

  const handleAreaClick = (data: any) => {
    selectedAreaId.value = data.id
    selectedAreaData.value = data
    searchParams.areaId = data.id
    refreshData()
  }

  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    refreshData()
  }

  const handleAddDevice = () => {
    if (!selectedAreaId.value) {
      ElMessage.warning('请先选择左侧区域树节点')
      return
    }
    showDialog('add')
  }

  const showDialog = (type: DialogType, data?: DeviceListItem): void => {
    dialogType.value = type
    currentDeviceData.value = data || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const deleteDevice = (data: DeviceListItem): void => {
    ElMessageBox.confirm(`确定删除设备"${data.deviceName}"吗？删除后不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await deviceDeleteById(data.id)
      ElMessage.success('删除成功')
      refreshData()
      loadAreaData()
    })
  }

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
      const ids = selectedRows.value.map((item) => item.id)
      await deviceBatchDelete(ids)
      ElMessage.success('删除成功')
      selectedRows.value = []
      refreshData()
      loadAreaData()
    })
  }

  const handleDialogSubmit = () => {
    refreshData()
    loadAreaData()
  }

  const handleSelectionChange = (selection: DeviceListItem[]): void => {
    selectedRows.value = selection
  }
</script>

<style scoped lang="scss">
  .device-layout {
    display: flex;
    gap: 16px;
    height: 100%;

    .device-sidebar {
      display: flex;
      flex-direction: column;
      width: 280px;
      height: 100%;
      padding: 16px;
      background: #fff;
      border-radius: 8px;

      .area-search {
        margin-bottom: 16px;
      }

      :deep(.el-tree) {
        flex: 1;
        overflow: auto;
      }

      .custom-tree-node {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: space-between;
        padding-right: 8px;

        .device-count {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .device-main {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-width: 0;

      .art-table-card {
        display: flex;
        flex: 1;
        flex-direction: column;

        :deep(.el-card__body) {
          display: flex;
          flex: 1;
          flex-direction: column;
        }
      }
    }
  }
</style>
