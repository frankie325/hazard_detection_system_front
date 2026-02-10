<template>
  <div class="events-container">
    <!-- 搜索栏 -->
    <div class="search-section">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="设备">
          <el-select v-model="searchForm.device" placeholder="全部" clearable style="width: 150px">
            <el-option label="CAM-01" value="CAM-01" />
            <el-option label="CAM-02" value="CAM-02" />
            <el-option label="CAM-03" value="CAM-03" />
            <el-option label="CAM-04" value="CAM-04" />
            <el-option label="CAM-05" value="CAM-05" />
            <el-option label="CAM-06" value="CAM-06" />
            <el-option label="FIRE-04" value="FIRE-04" />
            <el-option label="FIRE-02" value="FIRE-02" />
          </el-select>
        </el-form-item>
        <el-form-item label="区域">
          <el-select v-model="searchForm.area" placeholder="全部" clearable style="width: 150px">
            <el-option label="隧道A" value="隧道A" />
            <el-option label="隧道D" value="隧道D" />
            <el-option label="路段E" value="路段E" />
            <el-option label="服务区G" value="服务区G" />
          </el-select>
        </el-form-item>
        <el-form-item label="事件名称">
          <el-input
            v-model="searchForm.eventName"
            placeholder="全部"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="searchForm.startTime"
            type="date"
            placeholder="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="searchForm.endTime"
            type="date"
            placeholder="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="table-section">
      <el-table :data="filteredEvents" style="width: 100%" stripe border>
        <el-table-column prop="timestamp" label="时间" width="100" />
        <el-table-column prop="eventName" label="事件名称" width="200" />
        <el-table-column prop="eventType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getEventTypeTag(row.eventType)" size="small">
              {{ row.eventType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deviceName" label="设备" width="120" />
        <el-table-column prop="location" label="地点" width="140" />
        <el-table-column prop="area" label="区域" width="100" />
        <el-table-column prop="confidence" label="置信度" width="100">
          <template #default="{ row }">
            <div class="confidence-wrapper">
              <el-progress
                :percentage="row.confidence"
                :color="getConfidenceColor(row.confidence)"
                :show-text="false"
                :stroke-width="8"
              />
              <span class="confidence-value">{{ row.confidence }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="View" @click="handleViewDetail(row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 事件详情弹窗 -->
    <el-dialog v-model="detailVisible" title="事件详情" width="500px" :before-close="closeDetail">
      <el-descriptions v-if="selectedEvent" :column="1" border>
        <el-descriptions-item label="事件名称">{{ selectedEvent.eventName }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ selectedEvent.eventType }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ selectedEvent.location }}</el-descriptions-item>
        <el-descriptions-item label="设备/摄像头">{{
          selectedEvent.deviceName
        }}</el-descriptions-item>
        <el-descriptions-item label="置信度">{{ selectedEvent.confidence }}%</el-descriptions-item>
        <el-descriptions-item label="发生时间">{{ selectedEvent.timestamp }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="closeDetail">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Search, Refresh, View } from '@element-plus/icons-vue'

  interface EventItem {
    id: string
    eventName: string
    eventType: string
    deviceCode: string
    deviceName: string
    area: string
    location: string
    confidence: number
    timestamp: string
  }

  // 搜索表单
  const searchForm = ref({
    device: '',
    area: '',
    eventName: '',
    startTime: '',
    endTime: ''
  })

  // 分页
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })

  // 详情弹窗
  const detailVisible = ref(false)
  const selectedEvent = ref<EventItem | null>(null)

  // 假数据
  const allEvents: EventItem[] = [
    {
      id: 'evt-1',
      eventName: '火灾-FIRE-04-114605',
      eventType: '火灾',
      deviceCode: 'FIRE-04',
      deviceName: 'FIRE-04',
      area: '隧道A',
      location: '隧道A-中段',
      confidence: 91,
      timestamp: '2025-11-08 11:46:05'
    },
    {
      id: 'evt-2',
      eventName: '抛洒物-CAM-01-091233',
      eventType: '抛洒物',
      deviceCode: 'CAM-01',
      deviceName: 'CAM-01',
      area: '隧道A',
      location: '隧道A-入口',
      confidence: 88,
      timestamp: '2025-11-08 09:12:33'
    },
    {
      id: 'evt-3',
      eventName: '抛洒物-CAM-06-162748',
      eventType: '抛洒物',
      deviceCode: 'CAM-06',
      deviceName: 'CAM-06',
      area: '路段E',
      location: '路段E-下行',
      confidence: 79,
      timestamp: '2025-11-07 16:27:48'
    },
    {
      id: 'evt-4',
      eventName: '塌方-CAM-05-100219',
      eventType: '塌方',
      deviceCode: 'CAM-05',
      deviceName: 'CAM-05',
      area: '路段E',
      location: '路段E-上行',
      confidence: 73,
      timestamp: '2025-11-07 10:02:19'
    },
    {
      id: 'evt-5',
      eventName: '交通事故-FIRE-02-190311',
      eventType: '交通事故',
      deviceCode: 'FIRE-02',
      deviceName: 'FIRE-02',
      area: '隧道D',
      location: '隧道D-出口',
      confidence: 67,
      timestamp: '2025-11-05 19:03:11'
    },
    {
      id: 'evt-6',
      eventName: '火灾-CAM-03-081554',
      eventType: '火灾',
      deviceCode: 'CAM-03',
      deviceName: 'CAM-03',
      area: '服务区G',
      location: '服务区G-东侧',
      confidence: 92,
      timestamp: '2025-11-05 08:15:54'
    },
    {
      id: 'evt-7',
      eventName: '火灾-FIRE-04-050620',
      eventType: '火灾',
      deviceCode: 'FIRE-04',
      deviceName: 'FIRE-04',
      area: '隧道A',
      location: '隧道A-中段',
      confidence: 85,
      timestamp: '2025-11-02 05:06:20'
    },
    {
      id: 'evt-8',
      eventName: '抛洒物-CAM-02-120530',
      eventType: '抛洒物',
      deviceCode: 'CAM-02',
      deviceName: 'CAM-02',
      area: '隧道A',
      location: '隧道A-入口',
      confidence: 76,
      timestamp: '2025-11-02 12:05:30'
    },
    {
      id: 'evt-9',
      eventName: '塌方-CAM-04-103015',
      eventType: '塌方',
      deviceCode: 'CAM-04',
      deviceName: 'CAM-04',
      area: '隧道D',
      location: '隧道D-北侧',
      confidence: 69,
      timestamp: '2025-11-01 10:30:15'
    },
    {
      id: 'evt-10',
      eventName: '交通事故-CAM-07-094545',
      eventType: '交通事故',
      deviceCode: 'CAM-07',
      deviceName: 'CAM-07',
      area: '隧道A',
      location: '隧道A-中段',
      confidence: 82,
      timestamp: '2025-10-31 09:45:45'
    },
    {
      id: 'evt-11',
      eventName: '抛洒物-CAM-01-151020',
      eventType: '抛洒物',
      deviceCode: 'CAM-01',
      deviceName: 'CAM-01',
      area: '隧道A',
      location: '隧道A-入口',
      confidence: 90,
      timestamp: '2025-10-30 15:10:20'
    },
    {
      id: 'evt-12',
      eventName: '火灾-CAM-08-074512',
      eventType: '火灾',
      deviceCode: 'CAM-08',
      deviceName: 'CAM-08',
      area: '隧道D',
      location: '隧道D-南侧',
      confidence: 88,
      timestamp: '2025-10-29 07:45:12'
    },
    {
      id: 'evt-13',
      eventName: '塌方-CAM-09-123010',
      eventType: '塌方',
      deviceCode: 'CAM-09',
      deviceName: 'CAM-09',
      area: '路段E',
      location: '路段E-中段',
      confidence: 75,
      timestamp: '2025-10-28 12:30:10'
    },
    {
      id: 'evt-14',
      eventName: '抛洒物-CAM-10-080550',
      eventType: '抛洒物',
      deviceCode: 'CAM-10',
      deviceName: 'CAM-10',
      area: '隧道A',
      location: '隧道A-出口',
      confidence: 80,
      timestamp: '2025-10-27 08:05:50'
    },
    {
      id: 'evt-15',
      eventName: '交通事故-CAM-11-062030',
      eventType: '交通事故',
      deviceCode: 'CAM-11',
      deviceName: 'CAM-11',
      area: '隧道A',
      location: '隧道A-入口',
      confidence: 70,
      timestamp: '2025-10-26 06:20:30'
    }
  ]

  // 过滤事件
  const filteredEvents = computed(() => {
    let events = allEvents

    if (searchForm.value.device) {
      events = events.filter((e) => e.deviceCode === searchForm.value.device)
    }
    if (searchForm.value.area) {
      events = events.filter((e) => e.area === searchForm.value.area)
    }
    if (searchForm.value.eventName) {
      events = events.filter((e) => e.eventName.includes(searchForm.value.eventName))
    }
    if (searchForm.value.startTime) {
      events = events.filter((e) => e.timestamp >= `${searchForm.value.startTime} 00:00:00`)
    }
    if (searchForm.value.endTime) {
      events = events.filter((e) => e.timestamp <= `${searchForm.value.endTime} 23:59:59`)
    }

    // pagination.value.total = events.length

    // 分页
    const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return events.slice(start, end)
  })

  // 事件类型标签颜色
  const getEventTypeTag = (type: string) => {
    const colorMap: Record<string, any> = {
      抛洒物: 'warning',
      塌方: 'danger',
      火灾: 'danger',
      交通事故: 'info'
    }
    return colorMap[type] || ''
  }

  // 置信度颜色
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return '#67C23A'
    if (confidence >= 80) return '#409EFF'
    if (confidence >= 70) return '#E6A23C'
    return '#F56C6C'
  }

  // 搜索
  const handleSearch = () => {
    pagination.value.currentPage = 1
  }

  // 重置
  const handleReset = () => {
    searchForm.value = {
      device: '',
      area: '',
      eventName: '',
      startTime: '',
      endTime: ''
    }
    pagination.value.currentPage = 1
  }

  // 查看详情
  const handleViewDetail = (row: EventItem) => {
    selectedEvent.value = row
    detailVisible.value = true
  }

  // 关闭详情
  const closeDetail = () => {
    detailVisible.value = false
    selectedEvent.value = null
  }

  // 分页变化
  const handleSizeChange = (size: number) => {
    pagination.value.pageSize = size
    pagination.value.currentPage = 1
  }

  const handleCurrentChange = (page: number) => {
    pagination.value.currentPage = page
  }
</script>

<style lang="scss" scoped>
  .events-container {
    padding: 16px;

    .search-section {
      padding: 16px;
      margin-bottom: 16px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    }

    .table-section {
      padding: 16px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 10%);

      .confidence-wrapper {
        display: flex;
        gap: 8px;
        align-items: center;

        .confidence-value {
          min-width: 36px;
          font-size: 14px;
          color: #606266;
        }
      }

      .pagination {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
      }
    }
  }
</style>
