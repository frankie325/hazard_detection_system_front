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
          :data="areaTreeData"
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
  import DeviceSearch from './modules/device-search.vue'
  import DeviceDialog from './modules/device-dialog.vue'
  import { ElMessageBox, ElTag, ElTree } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'DeviceManage' })

  type DeviceListItem = Api.SystemManage.DeviceListItem

  const searchArea = ref('')

  const selectedAreaId = ref<number>()
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
  const areaTreeData = ref([
    {
      id: 1,
      areaName: 'G1 京哈高速',
      deviceCount: 12,
      children: [
        {
          id: 11,
          areaName: '隧道A',
          deviceCount: 2,
          children: [
            { id: 111, areaName: '隧道A-入口', deviceCount: 1 },
            { id: 112, areaName: '隧道A-出口', deviceCount: 1 }
          ]
        },
        {
          id: 12,
          areaName: '隧道B',
          deviceCount: 1,
          children: [{ id: 121, areaName: '隧道B-中部', deviceCount: 1 }]
        },
        {
          id: 13,
          areaName: '桥梁D',
          deviceCount: 1,
          children: [{ id: 131, areaName: '桥梁D-南侧', deviceCount: 1 }]
        },
        {
          id: 14,
          areaName: '路段C',
          deviceCount: 1,
          children: [{ id: 141, areaName: '路段C-中段', deviceCount: 1 }]
        },
        {
          id: 15,
          areaName: '路段E',
          deviceCount: 1,
          children: [{ id: 151, areaName: '路段E-匝道', deviceCount: 1 }]
        },
        {
          id: 16,
          areaName: '路段F',
          deviceCount: 1,
          children: [{ id: 161, areaName: '路段F-上行', deviceCount: 1 }]
        }
      ]
    },
    {
      id: 2,
      areaName: 'G4 京港澳高速',
      deviceCount: 8,
      children: [
        {
          id: 21,
          areaName: '隧道C',
          deviceCount: 2,
          children: [
            { id: 211, areaName: '隧道C-入口', deviceCount: 1 },
            { id: 212, areaName: '隧道C-中段', deviceCount: 1 }
          ]
        }
      ]
    }
  ])

  const searchForm = ref({
    deviceName: undefined,
    deviceCode: undefined,
    deviceType: undefined
  })

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

        const mockData: Api.SystemManage.DeviceListItem[] = [
          {
            id: 1,
            deviceName: '隧道A入口摄像头',
            deviceCode: 'CAM-A-01',
            deviceType: 'camera',
            deviceModel: 'HIKVISION DS-2CD3T45',
            installLocation: '隧道A-入口',
            ipAddress: '192.168.1.10',
            status: 'online',
            areaId: 11,
            areaName: '隧道A',
            createTime: '2024-01-01 10:00:00',
            updateTime: '2024-03-15 14:30:00'
          },
          {
            id: 2,
            deviceName: '隧道A火焰传感器4',
            deviceCode: 'FIRE-A-04',
            deviceType: 'sensor',
            deviceModel: 'Honeywell FS-200',
            installLocation: '隧道A-出口',
            ipAddress: '192.168.1.11',
            status: 'online',
            areaId: 11,
            areaName: '隧道A',
            createTime: '2024-01-02 09:15:00',
            updateTime: '2024-03-14 16:45:00'
          },
          {
            id: 3,
            deviceName: '隧道B火焰传感器2',
            deviceCode: 'FIRE-B-02',
            deviceType: 'sensor',
            deviceModel: 'Honeywell FS-200',
            installLocation: '隧道B-中部',
            ipAddress: '192.168.1.12',
            status: 'online',
            areaId: 12,
            areaName: '隧道B',
            createTime: '2024-01-03 14:20:00',
            updateTime: '2024-03-13 10:20:00'
          },
          {
            id: 4,
            deviceName: '桥梁D南侧摄像头9',
            deviceCode: 'CAM-D-09',
            deviceType: 'camera',
            deviceModel: 'HIKVISION DS-2CD3T45',
            installLocation: '桥梁D-南侧',
            ipAddress: '192.168.1.13',
            status: 'offline',
            areaId: 13,
            areaName: '桥梁D',
            createTime: '2024-01-04 11:30:00',
            updateTime: '2024-03-12 15:50:00'
          },
          {
            id: 5,
            deviceName: '路段C应力传感器5',
            deviceCode: 'STRESS-C-05',
            deviceType: 'sensor',
            deviceModel: 'KYOWA KFG-5',
            installLocation: '路段C-中段',
            ipAddress: '192.168.1.14',
            status: 'maintenance',
            areaId: 14,
            areaName: '路段C',
            createTime: '2024-01-05 16:40:00',
            updateTime: '2024-03-11 09:35:00'
          },
          {
            id: 6,
            deviceName: '路段E地质传感器3',
            deviceCode: 'GEO-E-03',
            deviceType: 'sensor',
            deviceModel: 'Trimble R8',
            installLocation: '路段E-匝道',
            ipAddress: '192.168.1.15',
            status: 'online',
            areaId: 15,
            areaName: '路段E',
            createTime: '2024-01-06 13:50:00',
            updateTime: '2024-03-10 17:25:00'
          },
          {
            id: 7,
            deviceName: '路段F上行摄像头11',
            deviceCode: 'CAM-F-11',
            deviceType: 'camera',
            deviceModel: 'HIKVISION DS-2CD3T45',
            installLocation: '路段F-上行',
            ipAddress: '192.168.1.16',
            status: 'online',
            areaId: 16,
            areaName: '路段F',
            createTime: '2024-01-07 10:15:00',
            updateTime: '2024-03-09 14:10:00'
          },
          {
            id: 8,
            deviceName: '隧道A-1断面摄像头',
            deviceCode: 'CAM-A1-01',
            deviceType: 'camera',
            deviceModel: 'HIKVISION DS-2CD3T45',
            installLocation: 'A-1断面左侧护栏',
            ipAddress: '192.168.1.17',
            status: 'online',
            areaId: 11,
            areaName: '隧道A',
            createTime: '2024-01-08 15:25:00',
            updateTime: '2024-03-08 11:45:00'
          },
          {
            id: 9,
            deviceName: '路段B-1断面摄像头',
            deviceCode: 'CAM-B1-01',
            deviceType: 'camera',
            deviceModel: 'HIKVISION DS-2CD3T45',
            installLocation: 'B-1断面',
            ipAddress: '192.168.1.18',
            status: 'online',
            areaId: 1,
            areaName: 'G1 京哈高速',
            createTime: '2024-01-09 09:40:00',
            updateTime: '2024-03-07 16:20:00'
          },
          {
            id: 10,
            deviceName: '隧道A-2断面摄像头',
            deviceCode: 'CAM-A2-01',
            deviceType: 'camera',
            deviceModel: 'HIKVISION DS-2CD3T45',
            installLocation: 'A-2断面',
            ipAddress: '192.168.1.19',
            status: 'offline',
            areaId: 11,
            areaName: '隧道A',
            createTime: '2024-01-10 14:55:00',
            updateTime: '2024-03-06 10:30:00'
          }
        ]

        let filteredData = mockData

        // 区域过滤
        if (selectedAreaId.value) {
          filteredData = filteredData.filter((item) => item.areaId === selectedAreaId.value)
        }

        // 搜索过滤
        if (params.deviceName) {
          filteredData = filteredData.filter((item) => item.deviceName.includes(params.deviceName))
        }
        if (params.deviceCode) {
          filteredData = filteredData.filter((item) => item.deviceCode.includes(params.deviceCode))
        }
        if (params.deviceType) {
          filteredData = filteredData.filter((item) => item.deviceType === params.deviceType)
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
              camera: { text: '摄像头', type: 'primary' as const },
              sensor: { text: '传感器', type: 'success' as const }
            }
            const config = typeMap[row.deviceType] || { text: '未知', type: 'info' as const }
            return h(ElTag, { type: config.type }, () => config.text)
          }
        },
        {
          prop: 'deviceModel',
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
              online: { text: '在线', type: 'success' as const },
              offline: { text: '离线', type: 'info' as const },
              maintenance: { text: '维护', type: 'warning' as const }
            }
            const config = statusMap[row.status] || { text: '未知', type: 'info' as const }
            return h(ElTag, { type: config.type }, () => config.text)
          }
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
    refreshData()
  }

  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
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
    })
      .then(() => {
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.info('已取消删除')
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
    })
      .then(() => {
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }

  const handleDialogSubmit = () => {
    dialogVisible.value = false
    currentDeviceData.value = {}
    refreshData()
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
          padding: 0;
        }
      }
    }
  }
</style>
