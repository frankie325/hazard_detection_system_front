<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
    width="500px"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem label="用户名" prop="username">
        <ElInput v-model="form.username" placeholder="请输入用户名" />
      </ElFormItem>
      <ElFormItem label="真实姓名" prop="name">
        <ElInput v-model="form.name" placeholder="请输入真实姓名" />
      </ElFormItem>
      <ElFormItem label="性别" prop="gender">
        <ElSelect v-model="form.gender" placeholder="请选择性别" style="width: 100%">
          <ElOption label="男" value="M" />
          <ElOption label="女" value="F" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="手机号" prop="phone">
        <ElInput v-model="form.phone" placeholder="请输入手机号" />
      </ElFormItem>
      <ElFormItem label="身份证号" prop="idCard">
        <ElInput v-model="form.idCard" placeholder="请输入身份证号" />
      </ElFormItem>
      <ElFormItem v-if="dialogType === 'add'" label="密码" prop="password">
        <ElInput v-model="form.password" type="password" placeholder="请输入密码" show-password />
      </ElFormItem>
      <ElFormItem label="所属角色" prop="roleId">
        <ElSelect v-model="form.roleId" placeholder="请选择所属角色" style="width: 100%">
          <ElOption
            v-for="role in roleList"
            :key="role.id"
            :label="role.roleName"
            :value="role.id"
          />
        </ElSelect>
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
  import { allRoleList, userAdd, userUpdate } from '@/api/system-manage'
  import { GenderEnum } from '@/enums/formEnum'

  type UserListItem = Api.SystemManage.UserListItem
  type UserForm = Api.SystemManage.UserForm

  interface Props {
    modelValue: boolean
    dialogType: DialogType
    userData?: UserListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    userData: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()

  const roleList = ref<Api.SystemManage.RoleListItem[]>([])

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const rules = reactive<FormRules>({
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 32, message: '长度在 2 到 32 个字符', trigger: 'blur' }
    ],
    name: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    idCard: [
      { required: true, message: '请输入身份证号', trigger: 'blur' },
      {
        pattern:
          /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
        message: '请输入正确的身份证号格式',
        trigger: 'blur'
      }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    roleId: [{ required: true, message: '请选择所属角色', trigger: 'change' }],
    remark: []
  })

  const form = reactive<UserForm>({
    id: undefined,
    name: '',
    gender: GenderEnum.MALE,
    username: '',
    password: '',
    phone: '',
    idCard: '',
    roleId: undefined,
    remark: ''
  })

  const loadRoleList = async () => {
    try {
      const data = await allRoleList()
      roleList.value = data
    } catch (error) {
      console.error('加载角色列表失败:', error)
    }
  }

  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) {
        initForm()
        loadRoleList()
      }
    }
  )

  watch(
    () => props.userData,
    (newData) => {
      if (newData && props.modelValue) initForm()
    },
    { deep: true }
  )

  const initForm = () => {
    if (props.dialogType === 'edit' && props.userData) {
      Object.assign(form, {
        id: props.userData.id,
        username: props.userData.username,
        name: props.userData.name,
        gender: props.userData.gender,
        phone: props.userData.phone,
        idCard: props.userData.idCard,
        roleId: props.userData.roleId,
        remark: props.userData.remark
      })
    } else {
      Object.assign(form, {
        id: undefined,
        username: '',
        name: '',
        gender: GenderEnum.MALE,
        password: '',
        phone: '',
        idCard: '',
        roleId: undefined,
        remark: ''
      })
    }
  }

  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      if (props.dialogType === 'add') {
        await userAdd(form)
      } else {
        await userUpdate(form)
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
