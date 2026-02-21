<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增告警规则' : '编辑告警规则'"
    width="600px"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
      <ElFormItem label="规则名称" prop="ruleName">
        <ElInput v-model="form.ruleName" placeholder="例如：隧道火灾-温烟联合" maxlength="32" />
      </ElFormItem>
      <ElFormItem label="危害类型" prop="eventType">
        <ElSelect v-model="form.eventType" placeholder="请选择危害类型" style="width: 100%">
          <ElOption
            v-for="option in eventTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="告警等级" prop="alarmLevel">
        <ElSelect v-model="form.alarmLevel" placeholder="请选择告警等级" style="width: 100%">
          <ElOption
            v-for="option in alarmLevelOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="匹配条件" prop="matchCondition">
        <ElInput
          v-model="matchConditionStr"
          type="textarea"
          :rows="4"
          placeholder='例如：{"confidence": {"min": 0.9}}'
        />
        <div style="margin-top: 8px; font-size: 12px; color: #909399">
          请输入JSON格式的匹配条件
        </div>
      </ElFormItem>
      <ElFormItem label="是否启用" prop="isEnabled">
        <ElRadioGroup v-model="form.isEnabled">
          <ElRadio :value="1">启用</ElRadio>
          <ElRadio :value="0">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { eventTypeOptions, alarmLevelOptions } from '@/config/modules/warning'
  import { AlarmLevel, EventStreamTypeEnum } from '@/enums/formEnum'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    ruleData?: Api.Warning.AlarmRuleListItem | null
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref()
  const submitting = ref(false)

  /**
   * 表单数据
   */
  const form = ref<Api.Warning.AlarmRuleForm>({
    ruleName: '',
    eventType: EventStreamTypeEnum.CAST,
    alarmLevel: AlarmLevel.LOW,
    matchCondition: {
      confidence: {
        min: undefined
      }
    },
    isEnabled: 1,
    remark: ''
  })

  /**
   * 匹配条件的JSON字符串
   */
  const matchConditionStr = ref('')

  /**
   * 显示控制
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  /**
   * 表单校验规则
   */
  const rules = {
    ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
    eventType: [{ required: true, message: '请选择危害类型', trigger: 'change' }],
    alarmLevel: [{ required: true, message: '请选择告警等级', trigger: 'change' }],
    matchCondition: [
      {
        required: true,
        validator: (rule: any, value: any, callback: any) => {
          try {
            const condition = JSON.parse(matchConditionStr.value)
            if (!condition || typeof condition !== 'object') {
              callback(new Error('请输入有效的JSON格式'))
            } else {
              callback()
            }
          } catch {
            callback(new Error('JSON格式错误，请检查'))
          }
        },
        trigger: 'blur'
      }
    ],
    isEnabled: [{ required: true, message: '请选择是否启用', trigger: 'change' }]
  }

  /**
   * 监听弹窗显示，设置回显值
   */
  watch(visible, (newVal) => {
    if (newVal) {
      // 弹窗打开时设置回显值
      if (props.dialogType === 'edit' && props.ruleData) {
        form.value = {
          id: props.ruleData.id,
          ruleName: props.ruleData.ruleName,
          eventType: props.ruleData.eventType,
          alarmLevel: props.ruleData.alarmLevel,
          matchCondition: props.ruleData.matchCondition,
          isEnabled: props.ruleData.isEnabled,
          remark: props.ruleData.remark
        }
        matchConditionStr.value = props.ruleData.matchCondition as unknown as string
      } else if (props.dialogType === 'add') {
        // 新增模式，设置默认值
        resetForm()
      }
    }
  })

  /**
   * 关闭弹窗
   */
  const handleClose = () => {
    emit('update:modelValue', false)
    resetForm()
  }

  /**
   * 重置表单
   */
  const resetForm = () => {
    formRef.value?.resetFields()
    form.value = {
      ruleName: '',
      eventType: EventStreamTypeEnum.CAST,
      alarmLevel: AlarmLevel.LOW,
      matchCondition: {
        confidence: {
          min: undefined
        }
      },
      isEnabled: 1,
      remark: ''
    }
    matchConditionStr.value = ''
  }

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    // 解析匹配条件
    try {
      form.value.matchCondition = JSON.parse(matchConditionStr.value)
    } catch {
      ElMessage.error('匹配条件JSON格式错误')
      return
    }

    submitting.value = true
    try {
      const { alarmRuleAdd, alarmRuleUpdate } = await import('@/api/warning')
      const apiFn = props.dialogType === 'add' ? alarmRuleAdd : alarmRuleUpdate
      await apiFn(form.value)
      ElMessage.success(props.dialogType === 'add' ? '新增成功' : '更新成功')
      emit('success')
      handleClose()
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      submitting.value = false
    }
  }
</script>
