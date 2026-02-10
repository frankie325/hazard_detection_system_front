<!-- 角色管理页面 -->
<template>
  <div class="art-full-height">
    <RoleSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></RoleSearch>

    <ElCard
      class="art-table-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增角色</ElButton>
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

    <!-- 菜单权限弹窗 -->
    <RolePermissionDialog
      v-model="permissionDialog"
      :role-data="currentRoleData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  // import { fetchGetRoleList } from '@/api/system-manage'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import RoleSearch from './modules/role-search.vue'
  import RoleEditDialog from './modules/role-edit-dialog.vue'
  import RolePermissionDialog from './modules/role-permission-dialog.vue'
  import { ElTag, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'Role' })

  type RoleListItem = Api.SystemManage.RoleListItem

  // 搜索表单
  const searchForm = ref({
    roleName: undefined,
    roleCode: undefined,
    description: undefined,
    enabled: undefined,
    daterange: undefined
  })

  const showSearchBar = ref(false)

  const dialogVisible = ref(false)
  const permissionDialog = ref(false)
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
      apiFn: async (params) => {
        // 模拟 API 延迟
        await new Promise((resolve) => setTimeout(resolve, 300))

        // 假数据
        const mockData: Api.SystemManage.RoleListItem[] = [
          {
            roleId: 1,
            roleName: '超级管理员',
            roleCode: 'SUPER_ADMIN',
            description: '系统最高权限管理员，拥有所有操作权限',
            enabled: true,
            createTime: '2024-01-01 10:00:00',
            updateTime: '2024-01-01 10:00:00'
          },
          {
            roleId: 2,
            roleName: '系统管理员',
            roleCode: 'SYSTEM_ADMIN',
            description: '系统日常运维管理员，负责用户、角色、菜单管理',
            enabled: true,
            createTime: '2024-01-02 14:30:00',
            updateTime: '2024-01-15 09:20:00'
          },
          {
            roleId: 3,
            roleName: '部门经理',
            roleCode: 'DEPT_MANAGER',
            description: '部门经理，可以查看和管理本部门的用户及数据',
            enabled: true,
            createTime: '2024-01-05 16:45:00',
            updateTime: '2024-02-10 11:30:00'
          },
          {
            roleId: 4,
            roleName: '普通员工',
            roleCode: 'EMPLOYEE',
            description: '普通员工角色，拥有基本的业务操作权限',
            enabled: true,
            createTime: '2024-01-08 09:15:00',
            updateTime: '2024-03-05 14:20:00'
          },
          {
            roleId: 5,
            roleName: '访客用户',
            roleCode: 'GUEST',
            description: '临时访客角色，仅拥有查看权限',
            enabled: false,
            createTime: '2024-01-10 11:20:00',
            updateTime: '2024-03-08 10:15:00'
          },
          {
            roleId: 6,
            roleName: '数据分析师',
            roleCode: 'DATA_ANALYST',
            description: '数据分析师角色，可以查看和导出各类报表数据',
            enabled: true,
            createTime: '2024-01-15 13:40:00',
            updateTime: '2024-02-20 15:50:00'
          },
          {
            roleId: 7,
            roleName: '审计员',
            roleCode: 'AUDITOR',
            description: '审计员角色，可以查看系统操作日志和审计记录',
            enabled: true,
            createTime: '2024-01-20 10:25:00',
            updateTime: '2024-03-01 16:40:00'
          },
          {
            roleId: 8,
            roleName: '测试员',
            roleCode: 'TESTER',
            description: '测试员角色，用于系统功能测试和验证',
            enabled: false,
            createTime: '2024-02-01 15:30:00',
            updateTime: '2024-03-10 09:55:00'
          },
          {
            roleId: 9,
            roleName: '财务专员',
            roleCode: 'FINANCE',
            description: '财务专员角色，负责财务相关数据的管理和统计',
            enabled: true,
            createTime: '2024-02-05 14:10:00',
            updateTime: '2024-03-12 13:25:00'
          },
          {
            roleId: 10,
            roleName: '运维专员',
            roleCode: 'OPERATOR',
            description: '运维专员角色，负责系统监控、配置和故障处理',
            enabled: true,
            createTime: '2024-02-10 11:50:00',
            updateTime: '2024-03-15 17:10:00'
          }
        ]

        // 过滤逻辑
        let filteredData = mockData
        if (params.roleName) {
          filteredData = filteredData.filter((item) => item.roleName.includes(params.roleName))
        }
        if (params.roleCode) {
          filteredData = filteredData.filter((item) => item.roleCode.includes(params.roleCode))
        }
        if (params.description) {
          filteredData = filteredData.filter((item) =>
            item.description.includes(params.description)
          )
        }
        if (params.enabled !== undefined) {
          filteredData = filteredData.filter((item) => item.enabled === params.enabled)
        }
        if (params.startTime || params.endTime) {
          const start = params.startTime ? new Date(params.startTime).getTime() : 0
          const end = params.endTime ? new Date(params.endTime).getTime() : Infinity
          filteredData = filteredData.filter((item) => {
            const itemTime = new Date(item.createTime).getTime()
            return itemTime >= start && itemTime <= end
          })
        }

        // 分页逻辑
        const total = filteredData.length
        const start = (params.current - 1) * params.size
        const end = start + params.size
        const records = filteredData.slice(start, end)

        return {
          records,
          current: params.current,
          size: params.size,
          total
        }
      },
      apiParams: {
        current: 1,
        size: 20
      },
      // 排除 apiParams 中的属性
      excludeParams: ['daterange'],
      columnsFactory: () => [
        {
          prop: 'roleId',
          label: '角色ID',
          width: 100
        },
        {
          prop: 'roleName',
          label: '角色名称',
          minWidth: 120
        },
        {
          prop: 'roleCode',
          label: '角色编码',
          minWidth: 120
        },
        {
          prop: 'description',
          label: '角色描述',
          minWidth: 150,
          showOverflowTooltip: true
        },
        {
          prop: 'enabled',
          label: '角色状态',
          width: 100,
          formatter: (row) => {
            const statusConfig = row.enabled
              ? { type: 'success', text: '启用' }
              : { type: 'warning', text: '禁用' }
            return h(
              ElTag,
              { type: statusConfig.type as 'success' | 'warning' },
              () => statusConfig.text
            )
          }
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
          width: 80,
          fixed: 'right',
          formatter: (row) =>
            h('div', [
              h(ArtButtonMore, {
                list: [
                  {
                    key: 'permission',
                    label: '菜单权限',
                    icon: 'ri:user-3-line'
                  },
                  {
                    key: 'edit',
                    label: '编辑角色',
                    icon: 'ri:edit-2-line'
                  },
                  {
                    key: 'delete',
                    label: '删除角色',
                    icon: 'ri:delete-bin-4-line',
                    color: '#f56c6c'
                  }
                ],
                onClick: (item: ButtonMoreItem) => buttonMoreClick(item, row)
              })
            ])
        }
      ]
    }
  })

  const dialogType = ref<'add' | 'edit'>('add')

  const showDialog = (type: 'add' | 'edit', row?: RoleListItem) => {
    dialogVisible.value = true
    dialogType.value = type
    currentRoleData.value = row
  }

  /**
   * 搜索处理
   * @param params 搜索参数
   */
  const handleSearch = (params: Record<string, any>) => {
    // 处理日期区间参数，把 daterange 转换为 startTime 和 endTime
    const { daterange, ...filtersParams } = params
    const [startTime, endTime] = Array.isArray(daterange) ? daterange : [null, null]

    // 搜索参数赋值
    Object.assign(searchParams, { ...filtersParams, startTime, endTime })
    getData()
  }

  const buttonMoreClick = (item: ButtonMoreItem, row: RoleListItem) => {
    switch (item.key) {
      case 'permission':
        showPermissionDialog(row)
        break
      case 'edit':
        showDialog('edit', row)
        break
      case 'delete':
        deleteRole(row)
        break
    }
  }

  const showPermissionDialog = (row?: RoleListItem) => {
    permissionDialog.value = true
    currentRoleData.value = row
  }

  const deleteRole = (row: RoleListItem) => {
    ElMessageBox.confirm(`确定删除角色"${row.roleName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        // TODO: 调用删除接口
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }
</script>
