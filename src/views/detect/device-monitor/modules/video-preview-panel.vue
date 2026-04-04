<template>
  <div class="video-preview-panel">
    <!-- <div class="video-controls">
      <el-checkbox v-model="showLabels">显示标注</el-checkbox>
      <el-checkbox v-model="eventMute">事件提醒静音</el-checkbox>
      <div class="checkbox-group">
        <el-checkbox-group v-model="detectedTypes">
          <el-checkbox label="抛洒物" />
          <el-checkbox label="行人" />
          <el-checkbox label="车辆" />
        </el-checkbox-group>
      </div>
    </div> -->

    <div class="video-container">
      <div v-if="!isVideoOpen" class="video-placeholder">
        <el-icon size="64" color="#909399"><VideoCamera /></el-icon>
        <p>未打开实时画面，后台检测持续运行。</p>
        <el-button type="primary" :icon="VideoPlay" @click="openVideo"> 打开实时画面 </el-button>
      </div>
      <div v-else class="video-player">
        <div class="video-header">
          <span class="video-title">检测预览: {{ device.deviceName }}</span>
          <!-- <el-tag type="success" size="small">检测中</el-tag> -->
          <el-button type="danger" size="small" :icon="Close" @click="closeVideo"> 关闭 </el-button>
        </div>
        <div class="video-content">
          <video
            v-if="device.videoUrl"
            ref="videoRef"
            class="video-player-element"
            :src="device.videoUrl"
            autoplay
            muted
            controls
            playsinline
          >
            您的浏览器不支持视频播放
          </video>
          <div v-else class="video-error">
            <el-icon size="64" color="#F56C6C"><WarningFilled /></el-icon>
            <p>视频链接不可用</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { VideoCamera, VideoPlay, Close, WarningFilled } from '@element-plus/icons-vue'

  interface Props {
    device: Api.SystemManage.DeviceListItem
  }

  defineProps<Props>()
  const isVideoOpen = ref(false)

  const openVideo = () => {
    isVideoOpen.value = true
  }

  const closeVideo = () => {
    isVideoOpen.value = false
  }
</script>

<style lang="scss" scoped>
  .video-preview-panel {
    .video-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      padding: 16px;
      margin-bottom: 16px;
      background: #f5f7fa;
      border-radius: 8px;

      .checkbox-group {
        display: flex;
        gap: 8px;
        align-items: center;

        :deep(.el-checkbox-group) {
          display: flex;
          gap: 8px;
        }
      }
    }

    .video-container {
      overflow: hidden;
      background: #000;
      border-radius: 8px;

      .video-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 400px;
        color: #909399;

        p {
          margin: 16px 0;
          font-size: 14px;
        }
      }

      .video-player {
        .video-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          color: #fff;
          background: #1a1a1a;

          .video-title {
            font-size: 14px;
          }
        }

        .video-content {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 400px;
          background: #000;

          .video-player-element {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .video-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #f56c6c;

            p {
              margin-top: 16px;
              font-size: 14px;
            }
          }
        }
      }
    }
  }
</style>
