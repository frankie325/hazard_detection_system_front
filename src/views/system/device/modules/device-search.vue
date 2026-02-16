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
  import { DeviceTypeEnum, DeviceStatusEnum } from '@/enums/formEnum'

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
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const rules = {}

  const formItems = [
    {
      label: '设备名称',
      key: 'deviceName',
      type: 'input',
      placeholder: '请输入设备名称',
      clearable: true
    },
    {
      label: '设备编码',
      key: 'deviceCode',
      type: 'input',
      props: { placeholder: '请输入设备编码' }
    },
    {
      label: '设备类型',
      key: 'deviceType',
      type: 'select',
      props: {
        placeholder: '请选择设备类型',
        options: [
          { label: '摄像头', value: DeviceTypeEnum.CAMERA },
          { label: '传感器', value: DeviceTypeEnum.SENSOR }
        ]
      }
    },
    {
      label: '设备状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择设备状态',
        options: [
          { label: '在线', value: DeviceStatusEnum.ONLINE },
          { label: '离线', value: DeviceStatusEnum.OFFLINE },
          { label: '维护', value: DeviceStatusEnum.MAINTENANCE }
        ]
      }
    }
  ]

  function handleReset() {
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }
</script>
