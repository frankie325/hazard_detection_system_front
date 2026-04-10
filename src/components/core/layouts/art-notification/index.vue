<!-- 通知组件 -->
<template>
  <div
    class="art-notification-panel art-card-sm !shadow-xl"
    :style="{
      transform: show ? 'scaleY(1)' : 'scaleY(0.9)',
      opacity: show ? 1 : 0
    }"
    v-show="visible"
    @click.stop
  >
    <div class="flex-cb px-3.5 mt-3.5">
      <span class="text-base font-medium text-g-800">{{ $t('notice.title') }}</span>
    </div>

    <div
      class="max-h-[400px] overflow-auto flex flex-col gap-[10px] p-[10px]"
      v-if="alertList.length"
    >
      <AlarmNotification v-for="alarm in alertList" :key="alarm.id" :alarm="alarm" />
    </div>
    <el-empty v-else description="暂无数据" />

    <div class="w-full">
      <div class="relative box-border w-full px-3.5" style="padding-bottom: 16px">
        <ElButton class="w-full mt-3" @click="handleToAlarmList" v-ripple>
          {{ $t('notice.viewAll') }}
        </ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { h, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  // import { useI18n } from 'vue-i18n'
  import { ElNotification } from 'element-plus'
  import WebSocketClient from '@/utils/socket'
  import AlarmNotification from '@/components/AlarmNotification/index.vue'
  import { router } from '@/router'

  defineOptions({ name: 'ArtNotification' })

  // const { t } = useI18n()

  const props = defineProps<{
    value: boolean
  }>()

  const emit = defineEmits<{
    'update:value': [value: boolean]
  }>()

  const show = ref(false)
  const visible = ref(false)
  const alertList = ref<Api.Warning.AlarmMessageListItem[]>([])
  // WebSocket 告警实例
  let wsClient: WebSocketClient | null = null

  /** WebSocket 告警消息处理 */
  const handleWsAlarmMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data as string) as Api.Warning.AlarmMessageListItem
      alertList.value.unshift(data)

      // 桌面通知
      // const levelTextMap: Record<string, string> = {
      //   EMERGENCY: '紧急',
      //   HIGH: '高级',
      //   MEDIUM: '中级',
      //   LOW: '低级'
      // }
      ElNotification({
        // title: `${levelTextMap[data.alarmLevel] || '告警'} - ${data.alarmName}`,
        duration: 0,
        position: 'top-right',
        showClose: true,
        message: h(AlarmNotification, { alarm: data, isCard: true, showButton: true })
      })
    } catch (e) {
      console.error('解析 WebSocket 告警消息失败:', e)
    }
  }

  /** 初始化 WebSocket 连接 */
  const initWebSocket = () => {
    const wsUrl = `${import.meta.env.VITE_API_WEBSOCKET_URL}/ws/alarm`
    wsClient = WebSocketClient.getInstance({
      url: wsUrl,
      messageHandler: handleWsAlarmMessage,
      reconnectInterval: 5000,
      heartbeatInterval: 10000,
      pingInterval: 15000,
      reconnectTimeout: 10000,
      maxReconnectAttempts: 999
    })
    wsClient.init()
  }

  // 动画管理
  const useNotificationAnimation = () => {
    const showNotice = (open: boolean) => {
      if (open) {
        visible.value = true
        setTimeout(() => {
          show.value = true
        }, 5)
      } else {
        show.value = false
        setTimeout(() => {
          visible.value = false
        }, 350)
      }
    }

    return {
      showNotice
    }
  }

  const { showNotice } = useNotificationAnimation()

  // 监听属性变化
  watch(
    () => props.value,
    (newValue) => {
      showNotice(newValue)
    }
  )

  const handleToAlarmList = () => {
    router.push('/warning/message') // 告警列表页面
    // 关闭通知面板
    emit('update:value', false)
  }

  onMounted(() => {
    initWebSocket()
  })

  onBeforeUnmount(() => {
    wsClient?.close()
  })
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .art-notification-panel {
    @apply absolute top-14.5 right-5 w-90 overflow-hidden transition-all duration-300 origin-top max-[640px]:top-[65px] max-[640px]:right-0 max-[640px]:w-full max-[640px]:h-[80vh];
  }

  .bar-active {
    color: var(--theme-color) !important;
    border-bottom: 2px solid var(--theme-color);
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 5px !important;
  }

  .dark .scrollbar-thin::-webkit-scrollbar-track {
    background-color: var(--default-box-color);
  }

  .dark .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #222 !important;
  }
</style>
