<template>
  <div class="art-card h-80 p-4 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>设备状态分布</h4>
        <p>各状态设备数量统计</p>
      </div>
    </div>
    <ArtBarChart
      height="calc(100% - 56px)"
      :data="chartData"
      :x-axis-data="xAxisData"
      :show-legend="false"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { getDeviceStatus } from '@/api/dashboard'
  import ArtBarChart from '@/components/core/charts/art-bar-chart/index.vue'

  const chartData = ref<number[]>([])
  const xAxisData = ref<string[]>([])

  const loadData = async () => {
    try {
      const res = await getDeviceStatus()
      if (res) {
        chartData.value = res.data
        xAxisData.value = res.xaxis
      }
    } catch (e) {
      console.error('加载设备状态统计失败:', e)
    }
  }

  onMounted(() => {
    loadData()
  })
</script>
