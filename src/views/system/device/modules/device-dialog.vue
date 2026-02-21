<template>
  <ElDialog :title="title" v-model="visibleModel" width="500px" :before-close="handleClose">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="设备名称" prop="deviceName">
        <ElInput
          v-model="formData.deviceName"
          placeholder="请输入设备名称，如:隧道摄像头A-01"
          maxlength="32"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="设备编码" prop="deviceCode">
        <ElInput
          v-model="formData.deviceCode"
          placeholder="请输入设备编码，如:CAM-A-01"
          maxlength="32"
        />
      </ElFormItem>

      <ElFormItem label="设备类型" prop="deviceType">
        <ElSelect v-model="formData.deviceType" placeholder="请选择设备类型">
          <ElOption
            v-for="item in deviceTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="应用规则" prop="alarmRuleId">
        <ElSelect v-model="formData.alarmRuleId" placeholder="请选择应用规则">
          <ElOption
            v-for="item in alarmRuleOptions"
            :key="item.id"
            :label="item.ruleName"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="设备型号" prop="model">
        <ElInput
          v-model="formData.model"
          placeholder="请输入设备型号，如:HIKVISION DS-2CD3T45"
          maxlength="64"
        />
      </ElFormItem>

      <ElFormItem label="安装位置" prop="location">
        <ElInput
          v-model="formData.location"
          placeholder="请输入安装位置，如:隧道入口左侧护栏"
          maxlength="100"
        />
      </ElFormItem>

      <ElFormItem label="IP地址" prop="ipAddress">
        <ElInput v-model="formData.ipAddress" placeholder="请输入IP地址，如:192.168.1.10" />
      </ElFormItem>

      <ElFormItem label="所属区域" prop="areaName">
        <ElInput v-model="areaNameText" disabled placeholder="请先选择区域" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElMessage, ElForm, ElDialog } from 'element-plus'
  import { DeviceTypeEnum } from '@/enums/formEnum'
  import { deviceAdd, deviceUpdate } from '@/api/system-manage'
  import { allAlarmRule } from '@/api/warning'

  const props = defineProps({
    visible: {
      type: Boolean,
      required: true
    },
    type: {
      type: String,
      required: true,
      validator: (value: string) => ['add', 'edit'].includes(value)
    },
    deviceData: {
      type: Object as PropType<Partial<Api.SystemManage.DeviceForm>>,
      default: () => ({})
    },
    areaData: {
      type: Object as PropType<Api.SystemManage.AreaListItem | null>,
      default: null
    }
  })

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const emits = defineEmits<Emits>()

  // 设备类型选项
  const deviceTypeOptions = [
    { label: '摄像头', value: DeviceTypeEnum.CAMERA },
    { label: '传感器', value: DeviceTypeEnum.SENSOR }
  ]

  const visibleModel = computed({
    get: () => props.visible,
    set: (value) => emits('update:visible', value)
  })

  const formRef = ref<InstanceType<typeof ElForm>>()
  const alarmRuleOptions = ref<Api.Warning.AlarmRuleListItem[]>([])
  const formData = ref<Api.SystemManage.DeviceForm>({
    id: undefined,
    deviceName: '',
    deviceCode: '',
    deviceType: DeviceTypeEnum.CAMERA,
    model: '',
    location: '',
    ipAddress: '',
    areaId: 0,
    areaName: '',
    alarmRuleId: 0
  })

  const areaNameText = computed(() => {
    return props.areaData ? props.areaData.areaName : ''
  })

  const rules = {
    deviceName: [
      { required: true, message: '请输入设备名称', trigger: 'blur' },
      { max: 32, message: '设备名称最多32个字符', trigger: 'blur' }
    ],
    deviceCode: [
      { required: true, message: '请输入设备编码', trigger: 'blur' },
      { max: 32, message: '设备编码最多32个字符', trigger: 'blur' }
    ],
    deviceType: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
    alarmRuleId: [{ required: true, message: '请选择应用规则', trigger: 'change' }]
  }

  const loadAlarmRuleOptions = async () => {
    try {
      const data = await allAlarmRule()
      alarmRuleOptions.value = data || []
    } catch (error) {
      console.error('加载应用规则失败', error)
    }
  }

  const title = computed(() => {
    return props.type === 'add' ? '新增设备' : '编辑设备'
  })

  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        loadAlarmRuleOptions()
        if (props.type === 'edit' && props.deviceData) {
          formData.value = { ...props.deviceData } as Api.SystemManage.DeviceForm
        } else {
          formData.value = {
            id: undefined,
            deviceName: '',
            deviceCode: '',
            deviceType: DeviceTypeEnum.CAMERA,
            model: '',
            location: '',
            ipAddress: '',
            areaId: props.areaData?.id || 0,
            areaName: props.areaData?.areaName || '',
            alarmRuleId: undefined
          }
        }
        formRef.value?.clearValidate()
      }
    },
    { immediate: true }
  )

  const handleClose = () => {
    visibleModel.value = false
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (valid) {
      try {
        if (props.type === 'add') {
          await deviceAdd(formData.value)
          ElMessage.success('新增成功')
        } else {
          await deviceUpdate(formData.value)
          ElMessage.success('编辑成功')
        }
        handleClose()
        emits('submit')
      } catch (error) {
        console.error(error)
      }
    } else {
      ElMessage.error('请填写完整信息')
    }
  }
</script>
