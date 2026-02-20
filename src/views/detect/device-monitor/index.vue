<template>
  <div class="device-monitor-container">
    <!-- 左侧设备树 -->
    <div class="left-sidebar">
      <div class="sidebar-header">
        <el-input
          v-model="searchText"
          placeholder="搜索区域/设备"
          prefix-icon="Search"
          clearable
          size="default"
        />
      </div>
      <el-tree
        ref="deviceTreeRef"
        :data="deviceTreeData"
        :props="treeProps"
        :filter-node-method="filterNode"
        :highlight-current="true"
        :expand-on-click-node="false"
        node-key="id"
        default-expand-all
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <el-icon v-if="data.type === 'folder'"><Folder /></el-icon>
            <el-icon
              v-else-if="data.deviceType === 'camera' || data.deviceType === DeviceTypeEnum.CAMERA"
              ><VideoCamera
            /></el-icon>
            <el-icon v-else><Monitor /></el-icon>
            <span class="node-label">{{ node.label }}</span>
            <span v-if="data.type === 'folder' && data.children" class="device-count">
              {{ data.children?.length }}台设备
            </span>
          </span>
        </template>
      </el-tree>
    </div>

    <!-- 右侧内容区域 -->
    <div class="right-content">
      <el-empty v-if="!selectedDevice" description="请选择设备查看详情" />

      <div v-else class="device-detail h-full">
        <!-- Tab 切换 -->
        <el-tabs v-model="activeTab" type="border-card">
          <!-- 设备信息与控制 -->
          <el-tab-pane label="设备信息与控制" name="info">
            <DeviceInfoPanel :device="selectedDevice" @restart="handleRestart" />
          </el-tab-pane>

          <!-- 视频预览（仅摄像头） -->
          <el-tab-pane
            v-if="selectedDevice.deviceType === DeviceTypeEnum.CAMERA"
            label="视频预览"
            name="video"
          >
            <VideoPreviewPanel :device="selectedDevice" />
          </el-tab-pane>

          <!-- 传感数据（仅传感器） -->
          <el-tab-pane
            v-if="selectedDevice.deviceType === DeviceTypeEnum.SENSOR"
            label="传感数据"
            name="sensor"
          >
            <SensorDataPanel :device="selectedDevice" :sensorData="mockSensorData" />
          </el-tab-pane>

          <!-- 检测事件流 -->
          <el-tab-pane label="检测事件流" name="events">
            <EventStreamPanel :device="selectedDevice" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Folder, VideoCamera, Monitor } from '@element-plus/icons-vue'
  import DeviceInfoPanel from './modules/device-info-panel.vue'
  import VideoPreviewPanel from './modules/video-preview-panel.vue'
  import SensorDataPanel from './modules/sensor-data-panel.vue'
  import EventStreamPanel from './modules/event-stream-panel.vue'
  import { areaDeviceList } from '@/api/system-manage'
  import { DeviceTypeEnum } from '@/enums/formEnum'

  // 设备树数据
  type DeviceNode = Api.SystemManage.DeviceMonitorNode

  const deviceTreeRef = ref()
  const searchText = ref('')
  const selectedDevice = ref<any>(null)
  const activeTab = ref('info')

  // 加载设备树数据
  const loadDeviceTreeData = async () => {
    try {
      const apiData = await areaDeviceList()
      deviceTreeData.value = transformToTreeNodes(apiData)
    } catch {
      ElMessage.error('加载设备列表失败')
    }
  }

  // 将API数据转换为树节点格式
  const transformToTreeNodes = (data: Api.SystemManage.AreaDeviceListItem[]): DeviceNode[] => {
    return data.map((item) => ({
      id: String(item.id),
      label: item.areaName,
      type: 'folder' as const,
      deviceType: undefined,
      children: item.deviceList.map((device) => ({
        id: String(device.id),
        label: device.deviceName,
        type: 'device' as const,
        deviceType:
          device.deviceType === DeviceTypeEnum.CAMERA
            ? DeviceTypeEnum.CAMERA
            : DeviceTypeEnum.SENSOR,
        code: device.deviceCode,
        ip: device.ipAddress,
        model: device.model,
        location: device.location,
        status: device.status,
        ipAddress: device.ipAddress,
        deviceName: device.deviceName,
        deviceCode: device.deviceCode,
        areaId: device.areaId,
        areaName: device.areaName
      }))
    }))
  }

  onMounted(() => {
    loadDeviceTreeData()
  })

  const treeProps = {
    children: 'children'
  }

  // 过滤节点
  watch(searchText, (val) => {
    deviceTreeRef.value.filter(val)
  })

  const filterNode = (value: string, data: any) => {
    if (!value) return true
    return data.label?.includes(value)
  }

  // 设备树数据
  const deviceTreeData = ref<DeviceNode[]>([])

  // 假数据：传感数据

  // 点击节点
  const handleNodeClick = (data: DeviceNode) => {
    if (data.type === 'device') {
      selectedDevice.value = data
      activeTab.value = 'info'
    }
  }

  // 假数据：传感数据
  const mockSensorData = ref({
    temperature: 28.6,
    vibration: 0.65,
    coConcentration: 14
  })

  // 重启设备
  const handleRestart = async (device: any) => {
    try {
      await ElMessageBox.confirm(`确定要重启设备 ${device.label} 吗？`, '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      ElMessage.success('设备重启成功')
    } catch {
      // 取消操作
    }
  }
</script>

<style lang="scss" scoped>
  .device-monitor-container {
    display: flex;
    gap: 16px;
    height: calc(100vh - 104px);
    padding: 16px;
    background: #f5f5f5;

    .left-sidebar {
      display: flex;
      flex-direction: column;
      width: 280px;
      padding: 16px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 10%);

      .sidebar-header {
        margin-bottom: 16px;
      }

      .custom-tree-node {
        display: flex;
        flex: 1;
        gap: 6px;
        align-items: center;
        font-size: 14px;

        .node-label {
          flex: 1;
        }

        .device-count {
          font-size: 12px;
          color: #909399;
        }
      }

      .el-tree {
        flex: 1;
        padding-right: 4px;
        overflow-y: auto;
      }
    }

    .right-content {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 10%);

      :deep(.el-tabs) {
        display: flex;
        flex-direction: column;
        height: 100%;

        .el-tabs__content {
          flex: 1;
          overflow-y: auto;

          .el-tab-pane {
            height: 100%;
          }
        }
      }
    }
  }
</style>
