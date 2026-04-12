<template>
  <div class="art-card h-80 p-4 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>事件类型分布</h4>
        <p>各类型事件占比统计</p>
      </div>
    </div>
    <ArtRingChart
      height="calc(100% - 56px)"
      :data="chartData"
      :show-legend="true"
      legend-position="right"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { getEventType } from '@/api/dashboard'
  import ArtRingChart from '@/components/core/charts/art-ring-chart/index.vue'

  const chartData = ref<{ name: string; value: number }[]>([])

  const loadData = async () => {
    try {
      const res = await getEventType()
      if (res) {
        chartData.value = res
      }
    } catch (e) {
      console.error('加载事件类型统计失败:', e)
    }
  }

  onMounted(() => {
    loadData()
  })
</script>
