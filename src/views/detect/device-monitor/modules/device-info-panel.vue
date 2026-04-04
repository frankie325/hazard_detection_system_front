<template>
  <div class="device-info-panel">
    <el-descriptions title="设备信息" :column="2" border>
      <el-descriptions-item label="设备名称">{{ device.deviceName }}</el-descriptions-item>
      <el-descriptions-item label="设备编码">{{ device.deviceCode }}</el-descriptions-item>
      <el-descriptions-item label="设备类型">
        {{ device.deviceType === DeviceTypeEnum.CAMERA ? '摄像头' : '传感器' }}
      </el-descriptions-item>
      <el-descriptions-item label="安装位置">{{ device.location }}</el-descriptions-item>
      <el-descriptions-item label="IP地址">{{ device.ipAddress }}</el-descriptions-item>
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
      <el-button type="primary" :icon="VideoPlay" @click="openDetectPreview">
        打开检测预览
      </el-button>
    </div>

    <!-- 目标检测预览弹窗 -->
    <el-dialog
      v-model="detectPreviewVisible"
      title="检测预览"
      width="900px"
      :close-on-click-modal="false"
      @close="closeDetectPreview"
    >
      <div class="detect-preview-container">
        <div v-if="detectVideoUrl && detectPreviewVisible" class="video-wrapper">
          <img
            ref="detectImgRef"
            :key="videoKey"
            :src="detectVideoUrl"
            alt="目标检测视频流"
            class="detect-video"
            decoding="async"
          />
        </div>
        <div v-else class="video-placeholder">
          <el-empty description="视频链接不可用" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { VideoPlay } from '@element-plus/icons-vue'
  import { DeviceTypeEnum, DeviceStatusEnum } from '@/enums/formEnum'

  interface Props {
    device: Api.SystemManage.DeviceListItem
  }

  const props = defineProps<Props>()

  // 目标检测预览弹窗
  const detectPreviewVisible = ref(false)
  const videoKey = ref(Date.now())
  const detectImgRef = ref<HTMLImageElement | null>(null)

  // 构建目标检测视频流URL - MJPEG格式
  const detectVideoUrl = computed(() => {
    if (!props.device.videoUrl) return ''
    return `/api/video/detect/stream?deviceId=${props.device.id}&videoUrl=${encodeURIComponent(props.device.videoUrl)}`
  })

  // 打开检测预览 - 使用MJPEG流
  const openDetectPreview = () => {
    if (!props.device.videoUrl) return
    // 更新 key 强制重新加载视频
    videoKey.value = Date.now()
    detectPreviewVisible.value = true
  }

  // 关闭检测预览 - 主动终止MJPEG流连接
  const closeDetectPreview = () => {
    // 先将 img 的 src 置空，浏览器会主动终止 HTTP 长连接
    if (detectImgRef.value) {
      detectImgRef.value.src = ''
    }
    detectPreviewVisible.value = false
  }
</script>

<style lang="scss" scoped>
  .device-info-panel {
    .control-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .detect-preview-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      background: #000;

      .video-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;

        .detect-video {
          max-width: 100%;
          max-height: 600px;
          object-fit: contain;
        }
      }

      .video-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 400px;
      }
    }
  }
</style>
