<template>
  <div class="big-screen">
    <!-- 顶部标题栏 -->
    <header class="screen-header">
      <!-- 左侧信息 -->
      <div class="header-left">
        <button class="back-button" @click="goBack">
          <Icon icon="ant-design:left-outlined" :size="14" />
          <span class="ml-[4px]">返回</span>
        </button>
      </div>

      <!-- 中心标题区域 -->
      <div class="header-center">
        <!-- 左翼 -->
        <div class="header-wing wing-left">
          <div class="wing-line wing-line-1"></div>
          <div class="wing-line wing-line-2"></div>
          <div class="wing-diamond"></div>
        </div>

        <!-- 标题 -->
        <div class="header-title-wrap">
          <!-- 扫描线 -->
          <div class="scan-line"></div>
          <GradientText
            class="header-title"
            :colors="['#4d9eff', '#00c8ff', '#7cb9ff', '#4d9eff']"
            :animation-speed="4"
          >
            智能公路监测系统
          </GradientText>
          <!-- 标题下方装饰线 -->
          <div class="title-underline">
            <div class="underline-glow"></div>
          </div>
        </div>

        <!-- 右翼 -->
        <div class="header-wing wing-right">
          <div class="wing-line wing-line-1"></div>
          <div class="wing-line wing-line-2"></div>
          <div class="wing-diamond"></div>
        </div>
      </div>

      <!-- 右侧信息 -->
      <div class="header-right">
        <span class="header-date">{{ currentDate }}</span>
        <span class="header-time">{{ currentTime }}</span>
      </div>

      <!-- 背景粒子 -->
      <div class="header-particles">
        <i v-for="n in 6" :key="n" class="h-particle" :class="'hp-' + n"></i>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="screen-body">
      <!-- 地图（底层，占满全部） -->
      <div class="map-area">
        <BaseMap
          :api-key="txMapKey"
          :center="mapCenter"
          :zoom="10"
          :options="{ mapStyleId: '' }"
          :control="{ zoom: false, scale: false, rotation: false }"
          view-mode="3D"
          class="tencent-map"
        >
          <MultiMarker
            :styles="markerStyles"
            :geometries="markerGeometries"
            :onClick="handleMarkerClick"
          />
          <MultiLabel :styles="labelStyles" :geometries="labelGeometries" />

          <!-- 检测视频弹窗（跟随点位） -->
          <DomOverlay
            v-if="activePopup"
            :position="activePopup.position"
            :offset="{ x: 0, y: -50 }"
          >
            <div class="alert-popup">
              <div class="popup-header">
                <span class="popup-dot"></span>
                <span class="popup-title">{{
                  activePopup.device.deviceName || activePopup.device.deviceCode
                }}</span>
                <span class="popup-rec">REC</span>
                <button class="popup-close" @click="activePopup = null">×</button>
              </div>
              <div class="popup-info">
                <span class="popup-info-label">Location / GPS</span>
                <span class="popup-info-value"
                  >{{ activePopup.device.coordinate?.[0] }},
                  {{ activePopup.device.coordinate?.[1] }}</span
                >
              </div>
              <div class="popup-video">
                <DetectVideoContent :device="activePopup.device" />
              </div>
            </div>
          </DomOverlay>
        </BaseMap>
      </div>

      <!-- 左侧面板 -->
      <LeftPanel ref="leftPanelRef" />

      <!-- 右侧面板 -->
      <RightPanel ref="rightPanelRef" />
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { Icon } from '@iconify/vue'
  import { BaseMap, MultiMarker, MultiLabel, DomOverlay } from 'tlbs-map-vue'
  import { deviceList } from '@/api/system-manage'
  import { DeviceTypeEnum } from '@/enums/formEnum'
  import GradientText from '@/components/GradientText/index.vue'
  import DetectVideoContent from '@/components/DetectVideoContent/index.vue'
  import LeftPanel from './components/LeftPanel.vue'
  import RightPanel from './components/RightPanel.vue'

  type DeviceListItem = Api.SystemManage.DeviceListItem
  // 路由
  const router = useRouter()
  const goBack = () => router.back()

  // 腾讯地图 Key
  const txMapKey = import.meta.env.VITE_TX_API_KEY

  // 地图中心点
  const mapCenter = ref({ lat: 39.95, lng: 116.4 })

  // 面板引用
  const leftPanelRef = ref<InstanceType<typeof LeftPanel> | null>(null)
  const rightPanelRef = ref<InstanceType<typeof RightPanel> | null>(null)

  // 检测视频弹窗（DomOverlay 方式，跟随点位）
  const activePopup = ref<{
    device: DeviceListItem
    position: { lat: number; lng: number }
    markerId: string
  } | null>(null)
  const cameraDeviceList = ref<DeviceListItem[]>([])

  // POI 摄像头图标（本地 PNG）
  const poiImg = '/src/assets/images/poi.png'

  /** 标记样式 */
  const markerStyles = {
    normal: {
      width: 48,
      height: 48,
      anchor: { x: 16, y: 32 },
      src: poiImg
    },
    alert: {
      width: 44,
      height: 44,
      anchor: { x: 16, y: 42 },
      src: poiImg
    }
  }

  // 时间相关
  const currentTime = ref('')
  const currentDate = ref('')
  let timer: ReturnType<typeof setInterval> | null = null

  const updateTime = () => {
    const now = new Date()
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    const s = String(now.getSeconds()).padStart(2, '0')
    currentTime.value = `${h}:${m}:${s}`
    const y = now.getFullYear()
    const mo = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    currentDate.value = `${y}-${mo}-${d}  ${weekdays[now.getDay()]}`
  }

  // 摄像头标记（地图坐标 [经度, 纬度]）
  type CameraMarker = { id: string; name?: string; coord: [number, number]; alert?: boolean }
  const cameraMarkers = ref<CameraMarker[]>([])

  /** 标记坐标数据 */
  const markerGeometries = computed(() =>
    cameraMarkers.value.map((cam) => ({
      id: cam.id,
      styleId: cam.alert ? 'alert' : 'normal',
      position: { lat: cam.coord[1], lng: cam.coord[0] }
    }))
  )

  /** 标签样式 */
  const labelStyles = {
    label: {
      color: '#4a99f8',
      borderRadius: 3,
      background: 'rgba(10, 22, 40, 0.85)',
      verticalAlignment: 'top',
      offset: { x: 0, y: 15 },
      wrapOptions: {
        maxWidth: 200
      }
    }
  }

  /** 标签坐标数据 */
  const labelGeometries = computed(() =>
    cameraMarkers.value.map((cam) => ({
      id: cam.id + '_label',
      styleId: 'label',
      position: { lat: cam.coord[1], lng: cam.coord[0] },
      content: cam.name || cam.id
    }))
  )

  // 加载真实摄像头点位
  const loadCameraMarkers = async () => {
    try {
      const res = await deviceList({
        current: 1,
        size: 500,
        deviceType: DeviceTypeEnum.CAMERA
      })
      const list = res?.list || []

      const parseCoord = (item: any): [number, number] | null => {
        if (Array.isArray(item.coordinate) && item.coordinate.length === 2) {
          const [lng, lat] = item.coordinate
          if (typeof lng === 'number' && typeof lat === 'number') {
            return [lng, lat]
          }
        }
        const lng =
          item.longitude ?? item.lng ?? (typeof item.lon === 'number' ? item.lon : undefined)
        const lat = item.latitude ?? item.lat
        if (typeof lat === 'number' && typeof lng === 'number') {
          return [Number(lng), Number(lat)]
        }
        if (typeof item.location === 'string') {
          const m = item.location.match(/(-?\d+\.?\d*)[^\d-]+(-?\d+\.?\d*)/)
          if (m) {
            const a = Number(m[1])
            const b = Number(m[2])
            if (isFinite(a) && isFinite(b)) {
              const lngFirst = Math.abs(a) > Math.abs(b) ? [a, b] : [b, a]
              return [lngFirst[0], lngFirst[1]]
            }
          }
        }
        return null
      }

      const markers: CameraMarker[] = []
      cameraDeviceList.value = list as DeviceListItem[]
      for (const d of list as any[]) {
        const coord = parseCoord(d)
        if (coord) {
          markers.push({
            id: d.deviceCode || String(d.id),
            name: d.deviceName,
            coord,
            alert: false
          })
        }
      }
      if (markers.length) {
        cameraMarkers.value = markers
        const avgLng = markers.reduce((s, m) => s + m.coord[0], 0) / markers.length
        const avgLat = markers.reduce((s, m) => s + m.coord[1], 0) / markers.length
        mapCenter.value = { lat: avgLat, lng: avgLng }
      }
    } catch (e) {
      console.error('加载摄像头点位失败:', e)
    }
  }

  // 标记点击处理
  const handleMarkerClick = (e: { geometry: { id: string } }) => {
    const markerId = e.geometry.id
    const device = cameraDeviceList.value.find(
      (d) => d.deviceCode === markerId || String(d.id) === markerId
    )
    if (device && device.videoUrl) {
      const marker = cameraMarkers.value.find((m) => m.id === markerId)
      if (marker) {
        activePopup.value = {
          device,
          position: { lat: marker.coord[1], lng: marker.coord[0] },
          markerId
        }
      }
    }
  }

  const handleResize = () => {
    leftPanelRef.value?.resize()
    rightPanelRef.value?.resize()
  }

  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') activePopup.value = null
  }

  onMounted(async () => {
    updateTime()
    timer = setInterval(updateTime, 1000)
    await loadCameraMarkers()
    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleEsc)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', handleEsc)
  })
</script>

<style lang="scss" scoped>
  /* ========== 浅蓝科技风色系变量 ========== */
  $bg-body: linear-gradient(160deg, #0b1a2e 0%, #0f2645 35%, #0a1e38 70%, #0d1f3c 100%);
  $text-primary: #e8f0fe;
  $text-secondary: rgb(160 190 230 / 75%);
  $text-muted: rgb(130 165 210 / 50%);
  $accent-cyan: #00c8ff;
  $accent-light-blue: #7cb9ff;
  $accent-red: #ff5a5a;

  /* ========== 主布局 ========== */
  .big-screen {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: $text-primary;
    background: $bg-body;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(0 200 255 / 3%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(0 200 255 / 3%) 1px, transparent 1px);
      background-size: 60px 60px;
    }
  }

  /* ========== 顶部标题 ========== */
  .screen-header {
    position: relative;
    z-index: 10;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 32px;
    background: linear-gradient(180deg, rgb(10 26 48 / 96%) 0%, rgb(10 22 40 / 85%) 100%);
    backdrop-filter: blur(14px);

    &::after {
      position: absolute;
      right: 5%;
      bottom: 0;
      left: 5%;
      height: 1px;
      content: '';
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgb(0 200 255 / 15%) 20%,
        $accent-cyan 50%,
        rgb(0 200 255 / 15%) 80%,
        transparent 100%
      );
      opacity: 0.6;
    }
  }

  .header-left,
  .header-right {
    z-index: 2;
    display: flex;
    flex-direction: column;
    width: 220px;
    font-size: 12px;
    color: $text-secondary;
  }

  .header-right {
    align-items: flex-end;
    text-align: right;
  }

  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 32px;
    font-size: 14px;
    font-weight: bold;
    color: $accent-light-blue;
    cursor: pointer;
    background: transparent;
    border: 3px ridge #149cea;
    border-radius: 8px;
    outline: none;
    transition: 0.3s;

    &:hover {
      box-shadow: inset 0 0 25px #1479ea;
    }
  }

  .header-time {
    font-size: 18px;
    font-weight: 600;
    color: $accent-light-blue;
    letter-spacing: 2px;
  }

  .header-center {
    z-index: 2;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .header-title-wrap {
    position: relative;
    padding: 4px 24px;
  }

  .header-title {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 4px;
  }

  .scan-line {
    position: absolute;
    top: 0;
    left: -100%;
    z-index: 1;
    width: 60%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgb(0 200 255 / 8%),
      rgb(0 200 255 / 15%),
      rgb(0 200 255 / 8%),
      transparent
    );
    animation: scan-move 4s ease-in-out infinite;
  }

  @keyframes scan-move {
    0% {
      left: -60%;
    }

    100% {
      left: 160%;
    }
  }

  .title-underline {
    position: absolute;
    bottom: -4px;
    left: 50%;
    width: 80%;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      rgb(0 200 255 / 40%),
      $accent-cyan,
      rgb(0 200 255 / 40%),
      transparent
    );
    transform: translateX(-50%);
  }

  .underline-glow {
    position: absolute;
    inset: 0;
    background: inherit;
    filter: blur(4px);
    animation: glow-pulse 3s ease-in-out infinite;
  }

  @keyframes glow-pulse {
    0%,
    100% {
      opacity: 0.5;
    }

    50% {
      opacity: 1;
    }
  }

  .header-wing {
    display: flex;
    align-items: center;
    width: 140px;
  }

  .wing-left {
    flex-direction: row-reverse;
  }

  .wing-line {
    height: 1px;
    background: linear-gradient(90deg, transparent, $accent-cyan);
  }

  .wing-left .wing-line {
    background: linear-gradient(-90deg, transparent, $accent-cyan);
  }

  .wing-line-1 {
    width: 100px;
    opacity: 0.4;
  }

  .wing-line-2 {
    width: 60px;
    margin-top: 4px;
    opacity: 0.2;
  }

  .wing-diamond {
    width: 6px;
    height: 6px;
    margin: 0 8px;
    background: $accent-cyan;
    border-radius: 1px;
    box-shadow: 0 0 10px $accent-cyan;
    transform: rotate(45deg);
  }

  .header-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .h-particle {
    position: absolute;
    width: 2px;
    height: 2px;
    background: $accent-cyan;
    border-radius: 50%;
    opacity: 0;
    animation: float-particle linear infinite;
  }

  .hp-1 {
    top: 60%;
    left: 12%;
    animation-duration: 6s;
  }

  .hp-2 {
    top: 20%;
    left: 25%;
    animation-duration: 8s;
  }

  .hp-3 {
    top: 80%;
    left: 40%;
    animation-duration: 7s;
  }

  .hp-4 {
    top: 30%;
    left: 65%;
    animation-duration: 5.5s;
  }

  .hp-5 {
    top: 70%;
    left: 78%;
    animation-duration: 9s;
  }

  .hp-6 {
    top: 15%;
    left: 90%;
    animation-duration: 6.5s;
  }

  @keyframes float-particle {
    0% {
      opacity: 0;
      transform: translateY(0);
    }

    15% {
      opacity: 0.8;
    }

    85% {
      opacity: 0.6;
    }

    100% {
      opacity: 0;
      transform: translateY(-12px) translateX(20px);
    }
  }

  /* ========== 主体 ========== */
  .screen-body {
    position: relative;
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .map-area {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .tencent-map {
    width: 100%;
    height: 100%;
  }

  /* ========== 告警弹窗 ========== */
  .alert-popup {
    width: 40vw;
    padding: 12px;
    background: rgb(10 26 48 / 90%);
    backdrop-filter: blur(8px);
    border: 1px solid $accent-red;
    border-radius: 4px;
    box-shadow: 0 0 20px rgb(255 90 90 / 30%);
    animation: popup-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);

    &::before {
      position: absolute;
      top: -1px;
      left: -1px;
      width: 15px;
      height: 15px;
      content: '';
      border-top: 2px solid $accent-red;
      border-left: 2px solid $accent-red;
    }
  }

  @keyframes popup-in {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(10px);
    }

    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .popup-dot {
    width: 6px;
    height: 6px;
    background: $accent-red;
    border-radius: 50%;
    animation: alert-blink 1s infinite;
  }

  @keyframes alert-blink {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.4;
    }
  }

  .popup-title {
    margin-left: 6px;
    font-size: 12px;
    font-weight: 700;
    color: $accent-red;
  }

  .popup-rec {
    margin-left: 4px;
    font-size: 10px;
    color: $accent-red;
    opacity: 0.8;
  }

  .popup-close {
    margin-left: auto;
    font-size: 16px;
    line-height: 1;
    color: $accent-red;
    cursor: pointer;
    background: none;
    border: none;
    opacity: 0.8;

    &:hover {
      opacity: 1;
    }
  }

  .popup-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 10px;
  }

  .popup-info-label {
    font-size: 9px;
    color: $text-muted;
  }

  .popup-info-value {
    font-size: 11px;
    color: $text-primary;
  }

  .popup-video {
    position: relative;
    width: 100%;
    height: 45vh;
    background: #000;
    border-radius: 2px;
  }

  .popup-video-placeholder {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 11px;
    color: #444;
  }

  .popup-video-overlay {
    position: absolute;
    inset: 0;
    padding: 8px;
    pointer-events: none;
  }

  .detect-tag {
    margin-bottom: 4px;
    font-size: 9px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 1px 2px rgb(0 0 0 / 80%);
  }
</style>
