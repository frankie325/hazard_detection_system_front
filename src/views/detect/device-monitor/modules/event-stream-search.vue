<template>
  <ArtSearchBar
    :span="8"
    ref="searchBarRef"
    :show-expand="false"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  import { EventStreamTypeEnum } from '@/enums/formEnum'

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
   * 事件类型选项
   */
  const eventTypeOptions = [
    { label: '抛洒物', value: EventStreamTypeEnum.CAST },
    { label: '火灾', value: EventStreamTypeEnum.FIRE },
    { label: '塌方', value: EventStreamTypeEnum.LANDSLIDE },
    { label: '交通事故', value: EventStreamTypeEnum.TRAFFIC_ACCIDENT }
  ]

  /**
   * 搜索表单配置项
   */
  const formItems = [
    {
      label: '事件名称',
      key: 'eventName',
      type: 'input',
      placeholder: '请输入事件名称',
      clearable: true
    },
    {
      label: '事件类型',
      key: 'eventType',
      type: 'select',
      placeholder: '请选择事件类型',
      clearable: true,
      props: {
        options: eventTypeOptions
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
