<template>
  <div class="big-screen">
    <!-- 顶部标题栏 -->
    <header class="screen-header">
      <!-- 左侧信息 -->
      <div class="header-left">
        <button class="back-button" @click="goBack">
          <Icon icon="ant-design:left-outlined" :size="16" />
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
          :center="{ lat: 39.95, lng: 116.4 }"
          :zoom="10"
          :options="{ mapStyleId: '' }"
          :control="{ zoom: false, scale: false, rotation: false }"
          class="tencent-map"
        >
          <MultiMarker :styles="markerStyles" :geometries="markerGeometries" />
          <MultiLabel :styles="labelStyles" :geometries="labelGeometries" />
        </BaseMap>
        <!-- 告警摄像头弹窗 -->
        <div class="alert-popup" :style="{ left: '42%', top: '35%' }">
          <div class="popup-header">
            <span class="popup-dot"></span>
            <span class="popup-title">Live Alert: CAM-0421</span>
            <span class="popup-rec">14:22:15 REC</span>
          </div>
          <div class="popup-info">
            <span class="popup-info-label">Location / GPS</span>
            <span class="popup-info-value">K125+200 [31.23°N 121.47°E]</span>
          </div>
          <div class="popup-video">
            <div class="popup-video-placeholder">
              <Icon icon="ant-design:video-camera-outlined" :size="32" color="#A6ABB8" />
              <span>监控画面</span>
            </div>
            <div class="popup-video-overlay">
              <div class="detect-tag tag-vehicle">VEHICLE [ID: 942] 0.98</div>
              <div class="detect-tag tag-vehicle">VEHICLE [ID: 945] 0.96</div>
            </div>
          </div>
        </div>
        <!-- 底部状态栏 -->
        <!-- <div class="center-status-bar">
          <div class="status-badge badge-green">
            <span class="badge-dot"></span>
            <span>全线畅通</span>
          </div>
          <div class="status-badge badge-orange">
            <span class="badge-dot"></span>
            <span>局部拥堵</span>
          </div>
          <div class="status-badge badge-red">
            <span class="badge-dot"></span>
            <span>严重警报</span>
          </div>
        </div> -->
      </div>

      <!-- 左侧面板 -->
      <aside class="panel-left">
        <!-- 今日实时概览 -->
        <BorderBox8 :reverse="true" class="panel-section metrics-panel">
          <div class="section-header">
            <span class="section-dot"></span>
            <h3 class="section-title">今日实时概览</h3>
          </div>
          <div class="metrics-main">
            <div class="metric-highlight">
              <span class="metric-trend">12%</span>
              <span class="metric-value">1,284</span>
              <span class="metric-label">总告警量</span>
            </div>
          </div>
          <div class="metrics-row">
            <div class="metric-card">
              <span class="metric-card-value text-blue">2,856</span>
              <span class="metric-card-label">设备数</span>
            </div>
            <div class="metric-card">
              <span class="metric-card-value text-cyan">42</span>
              <span class="metric-card-label">待处理告警</span>
            </div>
            <div class="metric-card">
              <span class="metric-card-value text-red">08</span>
              <span class="metric-card-label">活跃应急事件</span>
            </div>
          </div>
        </BorderBox8>

        <!-- 告警等级分布 -->
        <BorderBox13 class="panel-section alert-level-panel">
          <div class="section-header">
            <span class="section-dot"></span>
            <h3 class="section-title">告警等级分布</h3>
          </div>
          <div class="alert-level-chart">
            <div ref="alertLevelChartRef" class="chart-container"></div>
            <div class="confidence-ring">
              <div ref="confidenceChartRef" class="chart-container-sm"></div>
            </div>
          </div>
        </BorderBox13>

        <!-- 灾害类型分布 -->
        <BorderBox6 class="panel-section hazard-type-panel">
          <div class="section-header">
            <span class="section-dot"></span>
            <h3 class="section-title">灾害类型分布</h3>
          </div>
          <div class="hazard-list">
            <div class="hazard-item" v-for="item in hazardTypes" :key="item.name">
              <span class="hazard-name">{{ item.name }}</span>
              <div class="hazard-bar-track">
                <div class="hazard-bar-fill" :style="{ width: item.percent + '%' }"></div>
              </div>
              <span class="hazard-count">{{ item.count }}</span>
            </div>
          </div>
        </BorderBox6>
      </aside>

      <!-- 右侧面板 -->
      <aside class="panel-right">
        <!-- 实时告警动态 -->
        <BorderBox8 class="panel-section alert-list-panel">
          <div class="section-header">
            <span class="section-dot"></span>
            <h3 class="section-title">实时告警动态</h3>
            <span class="section-subtitle">实时更新中...</span>
          </div>
          <div class="alert-list">
            <div
              v-for="(alert, idx) in alertList"
              :key="idx"
              class="alert-card"
              :class="'alert-' + alert.level"
            >
              <div class="alert-card-header">
                <span class="alert-level-tag" :class="'tag-' + alert.level">{{
                  alert.levelText
                }}</span>
                <span class="alert-time">{{ alert.time }}</span>
              </div>
              <div class="alert-card-title">{{ alert.title }}</div>
              <div class="alert-card-meta">
                <span>设备: {{ alert.device }}</span>
                <span>地点: {{ alert.location }}</span>
              </div>
            </div>
          </div>
        </BorderBox8>

        <!-- 应急事件处置进度 -->
        <BorderBox5 :reverse="true" class="panel-section emergency-panel h-[400px]!">
          <div class="section-header">
            <span class="section-dot"></span>
            <h3 class="section-title">应急事件处置进度</h3>
          </div>
          <div class="emergency-stages">
            <div v-for="stage in emergencyStages" :key="stage.name" class="stage-item">
              <span class="stage-name">{{ stage.name }}</span>
              <span class="stage-count">{{ stage.count }}</span>
            </div>
          </div>
          <!-- <div class="admin-info">
            <span class="admin-role">管理员</span>
            <span class="admin-name">ZHANG SAN</span>
          </div> -->
        </BorderBox5>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import { Icon } from '@iconify/vue'
  import * as echarts from 'echarts/core'
  import { BarChart, PieChart } from 'echarts/charts'
  import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { BorderBox5, BorderBox6, BorderBox8, BorderBox13 } from '@dataview/datav-vue3'
  import { BaseMap, MultiMarker, MultiLabel } from 'tlbs-map-vue'
  import GradientText from '@/components/GradientText/index.vue'

  echarts.use([
    BarChart,
    PieChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer
  ])

  // 路由
  const router = useRouter()
  const goBack = () => router.back()

  // 腾讯地图 Key
  const txMapKey = import.meta.env.VITE_TX_API_KEY

  // 摄像头标记 SVG
  const normalMarkerSvg = btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="8" fill="none" stroke="#00c8ff" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="#00c8ff"/></svg>'
  )
  const alertMarkerSvg = btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"><circle cx="15" cy="15" r="12" fill="none" stroke="#ff5a5a" stroke-width="2"><animate attributeName="r" values="8;14;8" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="15" cy="15" r="6" fill="#ff5a5a"/></svg>'
  )

  /** 标记样式 */
  const markerStyles = {
    normal: {
      width: 24,
      height: 24,
      anchor: { x: 12, y: 12 },
      src: 'data:image/svg+xml;base64,' + normalMarkerSvg
    },
    alert: {
      width: 30,
      height: 30,
      anchor: { x: 15, y: 15 },
      src: 'data:image/svg+xml;base64,' + alertMarkerSvg
    }
  }

  // 时间相关
  const currentTime = ref('')
  const currentDate = ref('')
  const syncTime = ref('')
  let timer: ReturnType<typeof setInterval> | null = null

  const updateTime = () => {
    const now = new Date()
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    const s = String(now.getSeconds()).padStart(2, '0')
    currentTime.value = `${h}:${m}:${s}`
    syncTime.value = `${h}:${m}:${s}`
    const y = now.getFullYear()
    const mo = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    currentDate.value = `${y}-${mo}-${d}  ${weekdays[now.getDay()]}`
  }

  // 摄像头标记（地图坐标 [经度, 维度]）
  const cameraMarkers = ref([
    { id: 'CAM-0852', coord: [116.58, 40.12], alert: false, value: 0 },
    { id: 'CAM-1104', coord: [116.2, 39.72], alert: false, value: 0 },
    { id: 'CAM-0428', coord: [116.85, 39.45], alert: false, value: 0 },
    { id: 'CAM-0421', coord: [116.4, 39.95], alert: true, alertCount: 1, value: 1 }
  ])

  /** 标记坐标数据 */
  const markerGeometries = cameraMarkers.value.map((cam) => ({
    id: cam.id,
    styleId: cam.alert ? 'alert' : 'normal',
    position: { lat: cam.coord[1], lng: cam.coord[0] }
  }))

  /** 标签样式 */
  const labelStyles = {
    label: {
      color: 'rgba(160, 190, 230, 0.9)',
      fontSize: 11,
      borderRadius: 3,
      background: 'rgba(10, 22, 40, 0.8)',
      padding: [6, 4],
      direction: 'right',
      offset: { x: 8, y: 0 }
    }
  }

  /** 标签坐标数据 */
  const labelGeometries = cameraMarkers.value.map((cam) => ({
    id: cam.id + '_label',
    styleId: 'label',
    position: { lat: cam.coord[1], lng: cam.coord[0] },
    content: cam.id
  }))

  // 灾害类型
  const hazardTypes = ref([
    { name: '抛洒物', count: '428 起', percent: 38 },
    { name: '塌方', count: '152 起', percent: 14 },
    { name: '火灾', count: '34 起', percent: 3 },
    { name: '交通事故', count: '670 起', percent: 60 }
  ])

  // 告警列表
  const alertList = ref([
    {
      time: '14:22:15',
      title: 'G15沈海高速火灾告警',
      device: 'CAM-0421',
      location: 'K125+200',
      level: 'urgent',
      levelText: '紧急'
    },
    {
      time: '14:18:03',
      title: '路面大面积塌方风险',
      device: 'SEN-1108',
      location: 'S20临空段',
      level: 'high',
      levelText: '高级'
    },
    {
      time: '14:10:55',
      title: '疑似交通事故(双车)',
      device: 'CAM-0982',
      location: '外环高速入口',
      level: 'medium',
      levelText: '中级'
    },
    {
      time: '14:05:12',
      title: '路面零星抛洒物',
      device: 'CAM-1134',
      location: 'K54+100',
      level: 'low',
      levelText: '低级'
    }
  ])

  // 应急事件处置进度
  const emergencyStages = ref([
    { name: '启动阶段', count: 12 },
    { name: '已确认', count: 8 },
    { name: '调度中', count: 5 },
    { name: '处理中', count: 3 },
    { name: '已关闭', count: 1 }
  ])

  // 图表
  const alertLevelChartRef = ref<HTMLElement | null>(null)
  const confidenceChartRef = ref<HTMLElement | null>(null)
  let alertLevelChart: echarts.ECharts | null = null
  let confidenceChart: echarts.ECharts | null = null

  /** 初始化告警等级分布图表 */
  const initAlertLevelChart = () => {
    if (!alertLevelChartRef.value) return
    alertLevelChart = echarts.init(alertLevelChartRef.value)
    alertLevelChart.setOption({
      grid: { left: 0, right: 0, top: 8, bottom: 0, containLabel: false },
      xAxis: { type: 'value', show: false, max: 100 },
      yAxis: {
        type: 'category',
        data: ['紧急', '高级', '中级', '低级'],
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: 'rgba(160, 190, 230, 0.75)',
          fontSize: 10
        }
      },
      series: [
        {
          type: 'bar',
          data: [15, 25, 40, 20],
          barWidth: 10,
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: (params: any) => {
              const colors = ['#ff5a5a', '#ff9a3c', '#ffd23f', '#00c8ff']
              return colors[params.dataIndex] || '#00c8ff'
            }
          },
          label: {
            show: true,
            position: 'right',
            color: '#e8f0fe',
            fontSize: 10,
            fontWeight: 700,
            formatter: '{c}% ({d})',
            rich: {
              d: {
                fontSize: 10,
                fontWeight: 400,
                color: 'rgba(160, 190, 230, 0.75)'
              }
            }
          }
        }
      ]
    })
  }

  /** 初始化置信度环形图 */
  const initConfidenceChart = () => {
    if (!confidenceChartRef.value) return
    confidenceChart = echarts.init(confidenceChartRef.value)
    confidenceChart.setOption({
      series: [
        {
          type: 'pie',
          radius: ['65%', '80%'],
          startAngle: 90,
          silent: true,
          label: { show: false },
          data: [
            { value: 82, itemStyle: { color: '#00c8ff' } },
            { value: 18, itemStyle: { color: 'rgba(16, 40, 72, 0.55)' } }
          ]
        }
      ],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '35%',
          style: {
            text: '82%',
            fontSize: 22,
            fontWeight: 700,
            fill: '#e8f0fe',
            fontFamily: 'DIN, sans-serif'
          }
        },
        {
          type: 'text',
          left: 'center',
          top: '60%',
          style: {
            text: '置信度',
            fontSize: 10,
            fill: 'rgba(160, 190, 230, 0.75)'
          }
        }
      ]
    })
  }

  const handleResize = () => {
    alertLevelChart?.resize()
    confidenceChart?.resize()
  }

  onMounted(() => {
    updateTime()
    timer = setInterval(updateTime, 1000)
    nextTick(() => {
      initAlertLevelChart()
      initConfidenceChart()
    })
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
    window.removeEventListener('resize', handleResize)
    alertLevelChart?.dispose()
    confidenceChart?.dispose()
  })
</script>

<style lang="scss" scoped>
  /* ========== 浅蓝科技风色系变量 ========== */
  // 背景层级：浅色底 + 蓝色渐变
  $bg-deep: #0a1628;
  $bg-body: linear-gradient(160deg, #0b1a2e 0%, #0f2645 35%, #0a1e38 70%, #0d1f3c 100%);
  $bg-card: rgb(12 30 56 / 75%);
  $bg-card-alt: rgb(16 40 72 / 55%);
  $bg-card-solid: #0e2340;
  $bg-glass: rgb(20 50 90 / 40%);

  // 文字层级
  $text-primary: #e8f0fe;
  $text-secondary: rgb(160 190 230 / 75%);
  $text-muted: rgb(130 165 210 / 50%);

  // 主色调：科技蓝
  $accent-blue: #4d9eff;
  $accent-cyan: #00c8ff;
  $accent-sky: #38bdf8;
  $accent-light-blue: #7cb9ff;

  // 辅助语义色（保持告警辨识度）
  $accent-red: #ff5a5a;
  $accent-orange: #ff9a3c;
  $accent-green: #3ddc84;
  $accent-yellow: #ffd23f;

  // 边框 & 发光
  $border-color: rgb(77 158 255 / 18%);
  $border-glow: rgb(0 200 255 / 12%);
  $shadow-glow: 0 0 20px rgb(0 200 255 / 8%);

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

    // 科技感网格纹理
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
    overflow: hidden;
    background: linear-gradient(180deg, rgb(10 26 48 / 96%) 0%, rgb(10 22 40 / 85%) 100%);
    backdrop-filter: blur(14px);

    // 底部发光分割线
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

  // ===== 左右信息区 =====
  .header-left,
  .header-right {
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 220px;
    font-size: 12px;
    color: $text-secondary;
  }

  .header-right {
    align-items: flex-end;
    text-align: right;
  }

  .back-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 32px;
    font-size: 16px;
    font-weight: bold;
    color: $accent-light-blue;
    cursor: pointer;
    background-color: transparent;
    border: 3px ridge #149cea;
    border-radius: 8px;
    outline: none;
    transition: 1s;
  }

  .back-button:hover::before,
  .back-button:hover::after {
    transform: scale(0);
  }

  .back-button:hover {
    box-shadow: inset 0 0 25px #1479ea;
  }

  .header-date {
    font-size: 11px;
    color: $text-muted;
    letter-spacing: 1px;
  }

  .header-time {
    font-size: 18px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: $accent-light-blue;
    letter-spacing: 2px;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.3;
    }
  }

  // ===== 中心标题区 =====
  .header-center {
    z-index: 2;
    display: flex;
    flex: 1;
    gap: 0;
    align-items: center;
    justify-content: center;
  }

  .header-title-wrap {
    position: relative;
    padding: 4px 24px;
  }

  .header-title {
    position: relative;
    z-index: 2;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 4px;
  }

  // 扫描线动画
  .scan-line {
    position: absolute;
    top: 0;
    left: -100%;
    z-index: 1;
    width: 60%;
    height: 100%;
    pointer-events: none;
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

  // 标题下方装饰线
  .title-underline {
    position: absolute;
    bottom: -4px;
    left: 50%;
    z-index: 1;
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
    background: linear-gradient(
      90deg,
      transparent,
      rgb(0 200 255 / 40%),
      $accent-cyan,
      rgb(0 200 255 / 40%),
      transparent
    );
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

  // ===== 装饰翼 =====
  .header-wing {
    position: relative;
    display: flex;
    gap: 0;
    align-items: center;
    width: 140px;
  }

  .wing-left {
    flex-direction: row-reverse;
    justify-content: flex-start;
  }

  .wing-right {
    flex-direction: row;
    justify-content: flex-start;
  }

  .wing-line {
    position: relative;
    flex: 1;
    height: 1px;
  }

  .wing-line-1 {
    width: 70%;
    background: linear-gradient(90deg, transparent, rgb(0 200 255 / 50%));
  }

  .wing-right .wing-line-1 {
    background: linear-gradient(90deg, rgb(0 200 255 / 50%), transparent);
  }

  .wing-line-2 {
    width: 100%;
    background: linear-gradient(90deg, transparent, rgb(0 200 255 / 20%));
  }

  .wing-right .wing-line-2 {
    background: linear-gradient(90deg, rgb(0 200 255 / 20%), transparent);
  }

  // 翼端菱形
  .wing-diamond {
    position: relative;
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    background: rgb(0 200 255 / 10%);
    border: 1px solid $accent-cyan;
    box-shadow: 0 0 6px rgb(0 200 255 / 30%);
    transform: rotate(45deg);
    animation: diamond-glow 3s ease-in-out infinite;
  }

  @keyframes diamond-glow {
    0%,
    100% {
      box-shadow: 0 0 4px rgb(0 200 255 / 20%);
    }

    50% {
      box-shadow: 0 0 10px rgb(0 200 255 / 50%);
    }
  }

  // ===== 背景粒子 =====
  .header-particles {
    position: absolute;
    inset: 0;
    z-index: 1;
    overflow: hidden;
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

  // 6 个粒子的差异化配置
  .hp-1 {
    top: 60%;
    left: 12%;
    width: 2px;
    height: 2px;
    animation-duration: 6s;
    animation-delay: 0s;
  }

  .hp-2 {
    top: 20%;
    left: 25%;
    width: 1.5px;
    height: 1.5px;
    background: $accent-light-blue;
    animation-duration: 8s;
    animation-delay: 1.2s;
  }

  .hp-3 {
    top: 80%;
    left: 40%;
    animation-duration: 7s;
    animation-delay: 2.5s;
  }

  .hp-4 {
    top: 30%;
    left: 65%;
    width: 1.5px;
    height: 1.5px;
    background: $accent-light-blue;
    animation-duration: 5.5s;
    animation-delay: 0.8s;
  }

  .hp-5 {
    top: 70%;
    left: 78%;
    animation-duration: 9s;
    animation-delay: 3s;
  }

  .hp-6 {
    top: 15%;
    left: 90%;
    width: 1px;
    height: 1px;
    background: $accent-blue;
    animation-duration: 6.5s;
    animation-delay: 1.8s;
  }

  @keyframes float-particle {
    0% {
      opacity: 0;
      transform: translateY(0) translateX(0);
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
    flex: 1;
    min-height: 0;
  }

  .panel-left,
  .panel-right {
    position: absolute;
    top: 12px;
    bottom: 12px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 286px;
    overflow-y: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .panel-left {
    left: 12px;
    background: linear-gradient(
      to left,
      transparent 0%,
      rgb(10 22 48 / 50%) 40%,
      rgb(10 22 48 / 80%) 100%
    );
  }

  .panel-right {
    right: 12px;
    background: linear-gradient(
      to right,
      transparent 0%,
      rgb(10 22 48 / 50%) 40%,
      rgb(10 22 48 / 80%) 100%
    );
  }

  .map-area {
    position: absolute;
    inset: 0;
    height: 100%;
    overflow: hidden;
  }

  /* ========== 面板公共样式 ========== */
  .panel-section {
    padding: 16px;
    background: $bg-card;
    backdrop-filter: blur(8px);
    border: 1px solid $border-color;
    border-radius: 10px;
    box-shadow: $shadow-glow;
    transition: border-color 0.3s ease;

    &:hover {
      border-color: rgb(77 158 255 / 30%);
    }
  }

  .section-header {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 14px;
  }

  .section-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    background: $accent-cyan;
    border-radius: 50%;
    box-shadow: 0 0 6px $accent-cyan;
  }

  .section-title {
    flex: 1;
    font-size: 16px;
    font-weight: 600;
    color: $accent-light-blue;
  }

  .section-subtitle {
    font-size: 10px;
    color: $text-muted;
  }

  /* ========== 概览指标 ========== */
  .metrics-main {
    margin-bottom: 12px;
  }

  .metric-highlight {
    display: flex;
    gap: 10px;
    align-items: baseline;
  }

  .metric-trend {
    padding: 2px 6px;
    font-size: 12px;
    font-weight: 700;
    color: $accent-red;
    background: rgb(255 90 90 / 12%);
    border-radius: 4px;
  }

  .metric-value {
    font-size: 36px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    background: linear-gradient(135deg, $accent-cyan, $accent-blue);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .metric-label {
    margin-left: auto;
    font-size: 12px;
    color: $text-secondary;
  }

  .metrics-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .metric-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 8px;
    text-align: center;
    background: $bg-card-alt;
    border: 1px solid rgb(77 158 255 / 8%);
    border-radius: 6px;
  }

  .metric-card-value {
    font-size: 24px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  .metric-card-label {
    font-size: 10px;
    color: $text-secondary;
  }

  .text-blue {
    color: $accent-blue;
  }

  .text-cyan {
    color: $accent-cyan;
  }

  .text-red {
    color: $accent-red;
  }

  /* ========== 告警等级分布 ========== */
  .alert-level-panel {
    flex: 1;
  }

  .alert-level-chart {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .chart-container {
    flex: 1;
    height: 180px;
  }

  .confidence-ring {
    flex-shrink: 0;
    width: 110px;
    height: 110px;
  }

  .chart-container-sm {
    width: 100%;
    height: 100%;
  }

  /* ========== 灾害类型分布 ========== */
  .hazard-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .hazard-item {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .hazard-name {
    flex-shrink: 0;
    width: 56px;
    font-size: 10px;
    color: $text-secondary;
  }

  .hazard-bar-track {
    flex: 1;
    height: 6px;
    overflow: hidden;
    background: rgb(20 50 90 / 50%);
    border-radius: 3px;
  }

  .hazard-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, $accent-cyan, $accent-blue);
    border-radius: 3px;
    box-shadow: 0 0 8px rgb(0 200 255 / 30%);
    transition: width 0.6s ease;
  }

  .hazard-count {
    flex-shrink: 0;
    width: 52px;
    font-size: 10px;
    color: $text-secondary;
    text-align: right;
  }

  /* ========== 中间地图区域 ========== */

  .tencent-map {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
  }

  /* 告警弹窗 */
  .alert-popup {
    position: absolute;
    z-index: 20;
    width: 320px;
    overflow: hidden;
    background: rgb(12 30 56 / 92%);
    backdrop-filter: blur(10px);
    border: 1px solid rgb(255 90 90 / 35%);
    border-radius: 10px;
    box-shadow:
      0 8px 32px rgb(0 0 0 / 40%),
      0 0 16px rgb(255 90 90 / 10%);
    transform: translate(-50%, -50%);
  }

  .popup-header {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 12px;
    background: rgb(255 90 90 / 10%);
    border-bottom: 1px solid rgb(255 90 90 / 15%);
  }

  .popup-dot {
    width: 6px;
    height: 6px;
    background: $accent-red;
    border-radius: 50%;
    box-shadow: 0 0 6px $accent-red;
    animation: pulse 1s infinite;
  }

  .popup-title {
    flex: 1;
    font-size: 10px;
    font-weight: 700;
    color: $accent-red;
  }

  .popup-rec {
    font-size: 8px;
    color: $text-secondary;
  }

  .popup-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px 12px;
    background: rgb(10 22 40 / 50%);
  }

  .popup-info-label {
    font-size: 10px;
    color: $text-secondary;
  }

  .popup-info-value {
    font-size: 12px;
    color: $text-primary;
  }

  .popup-video {
    position: relative;
    height: 160px;
    background: #000;
  }

  .popup-video-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: $text-secondary;
  }

  .popup-video-overlay {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
    background: linear-gradient(transparent, rgb(0 0 0 / 70%));
  }

  .detect-tag {
    display: inline-block;
    width: fit-content;
    padding: 3px 8px;
    font-size: 10px;
    font-weight: 700;
    border-radius: 4px;
  }

  .tag-vehicle {
    color: #000;
    background: rgb(255 255 255 / 90%);
  }

  /* 底部状态栏 */
  .center-status-bar {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: center;
    padding: 10px;
    background: $bg-card;
    border: 1px solid $border-color;
    border-radius: 10px;
  }

  .status-badge {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 6px;
  }

  .badge-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .badge-green {
    .badge-dot {
      background: $accent-green;
    }

    color: $accent-green;
  }

  .badge-orange {
    .badge-dot {
      background: $accent-orange;
    }

    color: $accent-orange;
  }

  .badge-red {
    .badge-dot {
      background: $accent-red;
    }

    color: $accent-red;
  }

  /* ========== 右侧面板 ========== */
  .alert-list-panel {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  .alert-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .alert-card {
    padding: 10px;
    background: $bg-card-alt;
    backdrop-filter: blur(4px);
    border-left: 3px solid transparent;
    border-radius: 8px;
    transition: background 0.3s ease;
  }

  .alert-urgent {
    background: rgb(255 90 90 / 8%);
    border-left-color: $accent-red;
  }

  .alert-high {
    background: rgb(255 154 60 / 6%);
    border-left-color: $accent-orange;
  }

  .alert-medium {
    background: rgb(255 210 63 / 6%);
    border-left-color: $accent-yellow;
  }

  .alert-low {
    background: rgb(0 200 255 / 5%);
    border-left-color: $accent-cyan;
  }

  .alert-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .alert-level-tag {
    padding: 1px 6px;
    font-size: 10px;
    font-weight: 700;
    border-radius: 3px;
  }

  .tag-urgent {
    color: #ff7a7a;
    background: rgb(255 90 90 / 20%);
  }

  .tag-high {
    color: #ffb366;
    background: rgb(255 154 60 / 18%);
  }

  .tag-medium {
    color: #ffe066;
    background: rgb(255 210 63 / 15%);
  }

  .tag-low {
    color: #7cd9ff;
    background: rgb(0 200 255 / 12%);
  }

  .alert-time {
    font-size: 10px;
    font-variant-numeric: tabular-nums;
    color: $text-secondary;
  }

  .alert-card-title {
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
  }

  .alert-card-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 10px;
    color: $text-secondary;
  }

  /* ========== 应急事件处置进度 ========== */
  .emergency-stages {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .stage-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background: $bg-card-alt;
    border: 1px solid rgb(77 158 255 / 6%);
    border-radius: 6px;
  }

  .stage-name {
    font-size: 10px;
    color: $text-secondary;
  }

  .stage-count {
    font-size: 14px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: $accent-cyan;
  }

  .admin-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    background: $bg-card-alt;
    border: 1px solid rgb(77 158 255 / 6%);
    border-radius: 6px;
  }

  .admin-role {
    font-size: 10px;
    font-weight: 700;
    color: $text-secondary;
  }

  .admin-name {
    font-size: 12px;
    font-weight: 500;
    color: $text-primary;
  }
</style>
