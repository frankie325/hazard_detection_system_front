<template>
  <ElDialog :title="title" v-model="visibleModel" width="500px" :before-close="handleClose">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="区域名称" prop="areaName">
        <ElInput
          v-model="formData.areaName"
          placeholder="请输入区域名称"
          maxlength="32"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="负责部门" prop="deptName">
        <ElSelect
          v-model="formData.deptName"
          placeholder="请选择负责部门"
          clearable
          @change="handleDeptChange"
        >
          <ElOption
            v-for="item in deptOptions"
            :key="item.id"
            :label="item.deptName"
            :value="item.deptName"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="车道数" prop="laneCount">
        <ElInputNumber
          v-model="formData.laneCount"
          :min="0"
          :max="20"
          placeholder="请输入车道数"
          controls-position="right"
        />
      </ElFormItem>

      <ElFormItem label="长度(KM)" prop="length">
        <ElInputNumber
          v-model="formData.length"
          :min="0"
          :max="1000"
          :precision="2"
          placeholder="请输入长度"
          controls-position="right"
        />
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
  import { ElMessage, ElForm, ElDialog, ElInputNumber, ElSelect, ElOption } from 'element-plus'

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
    areaData: {
      type: Object as PropType<Partial<Api.SystemManage.AreaForm>>,
      default: () => ({})
    }
  })

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const emits = defineEmits<Emits>()

  const visibleModel = computed({
    get: () => props.visible,
    set: (value) => emits('update:visible', value)
  })

  const formRef = ref<InstanceType<typeof ElForm>>()
  const formData = ref<Api.SystemManage.AreaForm>({
    id: undefined,
    areaName: '',
    deptId: 0,
    deptName: '',
    length: undefined,
    laneCount: undefined
  })

  const deptOptions = ref([
    { id: 1, deptName: '京哈高速管理处' },
    { id: 2, deptName: '京沪高速管理处' },
    { id: 3, deptName: '京港澳高速管理处' },
    { id: 4, deptName: '大广高速管理处' }
  ])

  const rules = {
    areaName: [
      { required: true, message: '请输入区域名称', trigger: 'blur' },
      { max: 32, message: '区域名称最多32个字符', trigger: 'blur' }
    ],
    deptName: [{ required: true, message: '请选择负责部门', trigger: 'change' }]
  }

  const title = computed(() => {
    return props.type === 'add' ? '新增区域' : '编辑区域'
  })

  const handleDeptChange = (value: string) => {
    const dept = deptOptions.value.find((item) => item.deptName === value)
    if (dept) {
      formData.value.deptId = dept.id
    }
  }

  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        if (props.type === 'edit' && props.areaData) {
          formData.value = { ...props.areaData } as Api.SystemManage.AreaForm
        } else {
          formData.value = {
            id: undefined,
            areaName: '',
            deptId: 0,
            deptName: '',
            length: undefined,
            laneCount: undefined
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
      ElMessage.success(props.type === 'add' ? '新增成功' : '编辑成功')
      emits('submit')
      handleClose()
    } else {
      ElMessage.error('请填写完整信息')
    }
  }
</script>
