<!-- 用户管理页面 -->
<template>
  <div class="art-full-height">
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增用户</ElButton>
            <ElButton
              @click="handleBatchDelete"
              :disabled="!selectedRows.length"
              v-ripple
              type="danger"
            >
              删除
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
        @selection-change="handleSelectionChange"
      >
      </ArtTable>

      <UserDialog
        v-model="dialogVisible"
        :dialog-type="dialogType"
        :user-data="currentUserData"
        @success="refreshData"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { userList, userDeleteById, userBatchDelete } from '@/api/system-manage'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import type { DialogType } from '@/types'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem

  const searchForm = ref({
    username: undefined,
    roleName: undefined,
    deptName: undefined
  })

  const selectedRows = ref<UserListItem[]>([])

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<UserListItem | undefined>(undefined)

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: userList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection' },
        { prop: 'id', label: '用户ID', width: 100 },
        { prop: 'username', label: '用户名', minWidth: 120 },
        { prop: 'phone', label: '手机号', minWidth: 120 },
        {
          prop: 'gender',
          label: '性别',
          width: 80,
          formatter: (row) => (row.gender === 'M' ? '男' : '女')
        },
        { prop: 'roleName', label: '所属角色', minWidth: 120 },
        { prop: 'deptName', label: '所属部门', minWidth: 120 },
        { prop: 'remark', label: '备注', minWidth: 150, showOverflowTooltip: true },
        { prop: 'createTime', label: '创建日期', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row) =>
            h('div', [
              h(ArtButtonTable, { type: 'edit', onClick: () => showDialog('edit', row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => deleteUser(row) })
            ])
        }
      ]
    }
  })

  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    refreshData()
  }

  const handleSelectionChange = (selection: UserListItem[]) => {
    selectedRows.value = selection
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个用户吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      const ids = selectedRows.value.map((item) => item.id)
      await userBatchDelete(ids)
      ElMessage.success(`已成功删除 ${selectedRows.value.length} 个用户`)
      selectedRows.value = []
      refreshData()
    })
  }

  const showDialog = (type: DialogType, row?: UserListItem) => {
    dialogType.value = type
    currentUserData.value = row
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const deleteUser = (row: UserListItem) => {
    ElMessageBox.confirm(`确定要删除该用户吗？`, '删除用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await userDeleteById(row.id)
      ElMessage.success('删除成功')
      refreshData()
    })
  }
</script>
