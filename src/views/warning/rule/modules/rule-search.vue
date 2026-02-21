<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  import { eventTypeOptions, alarmLevelOptions, enabledOptions } from '@/config/modules/warning'

  interface Props {
    modelValue: Record<string, any>
  }

  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const searchBarRef = ref()

  /**
   * 表单数据双向绑定
   */
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  /**
   * 表单校验规则
   */
  const rules = {}

  /**
   * 搜索表单配置项
   */
  const formItems = [
    {
      label: '规则名称',
      key: 'ruleName',
      type: 'input',
      placeholder: '请输入规则名称',
      clearable: true
    },
    {
      label: '危害类型',
      key: 'eventType',
      type: 'select',
      placeholder: '请选择危害类型',
      clearable: true,
      props: {
        options: eventTypeOptions
      }
    },
    {
      label: '告警等级',
      key: 'alarmLevel',
      type: 'select',
      placeholder: '请选择告警等级',
      clearable: true,
      props: {
        options: alarmLevelOptions
      }
    },
    {
      label: '是否启用',
      key: 'isEnabled',
      type: 'select',
      placeholder: '请选择状态',
      clearable: true,
      props: {
        options: enabledOptions
      }
    }
  ]

  /**
   * 处理重置事件
   */
  const handleReset = () => {
    emit('reset')
  }

  /**
   * 处理搜索事件
   * 验证表单后触发搜索
   */
  const handleSearch = async () => {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }
</script>
