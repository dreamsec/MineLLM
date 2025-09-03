<template>
  <div class="device-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">设备管理</h2>
      <p class="page-description">管理煤矿提升机相关设备，包括摄像头、传感器等设备</p>
    </div>

    <!-- 三栏布局容器 -->
    <div class="three-column-layout">
      <!-- 左侧：设备类型选择 -->
      <div class="left-panel">
        <div class="panel-header">
          <h3>设备类型</h3>
        </div>
        <div class="device-categories">
          <div
            v-for="category in deviceCategories"
            :key="category.id"
            class="category-item"
            :class="{ active: selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            <el-icon class="category-icon">
              <component :is="category.icon" />
            </el-icon>
            <span class="category-name">{{ category.name }}</span>
            <span class="device-count">({{ getDeviceCountByCategory(category.id) }})</span>
          </div>
        </div>
      </div>

      <!-- 中间：设备表格 -->
      <div class="middle-panel">
        <div class="panel-header">
          <h3>设备列表</h3>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索设备名称、编号..."
              class="search-input"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleAddDevice">
              <el-icon><Plus /></el-icon>
              新增设备
            </el-button>
          </div>
        </div>

        <div class="table-container">
          <el-table
            :data="filteredDevices"
            v-loading="loading"
            stripe
            highlight-current-row
            @row-click="handleRowClick"
            style="width: 100%"
          >
            <el-table-column prop="id" label="设备ID" width="80" />
            <el-table-column prop="name" label="设备名称" min-width="120" />
            <el-table-column prop="type" label="设备类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getDeviceTypeTagType(row.type)">
                  {{ getDeviceTypeName(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="安装位置" min-width="120" />
            <el-table-column prop="installDate" label="安装日期" width="120" />
            <el-table-column prop="lastMaintenance" label="最后维护" width="120" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click.stop="handleEditDevice(row)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button size="small" type="danger" @click.stop="handleDeleteDevice(row)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="totalDevices"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>

      <!-- 右侧：设备详情 -->
      <div class="right-panel">
        <div class="panel-header">
          <h3>设备详情</h3>
        </div>
        <div class="device-details" v-if="selectedDevice">
          <div class="detail-section">
            <h4>基本信息</h4>
            <div class="detail-item">
              <label>设备名称：</label>
              <span>{{ selectedDevice.name }}</span>
            </div>
            <div class="detail-item">
              <label>设备编号：</label>
              <span>{{ selectedDevice.id }}</span>
            </div>
            <div class="detail-item">
              <label>设备类型：</label>
              <el-tag :type="getDeviceTypeTagType(selectedDevice.type)">
                {{ getDeviceTypeName(selectedDevice.type) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>设备状态：</label>
              <el-tag :type="getStatusTagType(selectedDevice.status)">
                {{ getStatusText(selectedDevice.status) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>安装位置：</label>
              <span>{{ selectedDevice.location }}</span>
            </div>
            <div class="detail-item">
              <label>安装日期：</label>
              <span>{{ selectedDevice.installDate }}</span>
            </div>
            <div class="detail-item">
              <label>最后维护：</label>
              <span>{{ selectedDevice.lastMaintenance }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h4>技术参数</h4>
            <div class="detail-item">
              <label>型号：</label>
              <span>{{ selectedDevice.model || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <label>制造商：</label>
              <span>{{ selectedDevice.manufacturer || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <label>IP地址：</label>
              <span>{{ selectedDevice.ipAddress || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <label>端口：</label>
              <span>{{ selectedDevice.port || 'N/A' }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h4>维护记录</h4>
            <div class="maintenance-records">
              <div
                v-for="record in selectedDevice.maintenanceRecords || []"
                :key="record.id"
                class="maintenance-item"
              >
                <div class="record-date">{{ record.date }}</div>
                <div class="record-content">{{ record.content }}</div>
                <div class="record-operator">操作员：{{ record.operator }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-selection">
          <el-icon class="no-selection-icon"><InfoFilled /></el-icon>
          <p>请选择设备查看详情</p>
        </div>
      </div>
    </div>

    <!-- 新增/编辑设备对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑设备' : '新增设备'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="deviceFormRef"
        :model="deviceForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="deviceForm.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="deviceForm.type" placeholder="请选择设备类型" style="width: 100%">
            <el-option
              v-for="category in deviceCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="deviceForm.location" placeholder="请输入安装位置" />
        </el-form-item>
        <el-form-item label="设备状态" prop="status">
          <el-select v-model="deviceForm.status" placeholder="请选择设备状态" style="width: 100%">
            <el-option label="正常" value="normal" />
            <el-option label="故障" value="fault" />
            <el-option label="维护中" value="maintenance" />
            <el-option label="离线" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="deviceForm.model" placeholder="请输入设备型号" />
        </el-form-item>
        <el-form-item label="制造商" prop="manufacturer">
          <el-input v-model="deviceForm.manufacturer" placeholder="请输入制造商" />
        </el-form-item>
        <el-form-item label="IP地址" prop="ipAddress">
          <el-input v-model="deviceForm.ipAddress" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input v-model="deviceForm.port" placeholder="请输入端口号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="DeviceManagement">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  Edit,
  Delete,
  InfoFilled,
  VideoCamera,
  Monitor,
  Setting,
  Tools,
  Bell
} from '@element-plus/icons-vue'

// 设备类型定义
interface DeviceCategory {
  id: string
  name: string
  icon: unknown
}

// 设备接口定义
interface Device {
  id: string
  name: string
  type: string
  status: 'normal' | 'fault' | 'maintenance' | 'offline'
  location: string
  installDate: string
  lastMaintenance: string
  model?: string
  manufacturer?: string
  ipAddress?: string
  port?: string
  maintenanceRecords?: Array<{
    id: string
    date: string
    content: string
    operator: string
  }>
}

// 响应式数据
const loading = ref(false)
const selectedCategory = ref('all')
const selectedDevice = ref<Device | null>(null)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const dialogVisible = ref(false)
const isEdit = ref(false)
const deviceFormRef = ref()

// 设备类型配置
const deviceCategories: DeviceCategory[] = [
  { id: 'all', name: '全部设备', icon: Monitor },
  { id: 'camera', name: '摄像头', icon: VideoCamera },
  { id: 'sensor', name: '传感器', icon: Setting },
  { id: 'monitor', name: '监控设备', icon: Monitor },
  { id: 'alarm', name: '报警设备', icon: Bell },
  { id: 'other', name: '其他设备', icon: Tools }
]

// 模拟设备数据
const devices = ref<Device[]>([
  {
    id: 'CAM001',
    name: '主井摄像头',
    type: 'camera',
    status: 'normal',
    location: '主井口',
    installDate: '2023-01-15',
    lastMaintenance: '2024-01-10',
    model: 'HIK-DS-2CD2xxx',
    manufacturer: '海康威视',
    ipAddress: '192.168.1.101',
    port: '80',
    maintenanceRecords: [
      {
        id: '1',
        date: '2024-01-10',
        content: '定期清洁镜头，检查连接线',
        operator: '张三'
      },
      {
        id: '2',
        date: '2023-12-15',
        content: '更换存储卡，更新固件',
        operator: '李四'
      }
    ]
  },
  {
    id: 'SEN001',
    name: '温度传感器',
    type: 'sensor',
    status: 'normal',
    location: '机房',
    installDate: '2023-02-20',
    lastMaintenance: '2024-01-05',
    model: 'DS18B20',
    manufacturer: 'Dallas',
    ipAddress: '192.168.1.102',
    port: '8080'
  },
  {
    id: 'MON001',
    name: '提升机监控',
    type: 'monitor',
    status: 'maintenance',
    location: '控制室',
    installDate: '2023-03-10',
    lastMaintenance: '2024-01-08',
    model: 'S7-1200',
    manufacturer: '西门子',
    ipAddress: '192.168.1.103',
    port: '502'
  },
  {
    id: 'ALM001',
    name: '烟雾报警器',
    type: 'alarm',
    status: 'fault',
    location: '机房',
    installDate: '2023-04-05',
    lastMaintenance: '2023-12-20',
    model: 'JTY-GD-G3',
    manufacturer: '海湾',
    ipAddress: '192.168.1.104',
    port: '80'
  },
  {
    id: 'CAM002',
    name: '副井摄像头',
    type: 'camera',
    status: 'offline',
    location: '副井口',
    installDate: '2023-05-12',
    lastMaintenance: '2023-11-30',
    model: 'HIK-DS-2CD2xxx',
    manufacturer: '海康威视',
    ipAddress: '192.168.1.105',
    port: '80'
  }
])

// 表单数据
const deviceForm = reactive({
  id: '',
  name: '',
  type: '',
  status: 'normal' as 'normal' | 'fault' | 'maintenance' | 'offline',
  location: '',
  model: '',
  manufacturer: '',
  ipAddress: '',
  port: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入设备名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择设备类型', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入安装位置', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择设备状态', trigger: 'change' }
  ]
}

// 计算属性
const filteredDevices = computed(() => {
  let filtered = devices.value

  // 按设备类型过滤
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(device => device.type === selectedCategory.value)
  }

  // 按搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(device =>
      device.name.toLowerCase().includes(keyword) ||
      device.id.toLowerCase().includes(keyword) ||
      device.location.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

const totalDevices = computed(() => filteredDevices.value.length)

// 方法
const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId
  selectedDevice.value = null
}

const getDeviceCountByCategory = (categoryId: string) => {
  if (categoryId === 'all') {
    return devices.value.length
  }
  return devices.value.filter(device => device.type === categoryId).length
}

const getDeviceTypeName = (type: string) => {
  const category = deviceCategories.find(cat => cat.id === type)
  return category ? category.name : type
}

const getDeviceTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    camera: 'primary',
    sensor: 'success',
    monitor: 'warning',
    alarm: 'danger',
    other: 'info'
  }
  return typeMap[type] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    normal: '正常',
    fault: '故障',
    maintenance: '维护中',
    offline: '离线'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    normal: 'success',
    fault: 'danger',
    maintenance: 'warning',
    offline: 'info'
  }
  return statusMap[status] || 'info'
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
}

const handleRowClick = (row: Device) => {
  selectedDevice.value = row
}

const handleAddDevice = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEditDevice = (row: Device) => {
  isEdit.value = true
  Object.assign(deviceForm, row)
  dialogVisible.value = true
}

const handleDeleteDevice = async (row: Device) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除设备 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = devices.value.findIndex(device => device.id === row.id)
    if (index > -1) {
      devices.value.splice(index, 1)
      ElMessage.success('删除成功')

      // 如果删除的是当前选中的设备，清空选中状态
      if (selectedDevice.value?.id === row.id) {
        selectedDevice.value = null
      }
    }
  } catch {
    // 用户取消删除
  }
}

const handleSubmit = async () => {
  if (!deviceFormRef.value) return

  try {
    await deviceFormRef.value.validate()

    if (isEdit.value) {
      // 编辑设备
      const index = devices.value.findIndex(device => device.id === deviceForm.id)
      if (index > -1) {
        devices.value[index] = {
          ...devices.value[index],
          ...deviceForm,
          status: deviceForm.status as 'normal' | 'fault' | 'maintenance' | 'offline'
        }
        ElMessage.success('编辑成功')
      }
    } else {
      // 新增设备
      const newDevice: Device = {
        ...deviceForm,
        id: `DEV${Date.now()}`,
        installDate: new Date().toISOString().split('T')[0],
        lastMaintenance: new Date().toISOString().split('T')[0],
        status: deviceForm.status as 'normal' | 'fault' | 'maintenance' | 'offline'
      }
      devices.value.unshift(newDevice)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    resetForm()
  } catch {
    // 表单验证失败
  }
}

const resetForm = () => {
  Object.assign(deviceForm, {
    id: '',
    name: '',
    type: '',
    status: 'normal' as 'normal' | 'fault' | 'maintenance' | 'offline',
    location: '',
    model: '',
    manufacturer: '',
    ipAddress: '',
    port: ''
  })
  if (deviceFormRef.value) {
    deviceFormRef.value.clearValidate()
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.device-management {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 15px;
  padding: 10px 20px 10px 20px;
  background: #ffffff;
  color: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333333;
}

.page-description {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
  color: #999999;
}

.three-column-layout {
  flex: 1;
  display: flex;
  gap: 20px;
  min-height: 0;
}

.left-panel,
.middle-panel,
.right-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.left-panel {
  width: 280px;
  flex-shrink: 0;
}

.middle-panel {
  flex: 1;
  min-width: 0;
}

.right-panel {
  width: 350px;
  flex-shrink: 0;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fafafa;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 250px;
}

.device-categories {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.category-item:hover {
  background: #f0f9ff;
  border-color: #e6f7ff;
}

.category-item.active {
  background: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

.category-icon {
  margin-right: 12px;
  font-size: 18px;
}

.category-name {
  flex: 1;
  font-weight: 500;
}

.device-count {
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 12px;
}

.category-item.active .device-count {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.table-container {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.device-details {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
  align-items: center;
}

.detail-item label {
  width: 80px;
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

.detail-item span {
  flex: 1;
  font-size: 13px;
  color: #333;
}

.maintenance-records {
  max-height: 200px;
  overflow-y: auto;
}

.maintenance-item {
  padding: 12px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #1890ff;
}

.record-date {
  font-size: 12px;
  color: #1890ff;
  font-weight: 500;
  margin-bottom: 4px;
}

.record-content {
  font-size: 13px;
  color: #333;
  margin-bottom: 4px;
}

.record-operator {
  font-size: 12px;
  color: #666;
}

.no-selection {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.no-selection-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-selection p {
  margin: 0;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .three-column-layout {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    width: 100%;
  }

  .left-panel {
    order: 1;
  }

  .middle-panel {
    order: 2;
  }

  .right-panel {
    order: 3;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 15px;
  }

  .page-title {
    font-size: 20px;
  }

  .panel-header {
    padding: 15px;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .search-input {
    width: 100%;
  }

  .device-categories {
    padding: 15px;
  }

  .table-container {
    padding: 15px;
  }

  .device-details {
    padding: 15px;
  }
}

/* 滚动条样式 */
.device-categories::-webkit-scrollbar,
.device-details::-webkit-scrollbar,
.maintenance-records::-webkit-scrollbar {
  width: 6px;
}

.device-categories::-webkit-scrollbar-track,
.device-details::-webkit-scrollbar-track,
.maintenance-records::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.device-categories::-webkit-scrollbar-thumb,
.device-details::-webkit-scrollbar-thumb,
.maintenance-records::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.device-categories::-webkit-scrollbar-thumb:hover,
.device-details::-webkit-scrollbar-thumb:hover,
.maintenance-records::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
