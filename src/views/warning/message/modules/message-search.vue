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
  import { eventTypeOptions, alarmLevelOptions } from '@/config/modules/warning'

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
   * 告警状态选项
   */
  const statusOptions = [
    { label: '开启', value: 'OPEN' },
    { label: '处理中', value: 'PROCESSING' },
    { label: '已关闭', value: 'CLOSED' }
  ]

  /**
   * 搜索表单配置项
   */
  const formItems = [
    {
      label: '告警名称',
      key: 'alarmName',
      type: 'input',
      placeholder: '请输入告警名称',
      clearable: true
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
      label: '告警分类',
      key: 'eventType',
      type: 'select',
      placeholder: '请选择告警分类',
      clearable: true,
      props: {
        options: eventTypeOptions
      }
    },
    {
      label: '告警状态',
      key: 'status',
      type: 'select',
      placeholder: '请选择告警状态',
      clearable: true,
      props: {
        options: statusOptions
      }
    },
    {
      label: '开始时间',
      key: 'startTime',
      type: 'date',
      placeholder: 'YYYY/MM/DD',
      valueFormat: 'YYYY-MM-DD',
      clearable: true
    },
    {
      label: '结束时间',
      key: 'endTime',
      type: 'date',
      placeholder: 'YYYY/MM/DD',
      valueFormat: 'YYYY-MM-DD',
      clearable: true
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
