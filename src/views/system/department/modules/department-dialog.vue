<template>
  <ElDialog :title="title" v-model="visibleModel" width="500px" :before-close="handleClose">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="部门名称" prop="deptName">
        <ElInput
          v-model="formData.deptName"
          placeholder="请输入部门名称"
          maxlength="32"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="上级部门" prop="parentId">
        <ElTreeSelect
          v-model="formData.parentId"
          :data="departmentOptions"
          :props="treeProps"
          :render-after-expand="false"
          placeholder="请选择上级部门"
          clearable
          check-strictly
          node-key="id"
        />
      </ElFormItem>

      <ElFormItem label="部门编码" prop="deptCode">
        <ElInput v-model="formData.deptCode" placeholder="请输入部门编码" maxlength="32" />
      </ElFormItem>

      <ElFormItem label="备注" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          placeholder="请输入备注"
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
  import { ref, computed, watch } from 'vue'
  import type { PropType } from 'vue'
  import { ElMessage, ElForm, ElDialog, ElTreeSelect } from 'element-plus'
  import { departmentTreeList, departmentAdd, departmentUpdate } from '@/api/system-manage'

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
  const formData = ref<Api.SystemManage.DepartmentForm>({
    id: undefined,
    parentId: undefined,
    deptName: '',
    deptCode: '',
    description: ''
  })
  const departmentOptions = ref<Api.SystemManage.DepartmentListItem[]>([])

  // 树选择器配置
  const treeProps = {
    label: 'deptName',
    value: 'id',
    children: 'children'
  }

  // 表单验证规则
  const rules = {
    deptName: [
      { required: true, message: '请输入部门名称', trigger: 'blur' },
      { max: 32, message: '部门名称最多32个字符', trigger: 'blur' }
    ],
    deptCode: [{ required: true, message: '请输入部门编码', trigger: 'blur' }]
  }

  // 计算标题
  const title = computed(() => {
    return props.type === 'add' ? '新增部门' : '编辑部门'
  })

  // 监听visible变化，初始化表单数据
  watch(
    () => props.visible,
    (newVal) => {
      // 初始化获取部门选项
      if (newVal) {
        getDepartmentOptions()
        if (props.type === 'edit' && props.departmentData) {
          formData.value = { ...props.departmentData } as Api.SystemManage.DepartmentForm
          if (props.departmentData.parentId === 0) formData.value.parentId = undefined
        } else {
          formData.value = {
            id: undefined,
            parentId: undefined,
            deptName: '',
            deptCode: '',
            description: ''
          }
        }
        formRef.value?.clearValidate()
      }
    },
    { immediate: true }
  )

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

    const valid = await formRef.value.validate().catch(() => false)
    if (valid) {
      try {
        if (props.type === 'add') {
          await departmentAdd(formData.value)
          ElMessage.success('新增成功')
        } else {
          await departmentUpdate(formData.value)
          ElMessage.success('编辑成功')
        }
        emits('submit')
        handleClose()
      } catch (error) {
        console.error('提交失败:', error)
      }
    }
  }

  /**
   * @description: 获取部门选项数据
   */
  async function getDepartmentOptions() {
    const res = await departmentTreeList()
    departmentOptions.value = res
  }
</script>
