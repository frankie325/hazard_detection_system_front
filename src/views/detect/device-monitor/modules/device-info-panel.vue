<template>
  <div class="device-info-panel">
    <!-- 上半部分：视频预览区（仅摄像头类型显示） -->
    <div v-if="isCamera" class="video-section">
      <div class="video-header">
        <div class="video-title-group">
          <span class="video-title">{{ device.deviceName }}</span>
          <!-- 直播状态指示器 -->
          <span v-if="isVideoOpen" class="live-indicator">
            <span class="live-dot" />
            <span class="live-text">LIVE</span>
          </span>
          <!-- <span v-else class="offline-indicator">
            <span class="offline-dot" />
            <span class="offline-text">OFFLINE</span>
          </span> -->
        </div>
        <div class="video-actions">
          <el-button
            v-if="!isVideoOpen"
            type="primary"
            size="small"
            :icon="VideoPlay"
            @click="openVideo"
          >
            打开实时画面
          </el-button>
          <template v-else>
            <el-button size="small" :icon="FullScreen" @click="openDetectPreview">
              检测预览
            </el-button>
            <el-button type="danger" size="small" :icon="Close" @click="closeVideo">
              关闭
            </el-button>
          </template>
        </div>
      </div>

      <div class="video-container">
        <!-- 未开启状态 -->
        <div v-if="!isVideoOpen" class="video-placeholder">
          <el-icon size="56" color="#606266">
            <VideoCamera />
          </el-icon>
          <p>点击上方按钮开启实时画面，后台检测持续运行</p>
        </div>
        <!-- 视频播放中 -->
        <div v-else class="video-wrapper">
          <video
            v-if="device.videoUrl"
            ref="videoRef"
            class="video-element"
            :src="device.videoUrl"
            autoplay
            muted
            controls
            playsinline
          >
            您的浏览器不支持视频播放
          </video>
          <div v-else class="video-error">
            <el-icon size="56" color="#F56C6C">
              <WarningFilled />
            </el-icon>
            <p>视频链接不可用</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 下半部分：设备信息 + 控制操作 -->
    <div class="info-section">
      <el-descriptions title="设备信息" :column="3" border size="small">
        <el-descriptions-item label="设备名称">{{ device.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="设备编码">{{ device.deviceCode }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">
          {{ isCamera ? '摄像头' : '传感器' }}
        </el-descriptions-item>
        <el-descriptions-item label="安装位置">{{ device.location || '--' }}</el-descriptions-item>
        <el-descriptions-item label="型号">{{ device.model || '--' }}</el-descriptions-item>
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
      </el-descriptions>

      <!-- 控制操作按钮（仅摄像头显示检测预览入口，传感器不显示） -->
      <button
        v-if="isCamera"
        class="mt-[16px] rounded-lg relative w-[140px] h-[40px] cursor-pointer flex items-center border border-[var(--el-color-primary)] bg-[var(--el-color-primary)] group hover:bg-[var(--el-color-primary)] active:bg-[var(--el-color-primary)] active:border-[var(--el-color-primary)]"
        :disabled="!device.videoUrl"
        @click="openDetectPreview"
      >
        <span
          class="text-white font-semibold ml-8 transform group-hover:translate-x-[50%] transition-all duration-300"
          >检测预览</span
        >
        <span
          class="absolute right-0 h-full w-10 rounded-lg bg-[var(--el-color-primary)] flex items-center justify-center transform group-hover:translate-x-0 group-hover:w-full transition-all duration-300"
        >
          <el-icon size="20" color="white">
            <VideoPlay />
          </el-icon>

          <!-- <svg
            class="svg w-8 text-white"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="12" x2="12" y1="5" y2="19"></line>
            <line x1="5" x2="19" y1="12" y2="12"></line>
          </svg> -->
        </span>
      </button>
    </div>

    <!-- 目标检测预览弹窗 — 视频充满整个内容区域 -->
    <el-dialog
      v-model="detectPreviewVisible"
      title="目标检测预览"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      destroy-on-close
      @close="closeDetectPreview"
    >
      <div class="h-[60vh]">
        <DetectVideoContent ref="detectVideoContentRef" :device="device" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { VideoPlay, VideoCamera, Close, WarningFilled, FullScreen } from '@element-plus/icons-vue'
  import { DeviceTypeEnum, DeviceStatusEnum } from '@/enums/formEnum'
  import DetectVideoContent from '@/components/DetectVideoContent/index.vue'

  interface Props {
    device: Api.SystemManage.DeviceListItem
  }

  const props = defineProps<Props>()

  // 是否是摄像头设备
  const isCamera = computed(() => props.device.deviceType === DeviceTypeEnum.CAMERA)

  // ===== 实时视频预览（原始 videoUrl） =====
  const isVideoOpen = ref(false)
  const videoRef = ref<HTMLVideoElement | null>(null)

  const openVideo = () => {
    isVideoOpen.value = true
  }

  const closeVideo = () => {
    // 停止原生 video 播放
    if (videoRef.value) {
      videoRef.value.pause()
      videoRef.value.src = ''
    }
    isVideoOpen.value = false
  }

  // ===== 目标检测预览弹窗（MJPEG 流） =====
  const detectPreviewVisible = ref(false)
  const detectVideoContentRef = ref<InstanceType<typeof DetectVideoContent> | null>(null)

  const openDetectPreview = () => {
    if (!props.device.videoUrl) return
    detectPreviewVisible.value = true
  }

  const closeDetectPreview = () => {
    detectVideoContentRef.value?.resetVideoStream()
    detectPreviewVisible.value = false
  }
</script>

<style lang="scss" scoped>
  .device-info-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
  }

  /* ===== 上半部分：视频区 ===== */
  .video-section {
    flex-shrink: 0;

    .video-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: #1a1a1a;
      border-radius: 8px 8px 0 0;

      .video-title-group {
        display: flex;
        gap: 10px;
        align-items: center;

        .video-title {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
        }

        /* 直播状态 - 红色圆点 + LIVE 文字 */
        .live-indicator {
          display: inline-flex;
          gap: 6px;
          align-items: center;
          padding: 2px 10px;
          background: rgb(34 197 94 / 20%);
          border-radius: 4px;

          .live-dot {
            position: relative;
            width: 8px;
            height: 8px;
            background: #22c55e;
            border-radius: 50%;

            // 外圈呼吸扩散动画
            &::before {
              position: absolute;
              inset: -3px;
              content: '';
              background: rgb(34 197 94 / 40%);
              border-radius: 50%;
              animation: livePulse 2s ease-in-out infinite;
            }
          }

          .live-text {
            font-size: 11px;
            font-weight: 700;
            color: #22c55e;
            letter-spacing: 1px;
          }
        }

        /* 离线状态 - 灰色圆点 */
        .offline-indicator {
          display: inline-flex;
          gap: 6px;
          align-items: center;
          padding: 2px 10px;
          background: rgb(144 147 153 / 20%);
          border-radius: 4px;

          .offline-dot {
            width: 8px;
            height: 8px;
            background: #606266;
            border-radius: 50%;
          }

          .offline-text {
            font-size: 11px;
            font-weight: 700;
            color: #909399;
            letter-spacing: 1px;
          }
        }

        @keyframes livePulse {
          0% {
            opacity: 0.8;
            transform: scale(0.8);
          }

          50% {
            opacity: 0;
            transform: scale(1.8);
          }

          100% {
            opacity: 0;
            transform: scale(0.8);
          }
        }
      }

      .video-actions {
        display: flex;
        gap: 8px;
      }
    }

    .video-container {
      overflow: hidden;
      background: #000;
      border-radius: 0 0 8px 8px;

      .video-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 340px;
        color: #909399;

        p {
          margin-top: 12px;
          font-size: 13px;
        }
      }

      .video-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 340px;

        .video-element {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .video-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: #f56c6c;

          p {
            margin-top: 12px;
            font-size: 13px;
          }
        }
      }
    }
  }

  /* ===== 下半部分：设备信息 + 控制 ===== */
  .info-section {
    flex: 1;
    overflow-y: auto;
  }

  /* 弹窗内容区去除内边距，让视频完全撑满 */
  :deep(.el-dialog__body) {
    padding: 0;
  }
</style>
