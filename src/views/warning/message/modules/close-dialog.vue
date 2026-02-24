<!-- 关闭告警弹窗 -->
<template>
  <ElDialog
    v-model="visible"
    title="填写处理结果"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem label="关闭原因" prop="closeReason">
        <ElInput
          v-model="form.closeReason"
          placeholder="请输入关闭原因"
          maxlength="200"
          show-word-limit
        />
      </ElFormItem>
      <ElFormItem label="处理结果/备注" prop="processingResult">
        <ElInput
          v-model="form.processingResult"
          type="textarea"
          :rows="4"
          placeholder="请输入处理结果或补充说明(可选)"
          maxlength="500"
          show-word-limit
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">保存并关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { alarmMessageClose } from '@/api/warning'

  defineOptions({ name: 'CloseDialog' })

  interface Props {
    modelValue: boolean
    alarmData: Api.Warning.AlarmMessageListItem | null
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

  const formRef = ref()
  const loading = ref(false)

  const form = ref({
    closeReason: '',
    processingResult: ''
  })

  const rules = {
    closeReason: [{ required: true, message: '请输入关闭原因', trigger: 'blur' }]
  }

  const handleSubmit = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid || !props.alarmData) return

    loading.value = true
    try {
      await alarmMessageClose({
        id: props.alarmData.id,
        alarmStatus: 'CLOSED',
        closeReason: form.value.closeReason,
        processingResult: form.value.processingResult
      })
      ElMessage.success('关闭成功')
      emit('success')
      handleClose()
    } catch (error) {
      console.error('关闭失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleClose = () => {
    formRef.value?.resetFields()
    visible.value = false
  }
</script>
