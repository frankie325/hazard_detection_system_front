<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
    width="500px"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
      <ElFormItem label="角色名称" prop="roleName">
        <ElInput v-model="form.roleName" placeholder="请输入角色名称" />
      </ElFormItem>
      <ElFormItem label="所属部门" prop="deptId">
        <ElTreeSelect
          v-model="form.deptId"
          :data="departmentList"
          :props="{ label: 'deptName', value: 'id', children: 'children' }"
          placeholder="请选择所属部门"
          :loading="loading"
          clearable
          check-strictly
          style="width: 100%"
        />
      </ElFormItem>
      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { DialogType } from '@/types'
  import type { FormInstance, FormRules } from 'element-plus'
  import { departmentTreeList, roleAdd, roleUpdate } from '@/api/system-manage'

  type RoleListItem = Api.SystemManage.RoleListItem
  type RoleForm = Api.SystemManage.RoleForm

  interface Props {
    modelValue: boolean
    dialogType: DialogType
    roleData?: RoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()

  // 部门列表
  const departmentList = ref<any[]>([])
  const loading = ref(false)

  /**
   * 弹窗显示状态双向绑定
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /**
   * 表单验证规则
   */
  const rules = reactive<FormRules>({
    roleName: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 32, message: '长度在 2 到 32 个字符', trigger: 'blur' }
    ],
    deptId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
    remark: [{ required: true, message: '请输入备注', trigger: 'blur' }]
  })

  /**
   * 表单数据
   */
  const form = reactive<RoleForm>({
    id: undefined,
    roleName: '',
    deptId: undefined,
    remark: ''
  })

  /**
   * 加载部门列表
   */
  const loadDepartmentList = async () => {
    try {
      loading.value = true
      const res = await departmentTreeList()
      departmentList.value = res
    } catch (error) {
      console.error('加载部门列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 监听弹窗打开，初始化表单数据
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) {
        initForm()
        loadDepartmentList()
      }
    }
  )

  /**
   * 监听角色数据变化，更新表单
   */
  watch(
    () => props.roleData,
    (newData) => {
      if (newData && props.modelValue) initForm()
    },
    { deep: true }
  )

  /**
   * 初始化表单数据
   * 根据弹窗类型填充表单或重置表单
   */
  const initForm = () => {
    if (props.dialogType === 'edit' && props.roleData) {
      Object.assign(form, {
        id: props.roleData.id,
        roleName: props.roleData.roleName,
        deptId: props.roleData.deptId,
        remark: props.roleData.remark
      })
    } else {
      Object.assign(form, {
        id: undefined,
        roleName: '',
        deptId: undefined,
        remark: ''
      })
    }
  }

  /**
   * 关闭弹窗并重置表单
   */
  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  /**
   * 提交表单
   * 验证通过后调用接口保存数据
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      if (props.dialogType === 'add') {
        await roleAdd(form)
      } else {
        await roleUpdate(form)
      }
      const message = props.dialogType === 'add' ? '新增成功' : '修改成功'
      ElMessage.success(message)
      emit('success')
      handleClose()
    } catch (error) {
      console.log('表单验证失败或接口调用失败:', error)
    }
  }
</script>
