<!-- 角色管理页面 -->
<template>
  <div class="art-full-height">
    <RoleSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></RoleSearch>

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增角色</ElButton>
            <ElButton
              @click="handleBatchDelete"
              :disabled="!selectedRows.length"
              v-ripple
              type="danger"
              >删除</ElButton
            >
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
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
    </ElCard>

    <!-- 角色编辑弹窗 -->
    <RoleEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :role-data="currentRoleData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { roleList, roleDeleteById, roleBatchDelete } from '@/api/system-manage'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import RoleSearch from './modules/role-search.vue'
  import RoleEditDialog from './modules/role-edit-dialog.vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import type { DialogType } from '@/types'

  defineOptions({ name: 'Role' })

  type RoleListItem = Api.SystemManage.RoleListItem

  // 搜索表单
  const searchForm = ref({
    roleName: undefined,
    deptName: undefined
  })

  // 选中行
  const selectedRows = ref<RoleListItem[]>([])

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentRoleData = ref<RoleListItem | undefined>(undefined)

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: roleList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection' },
        {
          prop: 'id',
          label: '角色ID',
          width: 100
        },
        {
          prop: 'roleName',
          label: '角色名称',
          minWidth: 120
        },
        {
          prop: 'deptName',
          label: '所属部门',
          minWidth: 120
        },
        {
          prop: 'remark',
          label: '描述',
          minWidth: 150,
          showOverflowTooltip: true
        },
        {
          prop: 'createTime',
          label: '创建日期',
          width: 180,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteRole(row)
              })
            ])
        }
      ]
    }
  })

  /**
   * 搜索处理
   * @param params 搜索参数
   */
  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 显示角色弹窗
   */
  const showDialog = (type: DialogType, row?: RoleListItem): void => {
    dialogType.value = type
    currentRoleData.value = row
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: RoleListItem[]): void => {
    selectedRows.value = selection
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择需要删除的数据!')
      return
    }

    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个角色吗？删除后不可恢复!`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        const ids = selectedRows.value.map((item) => item.id)
        await roleBatchDelete(ids)
        ElMessage.success(`已成功删除 ${selectedRows.value.length} 个角色`)
        selectedRows.value = []
        refreshData()
      } catch (error) {
        console.error('批量删除失败:', error)
        ElMessage.error('批量删除失败，请重试')
      }
    })
  }

  /**
   * 删除角色
   */
  const deleteRole = (row: RoleListItem): void => {
    ElMessageBox.confirm(`确定要删除该角色吗？删除后不可恢复!`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await roleDeleteById(row.id)
        ElMessage.success('删除成功')
        refreshData()
      } catch (error) {
        console.error('删除失败:', error)
        ElMessage.error('删除失败，请重试')
      }
    })
  }
</script>
