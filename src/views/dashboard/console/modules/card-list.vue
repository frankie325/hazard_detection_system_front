<template>
  <ElRow :gutter="20" class="flex">
    <ElCol v-for="(item, index) in dataList" :key="index" :sm="12" :md="6" :lg="6">
      <div class="art-card relative flex flex-col justify-center h-35 px-5 mb-5 max-sm:mb-4">
        <span class="text-g-700 text-sm">{{ item.des }}</span>
        <ArtCountTo class="text-[26px] font-medium mt-2" :target="item.num" :duration="1300" />
        <div
          class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc bg-theme/10"
        >
          <ArtSvgIcon :icon="item.icon" class="text-xl text-theme" />
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { getWorkbenchOverview } from '@/api/dashboard'

  interface CardDataItem {
    des: string
    icon: string
    num: number
  }

  const dataList = ref<CardDataItem[]>([])

  const loadData = async () => {
    try {
      const res = await getWorkbenchOverview()
      if (res) {
        dataList.value = [
          {
            des: '监测设备总数',
            icon: 'ri:device-line',
            num: res.deviceCount
          },
          {
            des: '在线设备数',
            icon: 'material-symbols:android-wifi-3-bar',
            num: res.onlineDeviceCount
          },
          {
            des: '告警总数',
            icon: 'ri:fire-line',
            num: res.alarmCount
          },
          {
            des: '今日事件数',
            icon: 'material-symbols:calendar-add-on',
            num: res.todayEventCount
          }
        ]
      }
    } catch (e) {
      console.error('加载工作台概览数据失败:', e)
    }
  }

  onMounted(() => {
    loadData()
  })
</script>
