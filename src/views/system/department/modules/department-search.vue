<template>
  <div class="department-search">
    <ElForm :model="form" ref="formRef" :inline="true">
      <ElFormItem label="部门名称" prop="departmentName">
        <ElInput
          v-model="form.departmentName"
          placeholder="请输入部门名称"
          clearable
          @keyup.enter="handleSearch"
        />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElSelect v-model="form.status" placeholder="请选择状态" clearable>
          <ElOption label="全部" :value="''" />
          <ElOption label="正常" :value="'1'" />
          <ElOption label="禁用" :value="'0'" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem>
        <ElButton type="primary" @click="handleSearch">搜索</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { ElForm } from 'element-plus'

  const emits = defineEmits(['search', 'reset'])

  const formRef = ref<InstanceType<typeof ElForm>>()
  const form = ref({
    departmentName: undefined,
    status: '1'
  })

  /**
   * 搜索处理
   */
  const handleSearch = () => {
    emits('search', form.value)
  }

  /**
   * 重置表单
   */
  const handleReset = () => {
    formRef.value?.resetFields()
    emits('reset')
  }

  /**
   * 监听表单变化，自动触发搜索
   */
  watch(
    form,
    () => {
      handleSearch()
    },
    { deep: true }
  )
</script>

<style scoped lang="scss">
  .department-search {
    padding: 16px;
    background-color: #f5f7fa;

    :deep(.el-form) {
      margin-bottom: 0;
    }
  }
</style>
