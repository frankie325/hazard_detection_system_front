<template>
  <aside class="panel-right">
    <!-- 实时告警动态 -->
    <BorderBox8 class="panel-section alert-list-panel">
      <div class="section-header">
        <span class="section-dot"></span>
        <h3 class="section-title">实时告警动态</h3>
        <span class="section-subtitle">实时更新中...</span>
      </div>
      <div class="alert-list">
        <AnimatedList :items="alertList" :show-gradients="true" :display-scrollbar="true">
          <template #default="{ item: alert }">
            <div class="alert-card" :class="'alert-' + alert.level">
              <div class="alert-card-header">
                <span class="alert-level-tag" :class="'tag-' + alert.level">{{
                  alert.levelText
                }}</span>
                <span class="alert-time">{{ alert.time }}</span>
              </div>
              <div class="alert-card-title">{{ alert.title }}</div>
              <div class="alert-card-meta">
                <div>设备: {{ alert.device }}</div>
                <div>地点: {{ alert.location }}</div>
              </div>
            </div>
          </template>
        </AnimatedList>
      </div>
    </BorderBox8>

    <!-- 应急事件处置进度 -->
    <BorderBox6 :reverse="true" class="panel-section emergency-panel h-[300px]!">
      <div class="section-header">
        <span class="section-dot"></span>
        <h3 class="section-title">应急事件处置进度</h3>
      </div>
      <div ref="emergencyChartRef" class="emergency-chart-container"></div>
    </BorderBox6>
  </aside>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import * as echarts from 'echarts/core'
  import { BarChart } from 'echarts/charts'
  import { GridComponent, TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { BorderBox6, BorderBox8 } from '@dataview/datav-vue3'
  import { getEventStatusStats } from '@/api/dashboard'
  import { alarmMessageList } from '@/api/warning'
  import { AlarmStatus, AlarmLevel } from '@/enums/formEnum'
  import AnimatedList from '@/components/AnimatedList/index.vue'

  echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

  // 事件状态统计数据
  const eventStatusData = ref<{ xaxis: string[]; data: number[] }>({
    xaxis: [],
    data: []
  })

  // 告警列表（从真实 API 加载）
  const alertList = ref<
    {
      time: string
      title: string
      device: string
      location: string
      level: string
      levelText: string
    }[]
  >([])

  /** 告警级别映射 */
  const levelMap: Record<AlarmLevel, { level: string; levelText: string }> = {
    [AlarmLevel.EMERGENCY]: { level: 'urgent', levelText: '紧急' },
    [AlarmLevel.HIGH]: { level: 'high', levelText: '高级' },
    [AlarmLevel.MEDIUM]: { level: 'medium', levelText: '中级' },
    [AlarmLevel.LOW]: { level: 'low', levelText: '低级' }
  }

  /** 将 API 数据映射为 UI 数据 */
  const mapApiToAlertItem = (item: Api.Warning.AlarmMessageListItem) => {
    const mapped = levelMap[item.alarmLevel] || { level: 'low', levelText: '低级' }
    const time = item.createTime ? item.createTime.split(' ')[1]?.substring(0, 8) : ''
    return {
      time,
      title: item.alarmName,
      device: item.deviceName,
      location: item.location,
      ...mapped
    }
  }

  /** 从 API 加载告警列表 */
  const loadAlertData = async () => {
    try {
      const res = await alarmMessageList({ current: 1, size: 20 })
      const list = res?.list || []
      // 只保留未关闭的告警
      alertList.value = list
        .filter((item) => item.alarmStatus !== AlarmStatus.CLOSED)
        .map(mapApiToAlertItem)
    } catch (error) {
      console.error('加载告警数据失败:', error)
    }
  }

  // 图表引用
  const emergencyChartRef = ref<HTMLElement | null>(null)
  let emergencyChart: echarts.ECharts | null = null
  let alertTimer: ReturnType<typeof setInterval> | null = null

  /** 初始化应急事件处置进度（横向柱状图） */
  const initEmergencyChart = () => {
    if (!emergencyChartRef.value || !eventStatusData.value.xaxis.length) return
    emergencyChart = echarts.init(emergencyChartRef.value)

    const { xaxis, data } = eventStatusData.value

    emergencyChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(8, 24, 48, 0.9)',
        borderColor: 'rgba(77, 158, 255, 0.3)',
        textStyle: { color: '#e8f0fe', fontSize: 12 }
      },
      grid: { left: '2%', right: '4%', top: '5%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        axisLine: { show: true, lineStyle: { color: 'rgba(77, 158, 255, 0.2)' } },
        axisTick: { show: true, lineStyle: { color: 'rgba(77, 158, 255, 0.2)' } },
        splitLine: { lineStyle: { color: 'rgba(77, 158, 255, 0.1)', type: 'dashed' } },
        axisLabel: { color: 'rgba(160, 190, 230, 0.75)', fontSize: 10 }
      },
      yAxis: {
        type: 'category',
        data: xaxis,
        inverse: true,
        axisLine: { show: true, lineStyle: { color: 'rgba(77, 158, 255, 0.2)' } },
        axisTick: { show: true, lineStyle: { color: 'rgba(77, 158, 255, 0.2)' } },
        axisLabel: { color: 'rgba(160, 190, 230, 0.75)', fontSize: 10 }
      },
      series: [
        {
          type: 'bar',
          data: data,
          barWidth: 14,
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: (params: any) => {
              const statusColorMap: Record<string, string> = {
                启动: '#67c23a',
                已确认: '#409eff',
                调度中: '#e6a23c',
                派发中: '#e6a23c',
                处理中: '#67c23a',
                已关闭: '#909399'
              }
              return statusColorMap[params.name]
            }
          },
          label: {
            show: true,
            position: 'right',
            color: '#e8f0fe',
            fontSize: 12,
            fontWeight: 700,
            formatter: '{c}'
          }
        }
      ]
    })
  }

  /** 加载面板数据 */
  const loadPanelData = async () => {
    try {
      const statusRes = await getEventStatusStats()
      eventStatusData.value = statusRes
    } catch (error) {
      console.error('加载右侧面板数据失败:', error)
    }
  }

  const resize = () => {
    emergencyChart?.resize()
  }

  defineExpose({ resize })

  onMounted(async () => {
    await Promise.all([loadPanelData(), loadAlertData()])
    alertTimer = setInterval(loadAlertData, 30000)
    nextTick(() => {
      initEmergencyChart()
    })
  })

  onBeforeUnmount(() => {
    emergencyChart?.dispose()
    if (alertTimer) clearInterval(alertTimer)
  })
</script>

<style lang="scss" scoped>
  /* 文字层级 */
  $text-primary: #e8f0fe;
  $text-secondary: rgb(160 190 230 / 75%);
  $text-muted: rgb(130 165 210 / 50%);

  /* 主色调：科技蓝 */
  $accent-blue: #4d9eff;
  $accent-cyan: #00c8ff;

  /* 辅助语义色 */
  $accent-red: #ff5a5a;
  $accent-orange: #ff9a3c;
  $accent-green: #3ddc84;
  $accent-yellow: #ffd23f;

  /* 边框 & 发光 */
  $border-color: rgb(77 158 255 / 18%);

  .panel-right {
    position: absolute;
    top: 20px;
    right: 24px;
    bottom: 24px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 320px;
    pointer-events: auto;
  }

  .panel-section {
    position: relative;
    padding: 16px;
    overflow: hidden;
    background: rgb(12 30 56 / 75%);
    border: 1px solid $border-color;
    border-radius: 4px;
  }

  .section-header {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
  }

  .section-dot {
    width: 4px;
    height: 4px;
    background: $accent-cyan;
    border-radius: 50%;
    box-shadow: 0 0 8px $accent-cyan;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
    letter-spacing: 1px;
  }

  /* ========== 实时告警动态 ========== */
  .alert-list-panel {
    flex: 1;
    overflow: hidden;
  }

  .section-subtitle {
    margin-left: auto;
    font-size: 10px;
    color: $accent-cyan;
    opacity: 0.8;
    animation: pulse 2s infinite;
  }

  .alert-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: calc(100% - 40px);
    // overflow-y: auto;
    padding-right: 4px;

    &::-webkit-scrollbar {
      width: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: $border-color;
    }
  }

  .alert-card {
    padding: 10px;
    background: rgb(16 40 72 / 55%);
    border-left: 3px solid transparent;
    border-radius: 2px;
    transition: all 0.3s ease;

    &:hover {
      background: rgb(20 50 90 / 40%);
      transform: translateX(4px);
    }

    &.alert-urgent {
      border-left-color: $accent-red;
    }

    &.alert-high {
      border-left-color: $accent-orange;
    }

    &.alert-medium {
      border-left-color: $accent-yellow;
    }

    &.alert-low {
      border-left-color: $accent-blue;
    }
  }

  .alert-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .alert-level-tag {
    padding: 2px 6px;
    font-size: 10px;
    font-weight: 700;
    border-radius: 2px;

    &.tag-urgent {
      color: $accent-red;
      background: rgb(255 90 90 / 15%);
    }

    &.tag-high {
      color: $accent-orange;
      background: rgb(255 154 60 / 15%);
    }

    &.tag-medium {
      color: $accent-yellow;
      background: rgb(255 210 63 / 15%);
    }

    &.tag-low {
      color: $accent-blue;
      background: rgb(0 200 255 / 15%);
    }
  }

  .alert-time {
    font-family: DIN, sans-serif;
    font-size: 10px;
    color: $text-muted;
  }

  .alert-card-title {
    margin-bottom: 6px;
    font-size: 12px;
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
  .emergency-chart-container {
    width: 100%;
    height: 240px;
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
</style>
