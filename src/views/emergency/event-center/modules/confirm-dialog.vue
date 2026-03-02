<!-- 确认事件弹窗 -->
<template>
  <ElDialog
    v-model="visible"
    title="确认事件"
    width="420px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="confirm-content">
      <ElAlert type="info" :closable="false" show-icon>
        <template #title>
          <span class="confirm-text">确认该应急事件？</span>
        </template>
      </ElAlert>
      <div v-if="event" class="event-info">
        <div class="info-item">
          <span class="label">事件名称：</span>
          <span class="value">{{ event.eventName }}</span>
        </div>
        <div class="info-item">
          <span class="label">事件等级：</span>
          <ElTag :type="getLevelType(event.eventLevel)" size="small">
            {{ event.eventLevelName }}
          </ElTag>
        </div>
        <div class="info-item">
          <span class="label">事件类型：</span>
          <span class="value">{{ event.eventTypeName }}</span>
        </div>
        <div class="info-item">
          <span class="label">地点：</span>
          <span class="value">{{ event.location }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleConfirm">确认</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { AlarmLevel, TimelineType } from '@/enums/formEnum'
  import { updateStatus } from '@/api/emergency'

  defineOptions({ name: 'ConfirmDialog' })

  interface Props {
    modelValue: boolean
    event: Api.Emergency.EventListItem | null
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const loading = ref(false)

  const levelMap: Record<AlarmLevel, { label: string; type: 'info' | 'warning' | 'danger' }> = {
    [AlarmLevel.LOW]: { label: '低级', type: 'info' },
    [AlarmLevel.MEDIUM]: { label: '中级', type: 'warning' },
    [AlarmLevel.HIGH]: { label: '高级', type: 'danger' },
    [AlarmLevel.EMERGENCY]: { label: '紧急', type: 'danger' }
  }

  const getLevelType = (level: AlarmLevel) => levelMap[level]?.type || 'info'

  const handleConfirm = async () => {
    if (!props.event) return

    loading.value = true
    try {
      await updateStatus({
        eventId: props.event.id,
        actionType: TimelineType.CONFIRM
      })
      ElMessage.success('确认成功')
      emit('success')
      handleClose()
    } catch (error) {
      console.error('确认失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleClose = () => {
    visible.value = false
  }
</script>

<style lang="scss" scoped>
  .confirm-content {
    .confirm-text {
      font-weight: 500;
    }

    .event-info {
      padding: 16px;
      margin-top: 16px;
      background: var(--el-fill-color-light);
      border-radius: 8px;

      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          min-width: 80px;
          color: var(--el-text-color-secondary);
        }

        .value {
          color: var(--el-text-color-primary);
        }
      }
    }
  }
</style>
