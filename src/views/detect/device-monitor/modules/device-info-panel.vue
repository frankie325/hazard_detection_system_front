<template>
  <div class="device-info-panel">
    <el-descriptions title="设备信息" :column="2" border>
      <el-descriptions-item label="设备名称">{{ device.label }}</el-descriptions-item>
      <el-descriptions-item label="设备编码">{{ device.code }}</el-descriptions-item>
      <el-descriptions-item label="设备类型">
        {{ device.deviceType === DeviceTypeEnum.CAMERA ? '摄像头' : '传感器' }}
      </el-descriptions-item>
      <el-descriptions-item label="安装位置">{{ device.location }}</el-descriptions-item>
      <el-descriptions-item label="IP地址">{{ device.ip }}</el-descriptions-item>
      <el-descriptions-item label="型号">{{ device.model }}</el-descriptions-item>
      <el-descriptions-item label="在线状态">
        <el-tag
          :type="
            device.status === DeviceStatusEnum.ONLINE
              ? 'success'
              : device.status === DeviceStatusEnum.MAINTENANCE
                ? 'warning'
                : 'danger'
          "
          size="small"
        >
          {{
            device.status === DeviceStatusEnum.ONLINE
              ? '在线'
              : device.status === DeviceStatusEnum.MAINTENANCE
                ? '维护'
                : '离线'
          }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="检测状态">
        <el-tag type="success" size="small">检测已开启</el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <div class="control-actions">
      <el-button type="primary" :icon="VideoPlay">打开检测预览</el-button>
      <el-button :icon="VideoPause">关闭检测预览</el-button>
      <el-button type="warning" :icon="Refresh" @click="handleRestart">重启设备</el-button>
    </div>

    <el-alert title="注意" type="warning" :closable="false" show-icon style="margin-top: 16px">
      摄像头的检测一直运行在后台服务中,而不是打开检测预览按钮去控制的,他只是让前端读取目标检测视频去展示。
    </el-alert>
  </div>
</template>

<script setup lang="ts">
  import { VideoPlay, VideoPause, Refresh } from '@element-plus/icons-vue'
  import { DeviceTypeEnum, DeviceStatusEnum } from '@/enums/formEnum'

  interface Props {
    device: any
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    restart: [device: any]
  }>()

  const handleRestart = () => {
    emit('restart', props.device)
  }
</script>

<style lang="scss" scoped>
  .device-info-panel {
    .control-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }
  }
</style>
