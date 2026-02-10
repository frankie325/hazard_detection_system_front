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
            <el-icon v-else-if="data.deviceType === 'camera'"><VideoCamera /></el-icon>
            <el-icon v-else><Monitor /></el-icon>
            <span class="node-label">{{ node.label }}</span>
            <span v-if="data.type === 'folder' && data.children" class="device-count">
              {{ data.children.length }}台设备
            </span>
          </span>
        </template>
      </el-tree>
    </div>

    <!-- 右侧内容区域 -->
    <div class="right-content">
      <el-empty v-if="!selectedDevice" description="请选择设备查看详情" />

      <div v-else class="device-detail">
        <!-- Tab 切换 -->
        <el-tabs v-model="activeTab" type="border-card">
          <!-- 设备信息与控制 -->
          <el-tab-pane label="设备信息与控制" name="info">
            <DeviceInfoPanel :device="selectedDevice" @restart="handleRestart" />
          </el-tab-pane>

          <!-- 视频预览（仅摄像头） -->
          <el-tab-pane v-if="selectedDevice.deviceType === 'camera'" label="视频预览" name="video">
            <VideoPreviewPanel :device="selectedDevice" />
          </el-tab-pane>

          <!-- 传感数据（仅传感器） -->
          <el-tab-pane v-if="selectedDevice.deviceType === 'sensor'" label="传感数据" name="sensor">
            <SensorDataPanel :device="selectedDevice" :sensorData="mockSensorData" />
          </el-tab-pane>

          <!-- 检测事件流 -->
          <el-tab-pane label="检测事件流" name="events">
            <EventStreamPanel :device="selectedDevice" :events="deviceEvents" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Folder, VideoCamera, Monitor } from '@element-plus/icons-vue'
  import DeviceInfoPanel from './modules/device-info-panel.vue'
  import VideoPreviewPanel from './modules/video-preview-panel.vue'
  import SensorDataPanel from './modules/sensor-data-panel.vue'
  import EventStreamPanel from './modules/event-stream-panel.vue'

  // 设备树数据
  interface DeviceNode {
    id: string
    label: string
    type: 'folder' | 'device'
    deviceType?: 'camera' | 'sensor'
    children?: DeviceNode[]
    [key: string]: any
  }

  const deviceTreeRef = ref()
  const searchText = ref('')
  const selectedDevice = ref<any>(null)
  const activeTab = ref('info')

  const treeProps = {
    children: 'children',
    label: 'label'
  }

  // 过滤节点
  watch(searchText, (val) => {
    deviceTreeRef.value.filter(val)
  })

  const filterNode = (value: string, data: any) => {
    if (!value) return true
    return data.label?.includes(value)
  }

  // 点击节点
  const handleNodeClick = (data: DeviceNode) => {
    if (data.type === 'device') {
      selectedDevice.value = data
      activeTab.value = 'info'
    }
  }

  // 假数据：设备树
  const deviceTreeData: DeviceNode[] = [
    {
      id: 'area-1',
      label: '隧道A',
      type: 'folder',
      children: [
        {
          id: 'device-1',
          label: '隧道A入口摄像头',
          type: 'device',
          deviceType: 'camera',
          code: 'CAM-01',
          ip: '192.168.1.10',
          model: 'HIKVISION DS-2CD3T45',
          location: '隧道A-入口',
          status: 'online',
          detectStatus: 'running'
        },
        {
          id: 'device-2',
          label: '隧道A火焰传感器4',
          type: 'device',
          deviceType: 'sensor',
          code: 'FIRE-04',
          ip: '192.168.1.11',
          model: 'Honeywell FS-100',
          location: '隧道A-出口',
          status: 'online',
          detectStatus: 'running'
        }
      ]
    },
    {
      id: 'area-2',
      label: '隧道B',
      type: 'folder',
      children: [
        {
          id: 'device-3',
          label: '隧道B火焰传感器2',
          type: 'device',
          deviceType: 'sensor',
          code: 'FIRE-02',
          ip: '192.168.1.12',
          model: 'Honeywell FS-100',
          location: '隧道B-中部',
          status: 'online',
          detectStatus: 'running'
        }
      ]
    },
    {
      id: 'area-3',
      label: '桥梁D',
      type: 'folder',
      children: [
        {
          id: 'device-4',
          label: '桥梁D南侧摄像头9',
          type: 'device',
          deviceType: 'camera',
          code: 'CAM-09',
          ip: '192.168.1.13',
          model: 'HIKVISION DS-2CD3T45',
          location: '桥梁D-南侧',
          status: 'online',
          detectStatus: 'running'
        }
      ]
    },
    {
      id: 'area-4',
      label: '路段C',
      type: 'folder',
      children: [
        {
          id: 'device-5',
          label: '路段C应力传感器5',
          type: 'device',
          deviceType: 'sensor',
          code: 'STRESS-05',
          ip: '192.168.1.14',
          model: 'Bently Nevada 3300',
          location: '路段C-中段',
          status: 'online',
          detectStatus: 'running'
        }
      ]
    },
    {
      id: 'area-5',
      label: '路段E',
      type: 'folder',
      children: [
        {
          id: 'device-6',
          label: '路段E地质传感器3',
          type: 'device',
          deviceType: 'sensor',
          code: 'GEO-03',
          ip: '192.168.1.15',
          model: 'Trimble NetR9',
          location: '路段E-匝道',
          status: 'online',
          detectStatus: 'running'
        }
      ]
    },
    {
      id: 'area-6',
      label: '路段F',
      type: 'folder',
      children: [
        {
          id: 'device-7',
          label: '路段F上行摄像头11',
          type: 'device',
          deviceType: 'camera',
          code: 'CAM-11',
          ip: '192.168.1.16',
          model: 'HIKVISION DS-2CD3T45',
          location: '路段F-上行',
          status: 'online',
          detectStatus: 'running'
        }
      ]
    }
  ]

  // 假数据：传感数据
  const mockSensorData = ref({
    temperature: 28.6,
    vibration: 0.65,
    coConcentration: 14
  })

  // 假数据：设备事件流
  const deviceEvents = ref([
    {
      id: 'evt-1',
      eventName: '火灾-CAM-01-114605',
      eventType: '火灾',
      deviceId: 'CAM-01',
      deviceName: '隧道A入口摄像头',
      confidence: 91,
      timestamp: '2025-11-08 11:46:05'
    },
    {
      id: 'evt-2',
      eventName: '抛洒物-CAM-01-091233',
      eventType: '抛洒物',
      deviceId: 'CAM-01',
      deviceName: '隧道A入口摄像头',
      confidence: 88,
      timestamp: '2025-11-08 09:12:33'
    },
    {
      id: 'evt-3',
      eventName: '抛洒物-CAM-01-162748',
      eventType: '抛洒物',
      deviceId: 'CAM-01',
      deviceName: '隧道A入口摄像头',
      confidence: 79,
      timestamp: '2025-11-07 16:27:48'
    },
    {
      id: 'evt-4',
      eventName: '塌方-CAM-01-100219',
      eventType: '塌方',
      deviceId: 'CAM-01',
      deviceName: '隧道A入口摄像头',
      confidence: 73,
      timestamp: '2025-11-07 10:02:19'
    },
    {
      id: 'evt-5',
      eventName: '交通事故-CAM-01-190311',
      eventType: '交通事故',
      deviceId: 'CAM-01',
      deviceName: '隧道A入口摄像头',
      confidence: 67,
      timestamp: '2025-11-05 19:03:11'
    },
    {
      id: 'evt-6',
      eventName: '火灾-CAM-01-081554',
      eventType: '火灾',
      deviceId: 'CAM-01',
      deviceName: '隧道A入口摄像头',
      confidence: 92,
      timestamp: '2025-11-05 08:15:54'
    }
  ])

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
    height: calc(100vh - 100px);
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
        }
      }
    }
  }
</style>
