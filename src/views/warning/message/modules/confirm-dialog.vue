<!-- 确认告警弹窗 -->
<template>
  <ElDialog
    v-model="visible"
    title="确认告警"
    width="480px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="confirm-content">
      <ElAlert type="warning" :closable="false" show-icon>
        <template #title>
          <span class="confirm-text">确认生成应急事件吗？</span>
        </template>
      </ElAlert>
      <div v-if="alarmData" class="alarm-info">
        <div class="info-item">
          <span class="label">告警名称：</span>
          <span class="value">{{ alarmData.alarmName }}</span>
        </div>
        <div class="info-item">
          <span class="label">告警等级：</span>
          <ElTag :type="getLevelType(alarmData.alarmLevel)" size="small">
            {{ getLevelLabel(alarmData.alarmLevel) }}
          </ElTag>
        </div>
        <div class="info-item">
          <span class="label">发生时间：</span>
          <span class="value">{{ alarmData.createTime }}</span>
        </div>
      </div>
      <!-- 处置部门选择 -->
      <ElForm ref="formRef" :model="form" :rules="rules" class="dept-form">
        <ElFormItem label="处置部门" prop="deptId">
          <ElTreeSelect
            v-model="form.deptId"
            :data="departmentList"
            :props="{ label: 'deptName', value: 'id', children: 'children' }"
            placeholder="请选择处置部门"
            :loading="deptLoading"
            clearable
            check-strictly
            style="width: 100%"
          />
        </ElFormItem>
      </ElForm>
    </div>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleConfirm">确认</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { AlarmLevel } from '@/enums/formEnum'
  import { alarmMessageConfirm } from '@/api/warning'
  import { departmentTreeList } from '@/api/system-manage'

  defineOptions({ name: 'ConfirmDialog' })

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

  const formRef = ref<FormInstance>()
  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const loading = ref(false)
  const deptLoading = ref(false)
  const departmentList = ref<Api.SystemManage.DepartmentListItem[]>([])

  // 表单数据
  const form = reactive({
    deptId: undefined as number | undefined
  })

  // 表单验证规则
  const rules = reactive<FormRules>({
    deptId: [{ required: true, message: '请选择处置部门', trigger: 'change' }]
  })

  const levelMap: Record<AlarmLevel, { label: string; type: 'info' | 'warning' | 'danger' }> = {
    [AlarmLevel.LOW]: { label: '低级', type: 'info' },
    [AlarmLevel.MEDIUM]: { label: '中级', type: 'warning' },
    [AlarmLevel.HIGH]: { label: '高级', type: 'danger' },
    [AlarmLevel.EMERGENCY]: { label: '紧急', type: 'danger' }
  }

  const getLevelLabel = (level: AlarmLevel) => levelMap[level]?.label || level
  const getLevelType = (level: AlarmLevel) => levelMap[level]?.type || 'info'

  // 加载部门列表
  const loadDepartmentList = async () => {
    try {
      deptLoading.value = true
      const res = await departmentTreeList()
      departmentList.value = res
    } catch (error) {
      console.error('加载部门列表失败:', error)
    } finally {
      deptLoading.value = false
    }
  }

  // 监听弹窗打开，加载部门数据
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) {
        loadDepartmentList()
        // 重置表单
        form.deptId = undefined
      }
    }
  )

  const handleConfirm = async () => {
    if (!props.alarmData) return

    // 验证表单
    try {
      await formRef.value?.validate()
    } catch {
      return
    }

    loading.value = true
    try {
      await alarmMessageConfirm({ alarmId: props.alarmData.id, deptId: form.deptId as number })
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
    formRef.value?.resetFields()
  }
</script>

<style lang="scss" scoped>
  .confirm-content {
    .confirm-text {
      font-weight: 500;
    }

    .alarm-info {
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

    .dept-form {
      margin-top: 16px;
    }
  }
</style>
