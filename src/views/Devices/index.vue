<template>
  <div class="device-management">
    <!-- 页面标题 -->
    <div class="page-title">
      <h1>设备管理</h1>
      <p class="subtitle">管理煤矿提升机相关设备，包括摄像头、传感器等设备</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-container">
      <!-- 左侧设备类型选择 -->
      <div class="sidebar">
        <h2>设备类型</h2>
        <div class="device-types">
          <div
            v-for="type in deviceTypes"
            :key="type.id"
            class="type-item"
            :class="{ active: selectedType === type.id }"
            @click="selectedType = type.id"
          >
            {{ type.name }}
          </div>
        </div>
      </div>

      <!-- 中间设备列表 -->
      <div class="device-list-container">
        <h2>设备列表</h2>

        <!-- 搜索和新增按钮 -->
        <div class="search-add-section">
          <el-input
            v-model="searchQuery"
            placeholder="搜索设备名称、编号..."
            class="search-input"
            @input="handleSearch"
          ></el-input>
          <el-button type="primary" @click="openAddDeviceDialog">+新增设备</el-button>
        </div>

        <!-- 设备表格 -->
        <el-table
          v-loading="loading"
          :data="paginatedDevices"
          style="width: 100%"
          @row-click="handleRowClick"
        >
          <el-table-column prop="code" label="设备编码" width="120" />
          <el-table-column prop="name" label="设备名称" width="150" />
          <el-table-column prop="type" label="设备类型" width="100">
            <template #default="scope">
              <el-tag :type="getTagType(scope.row.type)">{{ scope.row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <el-tag
                class="status-tag"
                :type="scope.row.status === 'online' ? 'success' : 'danger'"
              >
                {{ scope.row.status === 'online' ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="location" label="安装位置" width="150" />
          <el-table-column prop="installDate" label="安装日期" width="120" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
              <el-button
                size="small"
                class="edit-btn"
                @click.stop="editDevice(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                class="delete-btn"
                @click.stop="deleteDevice(scope.row.id, scope.row.type)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页控件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredDevices.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 右侧设备详情 -->
      <div class="device-detail-container">
        <h2>设备详情</h2>
        <div v-if="selectedDevice" class="detail-content">
          <div v-if="selectedDevice.type === '摄像头'" class="camera-detail">
            <div class="camera-image-placeholder">
              <p>摄像头画面</p>
            </div>
            <div class="detail-info">
              <p><strong>设备名称：</strong>{{ selectedDevice.name }}</p>
              <p><strong>设备类型：</strong>{{ selectedDevice.type }}</p>
              <p><strong>IP地址：</strong>{{ selectedDevice.ip }}</p>
              <p><strong>RTSP地址：</strong>{{ selectedDevice.rtsp }}</p>
              <p><strong>状态：</strong>{{ selectedDevice.status === 'online' ? '在线' : '离线' }}</p>
              <p><strong>安装位置：</strong>{{ selectedDevice.location }}</p>
              <p><strong>安装日期：</strong>{{ selectedDevice.installDate }}</p>
              <p><strong>创建时间：</strong>{{ selectedDevice.createTime }}</p>
            </div>
          </div>
          <div v-else-if="selectedDevice.type === '传感器'" class="sensor-detail">
            <div class="detail-info">
              <p><strong>设备名称：</strong>{{ selectedDevice.name }}</p>
              <p><strong>设备编码：</strong>{{ selectedDevice.code }}</p>
              <p><strong>设备类型：</strong>{{ selectedDevice.type }}</p>
              <p><strong>设备型号：</strong>{{ selectedDevice.model }}</p>
              <p><strong>制造商：</strong>{{ selectedDevice.manufacturer }}</p>
              <p><strong>安装位置：</strong>{{ selectedDevice.location }}</p>
              <p><strong>安装日期：</strong>{{ selectedDevice.installDate }}</p>
              <p><strong>额定功率：</strong>{{ selectedDevice.power }} kW</p>
              <p><strong>额定电压：</strong>{{ selectedDevice.voltage }} V</p>
              <p><strong>额定电流：</strong>{{ selectedDevice.current }} A</p>
              <p><strong>状态：</strong>{{ selectedDevice.status === 'online' ? '在线' : '离线' }}</p>
              <p><strong>创建时间：</strong>{{ selectedDevice.createTime }}</p>
              <p><strong>备注：</strong>{{ selectedDevice.remark }}</p>
            </div>
          </div>
          <div v-else class="mechanical-detail">
            <div class="detail-info">
              <p><strong>设备名称：</strong>{{ selectedDevice.name }}</p>
              <p><strong>设备编码：</strong>{{ selectedDevice.code }}</p>
              <p><strong>设备类型：</strong>{{ selectedDevice.type }}</p>
              <p><strong>设备型号：</strong>{{ selectedDevice.model }}</p>
              <p><strong>制造商：</strong>{{ selectedDevice.manufacturer }}</p>
              <p><strong>安装位置：</strong>{{ selectedDevice.location }}</p>
              <p><strong>安装日期：</strong>{{ selectedDevice.installDate }}</p>
              <p><strong>额定功率：</strong>{{ selectedDevice.power }} kW</p>
              <p><strong>额定电压：</strong>{{ selectedDevice.voltage }} V</p>
              <p><strong>额定电流：</strong>{{ selectedDevice.current }} A</p>
              <p><strong>状态：</strong>{{ selectedDevice.status === 'online' ? '在线' : '离线' }}</p>
              <p><strong>创建时间：</strong>{{ selectedDevice.createTime }}</p>
              <p><strong>备注：</strong>{{ selectedDevice.remark }}</p>
            </div>
          </div>
        </div>
        <div v-else class="no-device-selected">
          <p>请选择设备查看详情</p>
        </div>
      </div>
    </div>

    <!-- 新增/编辑设备弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑设备' : '新增设备'"
      width="600px"
    >
      <el-form
        ref="deviceFormRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择设备类型" @change="onDeviceTypeChange">
            <el-option label="机械设备" value="机械设备" />
            <el-option label="摄像头" value="摄像头" />
            <el-option label="传感器" value="传感器" />
          </el-select>
        </el-form-item>

        <el-form-item label="设备名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入设备名称" />
        </el-form-item>

        <!-- 通用字段 -->
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="formData.location" placeholder="请输入安装位置" />
        </el-form-item>

        <el-form-item label="安装日期" prop="installDate">
          <el-date-picker
            v-model="formData.installDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="设备状态" prop="status">
          <el-switch
            v-model="formData.status"
            active-value="online"
            inactive-value="offline"
            active-text="在线"
            inactive-text="离线"
          />
        </el-form-item>

        <!-- 摄像头特有字段 -->
        <template v-if="formData.type === '摄像头'">
          <el-form-item label="IP地址" prop="ip">
            <el-input v-model="formData.ip" placeholder="请输入IP地址" />
          </el-form-item>
          <el-form-item label="RTSP地址" prop="rtsp">
            <el-input v-model="formData.rtsp" placeholder="请输入RTSP地址" />
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="formData.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="formData.password" type="password" placeholder="请输入密码" />
          </el-form-item>
        </template>

        <!-- 设备和传感器特有字段 -->
        <template v-else>
          <el-form-item label="设备编码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入设备编码" />
          </el-form-item>
          <el-form-item label="设备型号" prop="model">
            <el-input v-model="formData.model" placeholder="请输入设备型号" />
          </el-form-item>
          <el-form-item label="制造商" prop="manufacturer">
            <el-input v-model="formData.manufacturer" placeholder="请输入制造商" />
          </el-form-item>
          <el-form-item label="额定功率(kW)" prop="power">
            <el-input-number v-model="formData.power" :min="0" />
          </el-form-item>
          <el-form-item label="额定电压(V)" prop="voltage">
            <el-input-number v-model="formData.voltage" :min="0" />
          </el-form-item>
          <el-form-item label="额定电流(A)" prop="current">
            <el-input-number v-model="formData.current" :min="0" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              placeholder="请输入备注信息"
            />
          </el-form-item>
        </template>
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

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ElForm } from 'element-plus'

// 导入API和类型
import { getDevicesApi } from '@/api/device'
import { getAllCamerasApi } from '@/api/camera'
import type { DeviceData } from '@/api/device/types/device'
import type { CameraData } from '@/api/camera/types/camera'

// 设备类型定义 - 移除"全部设备"选项
const deviceTypes = [
  { id: '机械设备', name: '机械设备' },
  { id: '摄像头', name: '摄像头' },
  { id: '传感器', name: '传感器' }
]

// 响应式数据
const selectedType = ref<string>('机械设备')
const searchQuery = ref<string>('')
const loading = ref<boolean>(false)
const dialogVisible = ref<boolean>(false)
const isEditMode = ref<boolean>(false)
const currentEditId = ref<number | null>(null)
const currentEditType = ref<string>('')
const selectedDevice = ref<any>(null)

// 分别存储设备、传感器和摄像头数据
const mechanicalDevices = ref<DeviceData[]>([])
const cameras = ref<CameraData[]>([])



// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 表单数据
const formData = reactive({
  id: null,
  type: '设备',
  name: '',
  code: '',
  model: '',
  manufacturer: '',
  location: '',
  installDate: '',
  power: 0,
  voltage: 0,
  current: 0,
  ip: '',
  rtsp: '',
  username: '',
  password: '',
  status: 'offline',
  remark: ''
})

// 表单验证规则
const formRules = {
  type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入设备编码', trigger: 'blur' },
    { min: 2, max: 20, message: '编码长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  model: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请输入制造商', trigger: 'blur' }],
  location: [{ required: true, message: '请输入安装位置', trigger: 'blur' }],
  installDate: [{ required: true, message: '请选择安装日期', trigger: 'change' }],
  ip: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
      message: '请输入有效的IP地址',
      trigger: 'blur'
    }
  ],
  rtsp: [{ required: true, message: '请输入RTSP地址', trigger: 'blur' }]
}

// 引用
const deviceFormRef = ref<InstanceType<typeof ElForm>>()

// 工具函数：格式化日期
function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 工具函数：获取标签类型 - 适配中文设备类型
function getTagType(type: string): string {
  const typeMap: Record<string, string> = {
    '机械设备': 'success',
    '摄像头': 'info',
    '传感器': 'primary'
  }
  return typeMap[type] || 'default'
}

// 计算属性：过滤后的设备列表（统一格式）
const filteredDevices = computed(() => {
  let allDevices: any[] = []

  // 添加设备和传感器数据 - 处理中文equipment_type
  const formattedDevices = mechanicalDevices.value
    .filter(device => {
      // 根据选择的类型进行过滤，不再有"全部"选项
      if (selectedType.value === '机械设备') {
        // 对于机械设备类型，排除摄像头和传感器
        return device.equipment_type !== '摄像头' && device.equipment_type !== '传感器'
      }
      return device.equipment_type === selectedType.value
    })
    .map(device => ({
      id: device.id,
      type: device.equipment_type, // 直接使用中文类型
      code: device.equipment_code,
      name: device.equipment_name,
      model: device.equipment_model,
      manufacturer: device.manufacturer,
      location: device.install_location,
      installDate: formatDate(device.install_date),
      power: device.rated_power,
      voltage: device.rated_voltage,
      current: device.rated_current,
      status: device.is_online === 0 ? 'offline' : 'online',
      createTime: formatDate(device.created_at),
      remark: device.remark
    }))

  // 添加摄像头数据
  const formattedCameras = cameras.value
    .filter(camera => selectedType.value === '摄像头') // 只在选择摄像头类型时显示
    .map(camera => ({
      id: camera.id,
      type: '摄像头', // 固定为中文类型
      code: `CAM-${camera.id}`,
      name: camera.name,
      ip: camera.ip,
      rtsp: camera.rtsp,
      username: camera.username,
      location: '',
      installDate: '',
      status: camera.status === 0 ? 'offline' : 'online',
      createTime: formatDate(camera.create_time)
    }))

  // 根据选择的类型组合数据
  if (selectedType.value === '机械设备') {
    allDevices = formattedDevices
  } else if (selectedType.value === '摄像头') {
    allDevices = formattedCameras
  } else if (selectedType.value === '传感器') {
    allDevices = formattedDevices
  }

  // 应用搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    allDevices = allDevices.filter(device =>
      device.name.toLowerCase().includes(query) ||
      device.code.toLowerCase().includes(query)
    )
  }

  return allDevices
})

// 计算属性：分页后的设备列表
const paginatedDevices = computed(() => {
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize
  const endIndex = startIndex + pagination.pageSize
  return filteredDevices.value.slice(startIndex, endIndex)
})

// 搜索处理
function handleSearch(): void {
  pagination.currentPage = 1 // 重置分页
}

// 分页大小变化
function handleSizeChange(size: number): void {
  pagination.pageSize = size
}

// 当前页码变化
function handleCurrentChange(current: number): void {
  pagination.currentPage = current
}

// 行点击处理
function handleRowClick(row: any): void {
  selectedDevice.value = row
}

// 打开新增设备对话框
function openAddDeviceDialog(): void {
  isEditMode.value = false
  currentEditId.value = null
  currentEditType.value = ''
  // 重置表单数据
  Object.assign(formData, {
    id: null,
    type: '设备',
    name: '',
    code: '',
    model: '',
    manufacturer: '',
    location: '',
    installDate: '',
    power: 0,
    voltage: 0,
    current: 0,
    ip: '',
    rtsp: '',
    username: '',
    password: '',
    status: 'offline',
    remark: ''
  })
  dialogVisible.value = true
}

// 编辑设备
function editDevice(row: any): void {
  isEditMode.value = true
  currentEditId.value = row.id
  currentEditType.value = row.type

  // 根据设备类型填充表单数据
  if (row.type === '摄像头') {
    const camera = cameras.value.find(c => c.id === row.id)
    if (camera) {
      Object.assign(formData, {
        id: camera.id,
        type: '摄像头',
        name: camera.name,
        ip: camera.ip,
        rtsp: camera.rtsp,
        username: camera.username,
        password: camera.password,
        location: row.location || '',
        installDate: row.installDate || '',
        status: camera.status === 0 ? 'offline' : 'online'
      })
    }
  } else {
    const device = mechanicalDevices.value.find(d => d.id === row.id)
    if (device) {
      Object.assign(formData, {
        id: device.id,
        type: device.equipment_type, // 使用中文类型
        name: device.equipment_name,
        code: device.equipment_code,
        model: device.equipment_model,
        manufacturer: device.manufacturer,
        location: device.install_location,
        installDate: device.install_date,
        power: device.rated_power,
        voltage: device.rated_voltage,
        current: device.rated_current,
        status: device.is_online === 0 ? 'offline' : 'online',
        remark: device.remark
      })
    }
  }

  dialogVisible.value = true
}

// 删除设备
function deleteDevice(id: number, type: string): void {
  ElMessageBox.confirm(
    '确定要删除该设备吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用删除API，现在仅做本地模拟
    if (type === '摄像头') {
      const index = cameras.value.findIndex(camera => camera.id === id)
      if (index !== -1) {
        cameras.value.splice(index, 1)
        ElMessage.success('摄像头删除成功')
      }
    } else {
      const index = mechanicalDevices.value.findIndex(device => device.id === id)
      if (index !== -1) {
        mechanicalDevices.value.splice(index, 1)
        ElMessage.success('设备删除成功')
      }
    }
    // 如果删除的是当前选中的设备，清除选中状态
    if (selectedDevice.value && selectedDevice.value.id === id) {
      selectedDevice.value = null
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 设备类型变化时的处理
function onDeviceTypeChange(): void {
  // 重置特定于其他类型的表单字段
  if (formData.type === '摄像头') {
    formData.code = ''
    formData.model = ''
    formData.manufacturer = ''
    formData.power = 0
    formData.voltage = 0
    formData.current = 0
    formData.remark = ''
  } else {
    formData.ip = ''
    formData.rtsp = ''
    formData.username = ''
    formData.password = ''
  }
}

// 提交表单
function handleSubmit(): void {
  deviceFormRef.value?.validate((valid) => {
    if (valid) {
      // 这里应该调用保存API，现在仅做本地模拟
      if (isEditMode.value) {
        // 编辑模式
        if (currentEditType.value === '摄像头') {
          const index = cameras.value.findIndex(camera => camera.id === currentEditId.value)
          if (index !== -1) {
            cameras.value[index] = {
              ...cameras.value[index],
              name: formData.name,
              ip: formData.ip,
              rtsp: formData.rtsp,
              username: formData.username,
              password: formData.password,
              status: formData.status === 'online' ? 1 : 0,
              update_time: new Date().toISOString()
            }
            ElMessage.success('摄像头更新成功')
          }
        } else {
          const index = mechanicalDevices.value.findIndex(device => device.id === currentEditId.value)
          if (index !== -1) {
            mechanicalDevices.value[index] = {
              ...mechanicalDevices.value[index],
              equipment_name: formData.name,
              equipment_code: formData.code,
              equipment_type: formData.type, // 使用中文类型
              equipment_model: formData.model,
              manufacturer: formData.manufacturer,
              install_location: formData.location,
              install_date: formData.installDate,
              rated_power: formData.power,
              rated_voltage: formData.voltage,
              rated_current: formData.current,
              is_online: formData.status === 'online' ? 1 : 0,
              updated_at: new Date().toISOString(),
              remark: formData.remark
            }
            ElMessage.success('设备更新成功')
          }
        }
      } else {
        // 新增模式
        if (formData.type === '摄像头') {
          const newCamera: CameraData = {
            id: Date.now(),
            name: formData.name,
            ip: formData.ip,
            username: formData.username,
            password: formData.password,
            rtsp: formData.rtsp,
            status: formData.status === 'online' ? 1 : 0,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            create_time: new Date().toISOString(),
            update_time: new Date().toISOString()
          }
          cameras.value.push(newCamera)
          ElMessage.success('摄像头添加成功')
        } else {
          const newDevice: DeviceData = {
            id: Date.now(),
            equipment_code: formData.code,
            equipment_name: formData.name,
            equipment_type: formData.type, // 使用中文类型
            equipment_model: formData.model,
            manufacturer: formData.manufacturer,
            install_location: formData.location,
            install_date: formData.installDate,
            rated_power: formData.power,
            rated_voltage: formData.voltage,
            rated_current: formData.current,
            equipment_status: formData.status,
            is_online: formData.status === 'online' ? 1 : 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            remark: formData.remark
          }
          mechanicalDevices.value.push(newDevice)
          ElMessage.success('设备添加成功')
        }
      }

      dialogVisible.value = false
      // 重置表单引用
      deviceFormRef.value?.resetFields()
    }
  })
}

// 获取所有设备数据
async function fetchAllDevices(): Promise<void> {
  loading.value = true
  try {
    // 获取机械设备和传感器数据
    const mechanicalResponse = await getDevicesApi({
      page: 1,
      page_size: 1000
    })
    if (mechanicalResponse && mechanicalResponse.data && mechanicalResponse.data.list) {
      mechanicalDevices.value = mechanicalResponse.data.list
    }

    // 获取摄像头数据
    const cameraResponse = await getAllCamerasApi()
    if (cameraResponse && cameraResponse.data && cameraResponse.data && cameraResponse.data.list) {
      cameras.value = cameraResponse.data.list
    }

    // 无论API调用是否成功，如果数据为空，都加载模拟数据
    if (mechanicalDevices.value.length === 0 && cameras.value.length === 0) {
      provideMockData()
    }
  } catch (error) {
    console.error('获取设备数据失败:', error)
    // 在API调用失败时提供模拟数据
    provideMockData()
    ElMessage.error('获取设备数据失败，已加载模拟数据')
  } finally {
    loading.value = false
  }
}

// 提供模拟数据（API调用失败时使用）
function provideMockData(): void {
  // 模拟机械设备和传感器数据 - 使用中文设备类型
  mechanicalDevices.value = [
    {
      id: 1,
      equipment_code: 'YF001',
      equipment_name: '1号主压风机',
      equipment_type: '机械设备', // 修改为'机械设备'，与过滤逻辑匹配
      equipment_model: 'L2-50/8',
      manufacturer: '沈阳鼓风机集团',
      install_location: '地面压风机房',
      install_date: '2021-01-10T00:00:00',
      rated_power: 630,
      rated_voltage: 6000,
      rated_current: 65,
      equipment_status: '运行',
      is_online: 1,
      created_at: '2025-09-06T10:55:50',
      updated_at: '2025-09-06T10:55:50',
      remark: '主要压风设备'
    },
    // 丰富的传感器数据
    {
      id: 2,
      equipment_code: 'CGQ001',
      equipment_name: '提升机压力传感器',
      equipment_type: '传感器', // 中文类型
      equipment_model: 'MPM480',
      manufacturer: '传感器公司',
      install_location: '主井井筒',
      install_date: '2022-05-08T00:00:00',
      rated_power: 5,
      rated_voltage: 24,
      rated_current: 0.2,
      equipment_status: '正常',
      is_online: 1,
      created_at: '2025-09-06T10:55:50',
      updated_at: '2025-09-06T10:55:50',
      remark: '提升机压力监测'
    },
    {
      id: 3,
      equipment_code: 'WD001',
      equipment_name: '温度传感器',
      equipment_type: '传感器', // 中文类型
      equipment_model: 'PT100',
      manufacturer: '测温仪器厂',
      install_location: '主通风机房',
      install_date: '2023-01-15T00:00:00',
      rated_power: 10,
      rated_voltage: 24,
      rated_current: 0.4,
      equipment_status: '正常',
      is_online: 1,
      created_at: '2025-09-06T10:55:50',
      updated_at: '2025-09-06T10:55:50',
      remark: '电机温度监测'
    },
    {
      id: 4,
      equipment_code: 'FS001',
      equipment_name: '风速传感器',
      equipment_type: '传感器', // 中文类型
      equipment_model: 'GFW15',
      manufacturer: '风速仪表公司',
      install_location: '风井',
      install_date: '2022-11-20T00:00:00',
      rated_power: 8,
      rated_voltage: 24,
      rated_current: 0.3,
      equipment_status: '正常',
      is_online: 1,
      created_at: '2025-09-06T10:55:50',
      updated_at: '2025-09-06T10:55:50',
      remark: '通风风速监测'
    },
    {
      id: 5,
      equipment_code: 'YLD001',
      equipment_name: '振动传感器',
      equipment_type: '传感器', // 中文类型
      equipment_model: 'VS-068',
      manufacturer: '振动测量公司',
      install_location: '提升机电机',
      install_date: '2023-03-10T00:00:00',
      rated_power: 6,
      rated_voltage: 24,
      rated_current: 0.25,
      equipment_status: '正常',
      is_online: 1,
      created_at: '2025-09-06T10:55:50',
      updated_at: '2025-09-06T10:55:50',
      remark: '电机振动监测'
    },
    {
      id: 6,
      equipment_code: 'DCQ001',
      equipment_name: '电流传感器',
      equipment_type: '传感器',
      equipment_model: 'ACS712',
      manufacturer: '电流测量公司',
      install_location: '中央变电所',
      install_date: '2022-08-15T00:00:00',
      rated_power: 4,
      rated_voltage: 24,
      rated_current: 0.17,
      equipment_status: '正常',
      is_online: 1,
      created_at: '2025-09-06T10:55:50',
      updated_at: '2025-09-06T10:55:50',
      remark: '供电电流监测'
    },
    {
      id: 7,
      equipment_code: 'DQY001',
      equipment_name: '电压传感器',
      equipment_type: '传感器',
      equipment_model: 'LV25-P',
      manufacturer: '电压测量公司',
      install_location: '井下变电所',
      install_date: '2023-02-20T00:00:00',
      rated_power: 5,
      rated_voltage: 24,
      rated_current: 0.21,
      equipment_status: '正常',
      is_online: 1,
      created_at: '2025-09-06T10:55:50',
      updated_at: '2025-09-06T10:55:50',
      remark: '供电电压监测'
    },
    {
      id: 8,
      equipment_code: 'CO2_001',
      equipment_name: '二氧化碳传感器',
      equipment_type: '传感器',
      equipment_model: 'GTH1000',
      manufacturer: '气体检测公司',
      install_location: '3101掘进面',
      install_date: '2023-05-10T00:00:00',
      rated_power: 7,
      rated_voltage: 24,
      rated_current: 0.29,
      equipment_status: '正常',
      is_online: 1,
      created_at: '2025-09-06T10:55:50',
      updated_at: '2025-09-06T10:55:50',
      remark: '气体浓度监测'
    },
    {
      id: 9,
      equipment_code: 'CH4_001',
      equipment_name: '甲烷传感器',
      equipment_type: '传感器',
      equipment_model: 'KGJ16',
      manufacturer: '气体检测公司',
      install_location: '2103回采面',
      install_date: '2023-04-15T00:00:00',
      rated_power: 8,
      rated_voltage: 24,
      rated_current: 0.33,
      equipment_status: '正常',
      is_online: 1,
      created_at: '2025-09-06T10:55:50',
      updated_at: '2025-09-06T10:55:50',
      remark: '瓦斯浓度监测'
    },
    {
      id: 10,
      equipment_code: 'YSQ001',
      equipment_name: '液位传感器',
      equipment_type: '传感器',
      equipment_model: '投入式液位计',
      manufacturer: '液位测量公司',
      install_location: '井下泵房水仓',
      install_date: '2023-01-25T00:00:00',
      rated_power: 6,
      rated_voltage: 24,
      rated_current: 0.25,
      equipment_status: '正常',
      is_online: 1,
      created_at: '2025-09-06T10:55:50',
      updated_at: '2025-09-06T10:55:50',
      remark: '水仓水位监测'
    },
    {
      id: 11,
      equipment_code: 'GZQ001',
      equipment_name: '光照传感器',
      equipment_type: '传感器',
      equipment_model: 'BH1750',
      manufacturer: '光学仪器厂',
      install_location: '井口候车室',
      install_date: '2023-06-10T00:00:00',
      rated_power: 3,
      rated_voltage: 24,
      rated_current: 0.13,
      equipment_status: '正常',
      is_online: 1,
      created_at: '2025-09-06T10:55:50',
      updated_at: '2025-09-06T10:55:50',
      remark: '环境光照监测'
    },
    {
      id: 12,
      equipment_code: 'WDQ002',
      equipment_name: '温度传感器',
      equipment_type: '传感器',
      equipment_model: 'DS18B20',
      manufacturer: '测温仪器厂',
      install_location: '提升机房',
      install_date: '2023-03-20T00:00:00',
      rated_power: 2,
      rated_voltage: 24,
      rated_current: 0.08,
      equipment_status: '正常',
      is_online: 1,
      created_at: '2025-09-06T10:55:50',
      updated_at: '2025-09-06T10:55:50',
      remark: '机房环境温度监测'
    }
  ]

  // 丰富的摄像头数据
  cameras.value = [
    {
      id: 101,
      name: '主井摄像头',
      ip: '192.168.1.101',
      username: 'admin',
      password: '123456',
      rtsp: 'rtsp://192.168.1.101:554/stream1',
      status: 1,
      x: 100,
      y: 150,
      vx: 200,
      vy: 300,
      create_time: '2022-01-20T10:00:00Z',
      update_time: '2023-06-15T14:30:00Z'
    },
    {
      id: 102,
      name: '风井摄像头',
      ip: '192.168.1.102',
      username: 'admin',
      password: '123456',
      rtsp: 'rtsp://192.168.1.102:554/stream1',
      status: 1,
      x: 200,
      y: 250,
      vx: 400,
      vy: 500,
      create_time: '2022-02-15T11:30:00Z',
      update_time: '2023-05-20T16:45:00Z'
    },
    {
      id: 103,
      name: '压风机房摄像头',
      ip: '192.168.1.103',
      username: 'admin',
      password: '123456',
      rtsp: 'rtsp://192.168.1.103:554/stream1',
      status: 1,
      x: 300,
      y: 350,
      vx: 600,
      vy: 700,
      create_time: '2022-03-20T09:15:00Z',
      update_time: '2023-04-10T11:20:00Z'
    },
    {
      id: 104,
      name: '水泵房摄像头',
      ip: '192.168.1.104',
      username: 'admin',
      password: '123456',
      rtsp: 'rtsp://192.168.1.104:554/stream1',
      status: 1,
      x: 400,
      y: 450,
      vx: 800,
      vy: 900,
      create_time: '2022-04-05T14:20:00Z',
      update_time: '2023-03-15T08:30:00Z'
    },
    {
      id: 105,
      name: '井口摄像头',
      ip: '192.168.1.105',
      username: 'admin',
      password: '123456',
      rtsp: 'rtsp://192.168.1.105:554/stream1',
      status: 0,
      x: 500,
      y: 550,
      vx: 1000,
      vy: 1100,
      create_time: '2022-05-10T16:45:00Z',
      update_time: '2023-02-20T10:15:00Z'
    },
    {
      id: 106,
      name: '井下变电所摄像头',
      ip: '192.168.1.106',
      username: 'admin',
      password: '123456',
      rtsp: 'rtsp://192.168.1.106:554/stream1',
      status: 1,
      x: 600,
      y: 650,
      vx: 1200,
      vy: 1300,
      create_time: '2022-06-15T09:30:00Z',
      update_time: '2023-07-25T15:40:00Z'
    },
    {
      id: 107,
      name: '提升机房摄像头',
      ip: '192.168.1.107',
      username: 'admin',
      password: '123456',
      rtsp: 'rtsp://192.168.1.107:554/stream1',
      status: 1,
      x: 700,
      y: 750,
      vx: 1400,
      vy: 1500,
      create_time: '2022-07-20T14:15:00Z',
      update_time: '2023-08-10T11:30:00Z'
    },
    {
      id: 108,
      name: '主通风机房摄像头',
      ip: '192.168.1.108',
      username: 'admin',
      password: '123456',
      rtsp: 'rtsp://192.168.1.108:554/stream1',
      status: 1,
      x: 800,
      y: 850,
      vx: 1600,
      vy: 1700,
      create_time: '2022-08-25T10:45:00Z',
      update_time: '2023-09-05T16:20:00Z'
    },
    {
      id: 109,
      name: '调度室摄像头',
      ip: '192.168.1.109',
      username: 'admin',
      password: '123456',
      rtsp: 'rtsp://192.168.1.109:554/stream1',
      status: 1,
      x: 900,
      y: 950,
      vx: 1800,
      vy: 1900,
      create_time: '2022-09-30T15:20:00Z',
      update_time: '2023-10-15T10:10:00Z'
    },
    {
      id: 110,
      name: '井口候车室摄像头',
      ip: '192.168.1.110',
      username: 'admin',
      password: '123456',
      rtsp: 'rtsp://192.168.1.110:554/stream1',
      status: 0,
      x: 1000,
      y: 1050,
      vx: 2000,
      vy: 2100,
      create_time: '2022-10-05T11:30:00Z',
      update_time: '2023-11-20T14:50:00Z'
    },
    {
      id: 111,
      name: '仓库摄像头',
      ip: '192.168.1.111',
      username: 'admin',
      password: '123456',
      rtsp: 'rtsp://192.168.1.111:554/stream1',
      status: 1,
      x: 1100,
      y: 1150,
      vx: 2200,
      vy: 2300,
      create_time: '2022-11-10T09:45:00Z',
      update_time: '2023-12-05T12:30:00Z'
    },
    {
      id: 112,
      name: '办公区摄像头',
      ip: '192.168.1.112',
      username: 'admin',
      password: '123456',
      rtsp: 'rtsp://192.168.1.112:554/stream1',
      status: 1,
      x: 1200,
      y: 1250,
      vx: 2400,
      vy: 2500,
      create_time: '2022-12-15T16:20:00Z',
      update_time: '2024-01-15T10:40:00Z'
    }
  ]
}

// 组件挂载时获取数据
onMounted(() => {
  fetchAllDevices()
})
</script>

<style scoped>
.device-management {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
}

.page-title h1 {
  font-size: 24px;
  margin: 0 0 5px 0;
  color: #333;
}

.page-title .subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.content-container {
  display: flex;
  gap: 20px;
}

/* 左侧设备类型选择 */
.sidebar {
  width: 200px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.sidebar h2 {
  font-size: 16px;
  margin: 0 0 15px 0;
  color: #333;
}

.device-types {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.type-item {
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  font-size: 14px;
}

.type-item:hover {
  background: #e9ecef;
}

.type-item.active {
  background: #007bff;
  color: white;
}

/* 中间设备列表 */
.device-list-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 右侧设备详情 */
.device-detail-container {
  width: 300px; /* 添加明确的宽度 */
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0; /* 防止被压缩 */
}

.device-detail-container h2 {
  font-size: 16px;
  margin: 0 0 20px 0;
  color: #333;
}

.search-add-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .device-types {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .device-detail-container {
    width: 100%;
  }
}

/* 消除状态标签后的点 */
:deep(.status-tag) {
  position: relative;
}

:deep(.status-tag::after) {
  content: none !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .device-types {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .device-detail-container {
    width: 100%;
  }
}

/* 编辑和删除按钮样式 */
:deep(.edit-btn) {
  background-color: #409eff;
  color: white;
  border-radius: 4px;
  padding: 4px 12px;
  margin-right: 8px;
  font-size: 12px;
  min-width: 48px;
}

:deep(.delete-btn) {
  background-color: #f56c6c;
  color: white;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 12px;
  min-width: 48px;
}

:deep(.edit-btn:hover) {
  background-color: #66b1ff;
  color: white;
}

:deep(.delete-btn:hover) {
  background-color: #f78989;
  color: white;
}
</style>
