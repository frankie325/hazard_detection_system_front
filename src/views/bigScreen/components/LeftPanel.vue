<template>
  <aside class="panel-left">
    <!-- 今日实时概览 -->
    <BorderBox8 :reverse="true" class="panel-section metrics-panel h-[200px]!">
      <div class="section-header">
        <span class="section-dot"></span>
        <h3 class="section-title">今日实时概览</h3>
      </div>
      <div class="metrics-main">
        <div class="metric-highlight">
          <ShinyText
            style="font-size: 36px; line-height: 1"
            :text="overview.todayAlarmCount.toLocaleString()"
            :speed="2"
            :color="'#00e5ff'"
            :shine-color="'#b3f5ff'"
          />
          <span class="metric-label">总告警量</span>
        </div>
      </div>
      <div class="metrics-row">
        <div class="metric-card">
          <span class="metric-card-label">设备数</span>
          <span class="metric-card-value text-blue">
            {{ overview.deviceCount.toLocaleString() }}
          </span>
        </div>
        <div class="metric-card">
          <span class="metric-card-label">待处理告警</span>
          <span class="metric-card-value text-cyan">{{ overview.pendingAlarmCount }}</span>
        </div>
        <div class="metric-card">
          <span class="metric-card-label">活跃应急事件</span>
          <span class="metric-card-value text-red">{{ overview.activeEventCount }}</span>
        </div>
      </div>
    </BorderBox8>

    <!-- 告警等级分布 -->
    <BorderBox13 class="panel-section alert-level-panel">
      <div class="section-header">
        <span class="section-dot"></span>
        <h3 class="section-title">告警等级分布</h3>
      </div>
      <div ref="alertLevelChartRef" class="chart-container"></div>
    </BorderBox13>

    <!-- 危害类型分布 -->
    <BorderBox6 class="panel-section hazard-type-panel">
      <div class="section-header">
        <span class="section-dot"></span>
        <h3 class="section-title">危害类型分布</h3>
      </div>
      <div ref="hazardTypeChartRef" class="hazard-chart-container"></div>
    </BorderBox6>
  </aside>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import * as echarts from 'echarts/core'
  import { BarChart, PieChart } from 'echarts/charts'
  import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { BorderBox6, BorderBox8, BorderBox13 } from '@dataview/datav-vue3'
  import ShinyText from '@/components/ShinyText/index.vue'
  import { getDashboardOverview, getAlarmLevelStats, getEventTypeLevelStats } from '@/api/dashboard'

  echarts.use([
    BarChart,
    PieChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer
  ])

  // 仪表盘数据
  const overview = ref({
    todayAlarmCount: 0,
    deviceCount: 0,
    pendingAlarmCount: 0,
    activeEventCount: 0
  })

  // 灾害类型数据
  const hazardTypeData = ref<{ xaxis: string[]; series: any[] }>({
    xaxis: [],
    series: []
  })

  // 告警等级统计数据
  const alarmLevelData = ref<{ name: string; value: number }[]>([])

  // 图表引用
  const alertLevelChartRef = ref<HTMLElement | null>(null)
  const hazardTypeChartRef = ref<HTMLElement | null>(null)
  let alertLevelChart: echarts.ECharts | null = null
  let hazardTypeChart: echarts.ECharts | null = null

  /** 告警等级 → 颜色映射 */
  const levelColorMap: Record<string, string> = {
    紧急: '#ff5a5a',
    高级: '#ff9a3c',
    中级: '#ffd23f',
    低级: '#00c8ff'
  }

  /** 初始化告警等级分布（环形饼图） */
  const initAlertLevelChart = () => {
    if (!alertLevelChartRef.value || !alarmLevelData.value.length) return
    alertLevelChart = echarts.init(alertLevelChartRef.value)

    alertLevelChart.setOption({
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(8, 24, 48, 0.9)',
        borderColor: 'rgba(77, 158, 255, 0.3)',
        textStyle: { color: '#e8f0fe', fontSize: 12 },
        formatter: (params: any) => `${params.name}: ${params.value} (${params.percent}%)`
      },
      legend: {
        bottom: 0,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: 'rgba(160, 190, 230, 0.75)', fontSize: 11 }
      },
      series: [
        {
          type: 'pie',
          radius: ['35%', '60%'],
          center: ['50%', '42%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderColor: 'rgba(8, 24, 48, 0.6)',
            borderWidth: 2,
            color: (params: any) => levelColorMap[params.name] || '#00c8ff'
          },
          label: {
            show: false,
            color: '#e8f0fe',
            fontSize: 11,
            formatter: '{b}\n{d}%',
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data: alarmLevelData.value
        }
      ]
    })
  }

  /** 初始化危害类型分布（堆叠柱状图） */
  const initHazardTypeChart = () => {
    if (!hazardTypeChartRef.value || !hazardTypeData.value.xaxis.length) return
    hazardTypeChart = echarts.init(hazardTypeChartRef.value)

    const { xaxis, series } = hazardTypeData.value

    hazardTypeChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(8, 24, 48, 0.9)',
        borderColor: 'rgba(77, 158, 255, 0.3)',
        textStyle: { color: '#e8f0fe', fontSize: 12 }
      },
      legend: {
        top: 0,
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: 'rgba(160, 190, 230, 0.75)', fontSize: 10 }
      },
      grid: {
        left: '2%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xaxis,
        axisLine: { show: true, lineStyle: { color: 'rgba(77, 158, 255, 0.2)' } },
        axisTick: { show: true, lineStyle: { color: 'rgba(77, 158, 255, 0.2)' } },
        axisLabel: { color: 'rgba(160, 190, 230, 0.75)', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: true, lineStyle: { color: 'rgba(77, 158, 255, 0.2)' } },
        axisTick: { show: true, lineStyle: { color: 'rgba(77, 158, 255, 0.2)' } },
        splitLine: { lineStyle: { color: 'rgba(77, 158, 255, 0.1)', type: 'dashed' } },
        axisLabel: { color: 'rgba(160, 190, 230, 0.75)', fontSize: 10 }
      },
      series: series.map((s) => ({
        name: s.name,
        type: 'bar',
        stack: 'total',
        barWidth: 16,
        data: s.data,
        itemStyle: {
          color: levelColorMap[s.name] || '#00c8ff'
        }
      }))
    })
  }

  /** 加载面板数据 */
  const loadPanelData = async () => {
    try {
      const [overviewRes, levelRes, typeRes] = await Promise.all([
        getDashboardOverview(),
        getAlarmLevelStats(),
        getEventTypeLevelStats()
      ])
      overview.value = overviewRes
      alarmLevelData.value = levelRes
      hazardTypeData.value = typeRes
    } catch (error) {
      console.error('加载左侧面板数据失败:', error)
    }
  }

  const resize = () => {
    alertLevelChart?.resize()
    hazardTypeChart?.resize()
  }

  defineExpose({ resize })

  onMounted(async () => {
    await loadPanelData()
    nextTick(() => {
      initAlertLevelChart()
      initHazardTypeChart()
    })
  })

  onBeforeUnmount(() => {
    alertLevelChart?.dispose()
    hazardTypeChart?.dispose()
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

  /* 边框 & 发光 */
  $border-color: rgb(77 158 255 / 18%);

  .panel-left {
    position: absolute;
    top: 20px;
    bottom: 24px;
    left: 24px;
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

  /* ========== 今日实时概览 ========== */
  .metrics-panel {
    flex-shrink: 0;
  }

  .metrics-main {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 0 20px;
  }

  .metric-highlight {
    display: flex;
    gap: 4px;
    align-items: flex-end;
    justify-content: center;
  }

  .metric-label {
    font-size: 12px;
    color: $text-secondary;
  }

  .metrics-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .metric-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    padding: 10px 4px;
    background: rgb(16 40 72 / 55%);
    border-radius: 4px;
  }

  .metric-card-label {
    font-size: 10px;
    color: $text-muted;
  }

  .metric-card-value {
    font-family: DIN, sans-serif;
    font-size: 24px;
    font-weight: 700;

    &.text-blue {
      color: $accent-blue;
    }

    &.text-cyan {
      color: $accent-cyan;
    }

    &.text-red {
      color: #ff5a5a;
    }
  }

  /* ========== 告警等级分布 ========== */
  // .alert-level-panel {
  //   flex: 1;
  // }

  .chart-container {
    width: 100%;
    height: calc(100% - 21px);
  }

  /* ========== 危害类型分布 ========== */
  .hazard-chart-container {
    width: 100%;
    height: calc(100% - 21px);
  }
</style>
