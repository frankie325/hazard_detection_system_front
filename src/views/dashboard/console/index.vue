<!-- 工作台页面 -->
<template>
  <div>
    <CardList></CardList>

    <ElRow :gutter="20">
      <ElCol :sm="24" :md="12" :lg="12">
        <EventTypeChart />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <DeviceStatusChart />
      </ElCol>
    </ElRow>

    <AlarmTable />
  </div>
</template>

<script setup lang="ts">
  import CardList from './modules/card-list.vue'
  import EventTypeChart from './modules/event-type-chart.vue'
  import DeviceStatusChart from './modules/device-status-chart.vue'
  import AlarmTable from './modules/alarm-table.vue'

  defineOptions({ name: 'Console' })
</script>
