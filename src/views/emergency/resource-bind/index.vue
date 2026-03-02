<!-- 应急指挥 - 资源绑定 -->
<template>
  <div class="resource-bind-page">
    <!-- 选择事件 -->
    <div class="event-selector">
      <span class="label">选择事件：</span>
      <ElSelect
        v-model="selectedEventId"
        placeholder="请选择事件"
        style="width: 400px"
        filterable
        @change="handleEventChange"
      >
        <ElOption
          v-for="event in eventListData"
          :key="event.id"
          :label="`${event.eventName} - ${event.location}`"
          :value="event.id"
        >
          <div class="event-option">
            <span class="event-name">{{ event.eventName }}</span>
            <span class="event-location">{{ event.location }}</span>
          </div>
        </ElOption>
      </ElSelect>
    </div>

    <!-- 主体内容 -->
    <div class="main-content">
      <!-- 左侧资源池 -->
      <div class="resource-pool-panel">
        <div class="panel-header">
          <span class="title">资源池</span>
          <ElInput
            v-model="searchKeyword"
            placeholder="搜索资源名/编号"
            clearable
            style="width: 200px"
          >
            <template #prefix>
              <ElIcon><Search /></ElIcon>
            </template>
          </ElInput>
        </div>
        <!-- 全选操作栏 -->
        <div v-if="filteredResources.length > 0" class="select-all-bar">
          <ElCheckbox
            :model-value="isAllSelected"
            :indeterminate="isIndeterminate"
            @change="handleSelectAll"
          >
            全选当前结果
          </ElCheckbox>
          <span class="selected-count">已选 {{ selectedResourceIds.length }} 项</span>
        </div>
        <ElScrollbar class="resource-list">
          <div v-if="resourcePool.length === 0" class="empty-tip">暂无资源</div>
          <template v-else>
            <div
              v-for="resource in filteredResources"
              :key="resource.id"
              class="resource-item"
              :class="{ selected: selectedResourceIds.includes(resource.id) }"
              @click="toggleResource(resource.id)"
            >
              <ElCheckbox :model-value="selectedResourceIds.includes(resource.id)" />
              <div class="resource-info">
                <div class="resource-name">{{ resource.resourceName }}</div>
                <div class="resource-meta">
                  <span class="num">数量: {{ resource.num }}</span>
                </div>
              </div>
            </div>
          </template>
        </ElScrollbar>
      </div>

      <!-- 右侧绑定表单 -->
      <div class="bind-panel">
        <div class="panel-header">
          <span class="title">已勾选资源</span>
          <span class="count" :class="{ empty: selectedResourceIds.length === 0 }">
            {{ selectedResourceIds.length === 0 ? '尚未勾选' : `${selectedResourceIds.length} 项` }}
          </span>
        </div>

        <ElScrollbar class="form-scroll">
          <ElForm ref="formRef" :model="form" :rules="rules" label-width="80px" class="bind-form">
            <ElFormItem label="接收人" prop="receiverRoleId">
              <ElSelect
                v-model="form.receiverRoleId"
                placeholder="请至少选择一名接收人"
                style="width: 100%"
                filterable
              >
                <ElOption
                  v-for="role in roleList"
                  :key="role.id"
                  :label="role.roleName"
                  :value="role.id"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="出发地">
              <ElInput v-model="form.departure" placeholder="如: 站点X" />
            </ElFormItem>
            <ElFormItem label="目的地">
              <ElInput v-model="form.destination" placeholder="如: 隧道A入口" />
            </ElFormItem>
            <ElFormItem label="备注">
              <ElInput
                v-model="form.remark"
                type="textarea"
                :rows="3"
                placeholder="可选"
                maxlength="500"
              />
            </ElFormItem>
          </ElForm>
        </ElScrollbar>

        <div class="action-footer">
          <ElButton
            type="primary"
            :loading="loading"
            :disabled="!selectedEventId"
            @click="handleBind"
          >
            复核并绑定
          </ElButton>
        </div>
      </div>
    </div>

    <!-- 复核弹窗 -->
    <ElDialog
      v-model="confirmVisible"
      title="复核绑定清单"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="confirm-list">
        <div class="confirm-item">
          <span class="label">接收人：</span>
          <span>{{ getRoleName(form.receiverRoleId) }}</span>
        </div>
        <div v-if="form.departure" class="confirm-item">
          <span class="label">出发地：</span>
          <span>{{ form.departure }}</span>
        </div>
        <div v-if="form.destination" class="confirm-item">
          <span class="label">目的地：</span>
          <span>{{ form.destination }}</span>
        </div>
        <div v-if="form.remark" class="confirm-item">
          <span class="label">备注：</span>
          <span>{{ form.remark }}</span>
        </div>
        <div class="confirm-resources">
          <div class="label">绑定资源：</div>
          <div class="resource-tags">
            <ElTag v-for="id in selectedResourceIds" :key="id" type="info" style="margin: 4px">
              {{ getResourceName(id) }}
            </ElTag>
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="confirmVisible = false">返回调整</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleConfirmBind">
          确认绑定
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { Search } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { EmeEventStatus, TimelineType } from '@/enums/formEnum'
  import { eventList, resourcePoolList, updateStatus } from '@/api/emergency'
  import { allRoleList } from '@/api/system-manage'

  defineOptions({ name: 'ResourceBind' })

  const router = useRouter()
  const route = useRoute()

  const loading = ref(false)
  const submitLoading = ref(false)
  const confirmVisible = ref(false)
  const searchKeyword = ref('')
  const selectedEventId = ref<number>()
  const eventListData = ref<Api.Emergency.EventListItem[]>([])
  const resourcePool = ref<Api.Emergency.ResourceItem[]>([])
  const roleList = ref<Api.SystemManage.RoleListItem[]>([])
  const selectedResourceIds = ref<number[]>([])

  const formRef = ref<FormInstance>()
  const form = reactive({
    receiverRoleId: undefined as number | undefined,
    departure: '',
    destination: '',
    remark: ''
  })

  const rules: FormRules = {
    receiverRoleId: [{ required: true, message: '请选择接收人', trigger: 'change' }]
  }

  // 过滤资源
  const filteredResources = computed(() => {
    if (!searchKeyword.value) return resourcePool.value
    const keyword = searchKeyword.value.toLowerCase()
    return resourcePool.value.filter((r) => r.resourceName.toLowerCase().includes(keyword))
  })

  // 切换资源选择
  const toggleResource = (id: number) => {
    const index = selectedResourceIds.value.indexOf(id)
    if (index > -1) {
      selectedResourceIds.value.splice(index, 1)
    } else {
      selectedResourceIds.value.push(id)
    }
  }

  // 是否全选（当前过滤结果）
  const isAllSelected = computed(() => {
    if (filteredResources.value.length === 0) return false
    return filteredResources.value.every((r) => selectedResourceIds.value.includes(r.id))
  })

  // 是否半选状态
  const isIndeterminate = computed(() => {
    const selectedCount = filteredResources.value.filter((r) =>
      selectedResourceIds.value.includes(r.id)
    ).length
    return selectedCount > 0 && selectedCount < filteredResources.value.length
  })

  // 全选/取消全选（当前过滤结果）
  const handleSelectAll = (val: string | number | boolean) => {
    if (val) {
      // 全选当前过滤结果
      const newIds = filteredResources.value
        .filter((r) => !selectedResourceIds.value.includes(r.id))
        .map((r) => r.id)
      selectedResourceIds.value.push(...newIds)
    } else {
      // 取消选择当前过滤结果
      const idsToRemove = filteredResources.value.map((r) => r.id)
      selectedResourceIds.value = selectedResourceIds.value.filter(
        (id) => !idsToRemove.includes(id)
      )
    }
  }

  // 获取角色名称
  const getRoleName = (id?: number) => {
    if (!id) return '-'
    return roleList.value.find((r) => r.id === id)?.roleName || '-'
  }

  // 获取资源名称
  const getResourceName = (id: number) => {
    return resourcePool.value.find((r) => r.id === id)?.resourceName || '-'
  }

  // 事件变化时清空选择并更新角色列表
  const handleEventChange = () => {
    selectedResourceIds.value = []
    formRef.value?.resetFields()
    // 根据选中事件的部门ID加载角色列表
    loadRoleList()
  }

  // 加载事件列表（只显示已确认状态的事件）
  const loadEventList = async () => {
    try {
      const res = await eventList()
      // 过滤出状态为已确认的事件，只有已确认的事件才能进行资源绑定
      eventListData.value = res.filter((event) => event.status === EmeEventStatus.CONFIRMED)
      // 如果路由有传入事件ID，自动选中该事件
      const eventId = route.query.eventId
      if (eventId) {
        const id = Number(eventId)
        if (eventListData.value.some((e) => e.id === id)) {
          selectedEventId.value = id
        }
      }
    } catch (error) {
      console.error('加载事件列表失败:', error)
    }
  }

  // 加载资源池
  const loadResourcePool = async () => {
    try {
      const res = await resourcePoolList()
      resourcePool.value = res
    } catch (error) {
      console.error('加载资源池失败:', error)
    }
  }

  // 加载角色列表（根据选中事件的部门ID过滤）
  const loadRoleList = async () => {
    roleList.value = []
    if (!selectedEventId.value) return

    // 获取选中事件的部门ID
    const event = eventListData.value.find((e) => e.id === selectedEventId.value)
    if (!event) return

    try {
      const res = await allRoleList()
      // 只显示该事件处置部门下的角色
      roleList.value = res.filter((role) => role.deptId === event.deptId)
    } catch (error) {
      console.error('加载角色列表失败:', error)
    }
  }

  // 复核并绑定
  const handleBind = async () => {
    if (!selectedEventId.value) {
      ElMessage.warning('请先选择事件')
      return
    }

    if (selectedResourceIds.value.length === 0) {
      ElMessage.warning('请至少选择一个资源')
      return
    }

    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    confirmVisible.value = true
  }

  // 确认绑定
  const handleConfirmBind = async () => {
    if (!selectedEventId.value) return

    submitLoading.value = true
    try {
      await updateStatus({
        eventId: selectedEventId.value,
        actionType: TimelineType.BIND,
        resourceIds: selectedResourceIds.value,
        receiverRoleId: form.receiverRoleId!,
        departure: form.departure,
        destination: form.destination,
        remark: form.remark
      })
      ElMessage.success('绑定成功')
      confirmVisible.value = false
      // 跳转到事件中心
      router.push('/emergency/event-center')
    } catch (error) {
      console.error('绑定失败:', error)
    } finally {
      submitLoading.value = false
    }
  }

  onMounted(async () => {
    await loadEventList()
    loadResourcePool()
    // 如果有自动选中的事件，加载对应的角色列表
    loadRoleList()
  })
</script>

<style lang="scss" scoped>
  .resource-bind-page {
    display: flex;
    flex-direction: column;
    height: var(--art-full-height);
    padding: 16px;
    background: var(--el-bg-color-page);
  }

  .event-selector {
    display: flex;
    align-items: center;
    padding: 16px;
    margin-bottom: 16px;
    background: var(--el-bg-color);
    border-radius: 8px;

    .label {
      margin-right: 12px;
      font-weight: 500;
    }

    .event-option {
      display: flex;
      justify-content: space-between;

      .event-name {
        font-weight: 500;
      }

      .event-location {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .main-content {
    display: flex;
    flex: 1;
    gap: 16px;
    min-height: 0;
  }

  .resource-pool-panel {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    background: var(--el-bg-color);
    border-radius: 8px;

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid var(--el-border-color-light);

      .title {
        font-size: 16px;
        font-weight: 600;
      }
    }

    .select-all-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      .selected-count {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .resource-list {
      flex: 1;
      padding: 12px;
    }

    .empty-tip {
      padding: 40px 0;
      color: var(--el-text-color-secondary);
      text-align: center;
    }

    .resource-item {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 12px;
      margin-bottom: 8px;
      cursor: pointer;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        background: var(--el-fill-color-light);
        border-color: var(--el-color-primary-light-5);
      }

      &.selected {
        background: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary);
      }

      .resource-info {
        flex: 1;

        .resource-name {
          margin-bottom: 4px;
          font-weight: 500;
        }

        .resource-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--el-text-color-secondary);

          .num {
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  .bind-panel {
    display: flex;
    flex-direction: column;
    width: 360px;
    overflow: hidden;
    background: var(--el-bg-color);
    border-radius: 8px;

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid var(--el-border-color-light);

      .title {
        font-size: 16px;
        font-weight: 600;
      }

      .count {
        font-size: 14px;
        color: var(--el-color-primary);

        &.empty {
          color: var(--el-text-color-secondary);
        }
      }
    }

    .form-scroll {
      flex: 1;
      padding: 16px;
    }

    .action-footer {
      padding: 16px;
      border-top: 1px solid var(--el-border-color-light);
    }
  }

  .confirm-list {
    .confirm-item {
      display: flex;
      margin-bottom: 12px;

      .label {
        min-width: 70px;
        color: var(--el-text-color-secondary);
      }
    }

    .confirm-resources {
      padding-top: 16px;
      margin-top: 16px;
      border-top: 1px solid var(--el-border-color-lighter);

      .label {
        margin-bottom: 8px;
        color: var(--el-text-color-secondary);
      }

      .resource-tags {
        display: flex;
        flex-wrap: wrap;
      }
    }
  }
</style>
