<template>
  <div ref="detectContainerRef" class="detect-preview-container">
    <div v-if="detectVideoUrl" class="detect-video-wrapper">
      <img
        ref="detectImgRef"
        :key="videoKey"
        :src="detectVideoUrl"
        alt="目标检测视频流"
        class="detect-video"
        decoding="async"
        @loadstart="onImageLoadStart"
        @load="onImageLoaded"
        @error="onImageError"
      />
      <!-- 加载中遮罩 -->
      <div v-if="isImageLoading" class="detect-loading-mask">
        <el-icon class="is-loading" :size="32" color="#fff">
          <Loading />
        </el-icon>
        <span class="loading-text">视频流加载中...</span>
      </div>
      <div class="detect-video-badge">MJPEG 检测流</div>
      <!-- 全屏按钮 -->
      <el-icon class="detect-fullscreen-btn" @click="toggleFullscreen">
        <FullScreen />
      </el-icon>
    </div>
    <div v-else class="detect-placeholder">
      <el-empty description="视频链接不可用，请确认设备视频地址已配置" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { FullScreen, Loading } from '@element-plus/icons-vue'

  interface Props {
    device: Api.SystemManage.DeviceListItem
  }

  const props = defineProps<Props>()

  // ===== 目标检测预览（MJPEG 流） =====
  const videoKey = ref(Date.now())
  const detectImgRef = ref<HTMLImageElement | null>(null)
  const detectContainerRef = ref<HTMLDivElement | null>(null)
  const isFullscreen = ref(false)
  const isImageLoading = ref(true)

  const detectVideoUrl = computed(() => {
    if (!props.device.videoUrl) return ''
    return `/api/video/detect/stream?deviceId=${props.device.id}&videoUrl=${encodeURIComponent(props.device.videoUrl)}`
  })

  // 重置视频流
  const resetVideoStream = () => {
    videoKey.value = Date.now()
    isImageLoading.value = true
    if (detectImgRef.value) {
      detectImgRef.value.src = ''
    }
  }

  // MJPEG 流加载状态
  const onImageLoadStart = () => {
    isImageLoading.value = true
  }

  const onImageLoaded = () => {
    isImageLoading.value = false
  }

  const onImageError = () => {
    isImageLoading.value = false
  }

  // 全屏切换
  const toggleFullscreen = () => {
    if (!detectContainerRef.value) return
    if (!document.fullscreenElement) {
      detectContainerRef.value.requestFullscreen()
      isFullscreen.value = true
    } else {
      document.exitFullscreen()
      isFullscreen.value = false
    }
  }

  // 监听全屏变化事件，同步状态
  const onFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', onFullscreenChange)
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', onFullscreenChange)
    resetVideoStream()
  })

  // 暴露方法给父组件
  defineExpose({
    resetVideoStream
  })
</script>

<style lang="scss" scoped>
  .detect-preview-container {
    height: 100%;

    .detect-video-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      background: #000;

      .detect-video {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .detect-video-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        padding: 4px 10px;
        font-size: 12px;
        color: #fff;
        background: rgb(0 0 0 / 60%);
        border-radius: 4px;
      }
    }

    .detect-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 75vh;
      background: #000;
      border-radius: 4px;
    }
  }

  /* 检测视频区域内的全屏按钮 */
  .detect-fullscreen-btn {
    position: absolute;
    right: 16px;
    bottom: 16px;
    z-index: 10;
    font-size: 22px;
    color: rgb(255 255 255 / 70%);
    cursor: pointer;
    transition:
      color 0.2s,
      transform 0.2s;

    &:hover {
      color: #fff;
      transform: scale(1.15);
    }
  }

  /* MJPEG 流加载遮罩 */
  .detect-loading-mask {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 60%);

    .loading-text {
      font-size: 14px;
      color: rgb(255 255 255 / 80%);
    }
  }

  /* 全屏状态下视频铺满整个屏幕 */
  .detect-preview-container:fullscreen {
    width: 100vw;
    height: 100vh;
    background: #000;

    .detect-video-wrapper {
      height: 100vh;
    }
  }
</style>
