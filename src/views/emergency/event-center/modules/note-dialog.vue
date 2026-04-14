<!-- 行动备注弹窗 -->
<template>
  <ElDialog
    v-model="visible"
    title="添加行动备注"
    width="480px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="80px">
      <ElFormItem label="备注内容" prop="content">
        <ElInput
          v-model="form.content"
          type="textarea"
          :rows="4"
          placeholder="请输入备注内容"
          maxlength="500"
          show-word-limit
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { TimelineType } from '@/enums/formEnum'
  import { updateStatus } from '@/api/emergency'

  defineOptions({ name: 'NoteDialog' })

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
    content: ''
  })

  const rules: FormRules = {
    content: [{ required: true, message: '请输入备注内容', trigger: 'blur' }]
  }

  const handleSubmit = async () => {
    if (!props.event) return

    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    try {
      await updateStatus({
        eventId: props.event.id,
        actionType: TimelineType.REMARK,
        remark: form.content
      })
      ElMessage.success('添加成功')
      emit('success')
      handleClose()
    } catch (error) {
      console.error('添加备注失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }
</script>
