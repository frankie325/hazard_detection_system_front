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

      <ElFormItem label="负责部门" prop="deptId">
        <ElTreeSelect
          v-model="formData.deptId"
          :data="departmentList"
          :props="{ label: 'deptName', value: 'id', children: 'children' }"
          placeholder="请选择负责部门"
          :loading="loading"
          clearable
          check-strictly
          style="width: 100%"
        />
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
  import { ref, computed, watch, onMounted } from 'vue'
  import { ElMessage, ElForm, ElDialog, ElInputNumber, ElTreeSelect } from 'element-plus'
  import { departmentTreeList } from '@/api/system-manage'

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
    (e: 'submit', data: Api.SystemManage.AreaForm): void
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
    deptId: undefined,
    deptName: '',
    length: undefined,
    laneCount: undefined
  })

  const loading = ref(false)
  const departmentList = ref<Api.SystemManage.DepartmentListItem[]>([])

  const rules = {
    areaName: [
      { required: true, message: '请输入区域名称', trigger: 'blur' },
      { max: 32, message: '区域名称最多32个字符', trigger: 'blur' }
    ],
    deptId: [{ required: true, message: '请选择负责部门', trigger: 'change' }]
  }

  const title = computed(() => {
    return props.type === 'add' ? '新增区域' : '编辑区域'
  })

  const loadDepartmentList = async () => {
    loading.value = true
    try {
      departmentList.value = await departmentTreeList()
    } catch (error) {
      console.error('加载部门列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadDepartmentList()
  })

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
            deptId: undefined,
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
      emits('submit', formData.value)
      handleClose()
    } else {
      ElMessage.error('请填写完整信息')
    }
  }
</script>
