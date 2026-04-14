<!-- 关闭事件弹窗 -->
<template>
  <ElDialog
    v-model="visible"
    title="关闭事件"
    width="480px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem label="关闭原因" prop="remark">
        <ElInput
          v-model="form.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入关闭原因或处理结果"
          maxlength="500"
          show-word-limit
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确认关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { TimelineType } from '@/enums/formEnum'
  import { updateStatus } from '@/api/emergency'

  defineOptions({ name: 'CloseDialog' })

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

  const formRef = ref<FormInstance>()
  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const loading = ref(false)
  const form = reactive({
    remark: ''
  })

  const rules: FormRules = {
    remark: [{ required: true, message: '请输入关闭原因', trigger: 'blur' }]
  }

  const handleSubmit = async () => {
    if (!props.event) return

    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    try {
      await updateStatus({
        eventId: props.event.id,
        actionType: TimelineType.CLOSED,
        remark: form.remark
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
    visible.value = false
    formRef.value?.resetFields()
  }
</script>
