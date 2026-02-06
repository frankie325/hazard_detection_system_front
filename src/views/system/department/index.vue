<!-- 部门管理页面 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 更多 useTable 使用示例请移步至 功能示例 下面的高级表格示例或者查看官方文档 -->
<!-- useTable 文档：https://www.artd.pro/docs/zh/guide/hooks/use-table.html -->
<template>
  <div class="department-page art-full-height">
    <!-- 搜索栏 -->
    <DepartmentSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></DepartmentSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增部门</ElButton>
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
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 部门弹窗 -->
      <DepartmentDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :department-data="currentDepartmentData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { departmentList } from '@/api/system-manage'
  import DepartmentSearch from './modules/department-search.vue'
  import DepartmentDialog from './modules/department-dialog.vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'Department' })

  type DepartmentListItem = Api.SystemManage.DepartmentListItem

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentDepartmentData = ref<Partial<DepartmentListItem>>({})

  // 选中行
  const selectedRows = ref<DepartmentListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    departmentName: undefined,
    status: '1'
  })

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
      apiFn: departmentList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 60, label: '序号' }, // 序号
        {
          prop: 'deptName',
          label: '部门名称',
          width: 200,
          formatter: (row) => {
            return h('div', { class: 'department-name' }, [
              h('span', { class: 'department-icon' }, row.hasChildren ? '📁' : '📄'),
              h('span', { class: 'ml-1' }, row.deptName)
            ])
          }
        },
        {
          prop: 'parentDepartmentName',
          label: '上级部门',
          width: 180
        },
        {
          prop: 'departmentCode',
          label: '部门编码'
        },
        {
          prop: 'description',
          label: '描述',
          width: 200
        },
        {
          prop: 'createTime',
          label: '创建时间',
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right', // 固定列
          formatter: (row) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteDepartment()
              })
            ])
        }
      ]
    },
    // 数据处理
    transform: {
      // 数据转换器 - 处理树形结构
      dataTransformer: (records: any[]): Api.SystemManage.DepartmentListItem[] => {
        if (!Array.isArray(records)) {
          console.warn('数据转换器: 期望数组类型，实际收到:', typeof records)
          return []
        }

        // 处理树形数据
        const formatTreeData = (
          items: Api.SystemManage.DepartmentListItem[],
          level = 0
        ): Api.SystemManage.DepartmentListItem[] => {
          return items.map((item) => {
            return {
              ...item,
              hasChildren: item.children && item.children.length > 0,
              _level: level
            }
          })
        }

        return formatTreeData(records)
      }
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 显示部门弹窗
   */
  const showDialog = (type: DialogType, row?: DepartmentListItem): void => {
    dialogType.value = type
    currentDepartmentData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除部门
   */
  const deleteDepartment = () => {
    ElMessageBox.confirm(`确定要删除该部门吗？删除后不可恢复!`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // TODO: 调用删除接口
      ElMessage.success('删除成功')
      refreshData()
    })
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择需要删除的数据!')
      return
    }

    // const departmentNames = selectedRows.value.map((item) => item.deptName).join(', ')
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个部门吗？删除后不可恢复!`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // TODO: 调用批量删除接口
      ElMessage.success(`已成功删除 ${selectedRows.value.length} 个部门`)
      selectedRows.value = []
      refreshData()
    })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentDepartmentData.value = {}
      refreshData()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: DepartmentListItem[]): void => {
    selectedRows.value = selection
  }
</script>

<style scoped lang="scss">
  .department-page {
    .department-name {
      display: flex;
      align-items: center;

      .department-icon {
        margin-right: 6px;
      }
    }
  }
</style>
