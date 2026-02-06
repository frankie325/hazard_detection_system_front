<template>
  <ElDialog :title="title" v-model="visibleModel" width="500px" :before-close="handleClose">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="部门名称" prop="deptName">
        <ElInput
          v-model="formData.deptName"
          placeholder="请输入部门名称（最多32个字符）"
          maxlength="32"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="上级部门" prop="parentDepartmentId">
        <ElSelect v-model="formData.parentDepartmentId" placeholder="请选择上级部门" clearable>
          <ElOption label="根部门" :value="''" />
          <ElOption
            v-for="item in parentDepartments"
            :key="item.id"
            :label="item.departmentName"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="部门编码" prop="deptCode">
        <ElInput v-model="formData.deptCode" placeholder="请输入部门编码" maxlength="32" />
      </ElFormItem>

      <ElFormItem label="描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          placeholder="请输入部门描述"
          maxlength="200"
          :rows="3"
          show-word-limit
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
  import { ref, computed } from 'vue'
  import { ElForm, ElDialog } from 'element-plus'

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
    departmentData: {
      type: Object as PropType<Partial<Api.SystemManage.DepartmentForm>>,
      default: () => ({})
    }
  })

  const visibleModel = computed({
    get: () => props.visible,
    set: (value) => emits('update:visible', value)
  })
  const emits = defineEmits(['update:visible', 'update:visibleModel', 'submit'])

  const formRef = ref<InstanceType<typeof ElForm>>()
  const formData = ref<Api.SystemManage.DepartmentForm>({
    deptName: '',
    parentDepartmentId: '',
    deptCode: '',
    description: ''
  })

  // 部门列表（模拟数据）
  const parentDepartments = [
    { id: '1', departmentName: '高速公路管理局' },
    { id: '2', departmentName: '监控指挥中心' },
    { id: '3', departmentName: '应急救援中心' },
    { id: '4', departmentName: '路政管理处' },
    { id: '5', departmentName: '养护工程处' },
    { id: '6', departmentName: '收费管理处' }
  ]

  // 表单验证规则
  const rules = {
    departmentName: [
      { required: true, message: '请输入部门名称', trigger: 'blur' },
      { max: 32, message: '部门名称最多32个字符', trigger: 'blur' }
    ],
    parentDepartmentId: [{ message: '请选择上级部门', trigger: 'blur' }]
  }

  // 计算标题
  const title = computed(() => {
    return props.type === 'add' ? '新增部门' : '编辑部门'
  })

  // 监听visible变化
  //   watch(
  //     () => props.visibleModel,
  //     (newVal) => {
  //       if (newVal) {
  //         resetForm()
  //         if (props.type === 'edit') {
  //           formData.value = { ...props.departmentData } as Api.SystemManage.DepartmentForm
  //         }
  //       }
  //     }
  //   )

  /**
   * 重置表单
   */
  //   const resetForm = () => {
  //     formData.value = {
  //       deptName: '',
  //       parentDepartmentId: '',
  //       deptCode: '',
  //       description: ''
  //     } as Api.SystemManage.DepartmentForm
  //     formRef.value?.clearValidate()
  //   }

  /**
   * 关闭弹窗
   */
  const handleClose = () => {
    visibleModel.value = false
  }

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    // await formRef.value.validate((valid) => {
    //   if (valid) {
    //     // TODO: 调用API提交
    //     ElMessage.success(props.type === 'add' ? '新增成功' : '编辑成功')
    //     emits('submit')
    //     handleClose()
    //   } else {
    //     ElMessage.error('请填写完整信息')
    //     return false
    //   }
    // })
  }
</script>
