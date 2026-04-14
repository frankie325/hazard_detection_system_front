<template>
  <div class="sensor-data-panel">
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card shadow="hover" class="sensor-card">
          <div class="sensor-item">
            <div class="sensor-icon temperature">
              <el-icon :size="32"><Sunny /></el-icon>
            </div>
            <div class="sensor-info">
              <div class="sensor-label">温度</div>
              <div class="sensor-value">{{ sensorData.temperature }} °C</div>
              <div class="sensor-status">
                <el-tag type="success" size="small">正常</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="sensor-card">
          <div class="sensor-item">
            <div class="sensor-icon vibration">
              <el-icon :size="32"><TrendCharts /></el-icon>
            </div>
            <div class="sensor-info">
              <div class="sensor-label">振动</div>
              <div class="sensor-value">{{ sensorData.vibration }} MM/S</div>
              <div class="sensor-status">
                <el-tag type="success" size="small">正常</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="sensor-card">
          <div class="sensor-item">
            <div class="sensor-icon co">
              <el-icon :size="32"><WindPower /></el-icon>
            </div>
            <div class="sensor-info">
              <div class="sensor-label">CO浓度</div>
              <div class="sensor-value">{{ sensorData.coConcentration }} PPM</div>
              <div class="sensor-status">
                <el-tag type="success" size="small">正常</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-divider />

    <div class="sensor-history">
      <div class="history-header">
        <h4>历史数据趋势</h4>
        <el-radio-group v-model="timeRange" size="small">
          <el-radio-button label="1h">1小时</el-radio-button>
          <el-radio-button label="6h">6小时</el-radio-button>
          <el-radio-button label="24h">24小时</el-radio-button>
          <el-radio-button label="7d">7天</el-radio-button>
        </el-radio-group>
      </div>
      <div class="chart-placeholder">
        <el-icon size="64" color="#909399"><TrendCharts /></el-icon>
        <p>历史数据图表（待实现）</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { TrendCharts, WindPower, Sunny } from '@element-plus/icons-vue'

  interface SensorData {
    temperature: number
    vibration: number
    coConcentration: number
  }

  interface Props {
    device: any
    sensorData: SensorData
  }

  defineProps<Props>()

  const timeRange = ref('1h')
</script>

<style lang="scss" scoped>
  .sensor-data-panel {
    .sensor-card {
      .sensor-item {
        display: flex;
        gap: 16px;
        align-items: center;

        .sensor-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          color: #fff;
          border-radius: 8px;

          &.temperature {
            background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
          }

          &.vibration {
            background: linear-gradient(135deg, #4ecdc4, #44a08d);
          }

          &.co {
            background: linear-gradient(135deg, #667eea, #764ba2);
          }
        }

        .sensor-info {
          flex: 1;

          .sensor-label {
            margin-bottom: 4px;
            font-size: 14px;
            color: #909399;
          }

          .sensor-value {
            margin-bottom: 8px;
            font-size: 24px;
            font-weight: 600;
            color: #303133;
          }

          .sensor-status {
            :deep(.el-tag) {
              min-width: 48px;
              text-align: center;
            }
          }
        }
      }
    }

    .sensor-history {
      margin-top: 24px;

      .history-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;

        h4 {
          margin: 0;
          font-size: 16px;
          color: #303133;
        }
      }

      .chart-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: #909399;
        background: #f5f7fa;
        border-radius: 8px;

        p {
          margin-top: 12px;
          font-size: 14px;
        }
      }
    }
  }
</style>
