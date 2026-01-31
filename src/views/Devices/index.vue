<template>
  <div class="device-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h1>设备管理</h1>
        <p>管理煤矿提升机相关设备，包括摄像头、传感器等设备</p>
      </div>
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
            <el-icon v-if="type.id === '机械设备'" ><Tools /></el-icon>
            <el-icon v-else-if="type.id === '摄像头'"><VideoCamera /></el-icon>
            <el-icon v-else-if="type.id === '传感器'"><DataAnalysis /></el-icon>
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

          <el-table-column v-if="selectedType === '机械设备'" prop="is_online" label="状态" width="80">
            <template #default="scope">
              <el-tag
                class="status-tag"
                :type="scope.row.is_online === 1 ? 'success' : 'danger'"
              >
                {{ scope.row.is_online === 1 ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column v-if="selectedType === '摄像头'" prop="status" label="状态" width="80">
            <template #default="scope">
              <el-tag
                class="status-tag"
                :type="scope.row.status === '运行' ? 'success' : 'danger'"
              >
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>


          <el-table-column v-if="selectedType === '机械设备'" prop="location" label="安装位置" width="150" />
          <!-- <el-table-column v-if="selectedType === '机械设备'" prop="installDate" label="安装日期" width="120" /> -->
          <el-table-column v-if="selectedType === '摄像头'" prop="createTime" label="创建时间" width="150" />
          <el-table-column v-if="selectedType === '摄像头'" prop="updateTime" label="更新时间" width="150" />


          <el-table-column label="操作" width="150" fixed="right">
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
                @click.stop="deleteDevice(scope.row)"
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
              <p><strong>状态：</strong>{{ selectedDevice.status  }}</p>
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
              <!-- <p><strong>安装日期：</strong>{{ selectedDevice.installDate }}</p> -->
              <p><strong>额定功率：</strong>{{ selectedDevice.power }} kW</p>
              <p><strong>额定电压：</strong>{{ selectedDevice.voltage }} V</p>
              <p><strong>额定电流：</strong>{{ selectedDevice.current }} A</p>
              <p><strong>状态：</strong>{{ selectedDevice.is_online === 1 ? '在线' : '离线' }}</p>
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

    <!-- 新增设备弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增设备"
      width="600px"
    >
      <el-form
        ref="addDeviceFormRef"
        :model="addFormData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item  v-if="selectedType === '机械设备'"  label="设备类型" prop="equipment_type">
          <el-select v-model="addFormData.equipment_type" placeholder="请选择设备类型" >
            <el-option label="提升机" value="提升机" />
            <el-option label="压风机" value="压风机" />
            <el-option label="排水机" value="排水机" />
            <el-option label="运输机" value="运输机" />
          </el-select>
        </el-form-item>

        <el-form-item  label="设备名称" prop="equipment_name">
          <el-input v-model="addFormData.equipment_name" placeholder="请输入设备名称" />
        </el-form-item>

        <!-- 通用字段 -->
        <el-form-item v-if="selectedType === '机械设备'" label="安装位置" prop="install_location">
          <el-input v-model="addFormData.install_location" placeholder="请输入安装位置" />
        </el-form-item>

        <el-form-item v-if="selectedType === '机械设备'" label="安装日期" prop="install_date">
          <el-date-picker
            v-model="addFormData.install_date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 修改状态字段 -->
        <el-form-item  v-if="selectedType === '机械设备'" label="设备状态" prop="equipment_status">
          <el-select v-model="addFormData.equipment_status" placeholder="请选择设备状态">
            <el-option label="运行" value="运行" />
            <el-option label="停机" value="停机" />
            <el-option label="故障" value="故障" />
            <el-option label="维护" value="维护" />
          </el-select>
        </el-form-item>


        <!-- 摄像头特有字段 -->
        <template v-if="selectedType === '摄像头'">
          <el-form-item label="IP地址" prop="ip">
            <el-input v-model="addFormData.ip" placeholder="请输入IP地址" />
          </el-form-item>
          <el-form-item label="RTSP地址" prop="rtsp">
            <el-input v-model="addFormData.rtsp" placeholder="请输入RTSP地址" />
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addFormData.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addFormData.password" type="password" placeholder="请输入密码" />
          </el-form-item>
          <!-- 新增坐标输入框 -->
          <el-form-item label="X坐标" prop="x">
            <el-input-number v-model="addFormData.x" :min="0" :step="0.01" :precision="2" placeholder="请输入X坐标" />
          </el-form-item>
          <el-form-item label="Y坐标" prop="y">
            <el-input-number v-model="addFormData.y" :min="0" :step="0.01" :precision="2" placeholder="请输入Y坐标" />
          </el-form-item>
        </template>

        <!-- 设备和传感器特有字段 -->
        <template v-else>
          <el-form-item label="设备编码" prop="equipment_code">
            <el-input v-model="addFormData.equipment_code" placeholder="请输入设备编码" />
          </el-form-item>
          <el-form-item label="规格型号" prop="equipment_model">
            <el-input v-model="addFormData.equipment_model" placeholder="请输入规格型号" />
          </el-form-item>
          <el-form-item label="制造商" prop="manufacturer">
            <el-input v-model="addFormData.manufacturer" placeholder="请输入制造商" />
          </el-form-item>
          <el-form-item label="额定功率(kW)" prop="rated_power">
            <el-input-number v-model="addFormData.rated_power" :min="0" />
          </el-form-item>
          <el-form-item label="额定电压(V)" prop="rated_voltage">
            <el-input-number v-model="addFormData.rated_voltage" :min="0" />
          </el-form-item>
          <el-form-item label="额定电流(A)" prop="rated_current">
            <el-input-number v-model="addFormData.rated_current" :min="0" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="addFormData.remark"
              type="textarea"
              placeholder="请输入备注信息"
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑设备弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑设备"
      width="600px"
    >
      <el-form
        ref="editDeviceFormRef"
        :model="editFormData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item  v-if="selectedType === '机械设备'"  label="设备类型" prop="equipment_type">
          <el-select v-model="editFormData.equipment_type" placeholder="请选择设备类型" >
            <el-option label="提升机" value="提升机" />
            <el-option label="压风机" value="压风机" />
            <el-option label="排水机" value="排水机" />
            <el-option label="运输机" value="运输机" />
          </el-select>
        </el-form-item>

        <el-form-item label="设备名称" prop="equipment_name">
          <el-input v-model="editFormData.equipment_name" placeholder="请输入设备名称" />
        </el-form-item>

        <!-- 通用字段 -->
        <el-form-item  v-if="selectedType === '机械设备'" label="安装位置" prop="install_location">
          <el-input v-model="editFormData.install_location" placeholder="请输入安装位置" />
        </el-form-item>

        <el-form-item  v-if="selectedType === '机械设备'" label="安装日期" prop="install_date">
          <el-date-picker
            v-model="editFormData.install_date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 修改状态字段 -->
        <el-form-item  v-if="selectedType === '机械设备'" label="设备状态" prop="equipment_status">
          <el-select v-model="editFormData.equipment_status" placeholder="请选择设备状态">
            <el-option label="运行" value="运行" />
            <el-option label="停机" value="停机" />
            <el-option label="故障" value="故障" />
            <el-option label="维护" value="维护" />
          </el-select>
        </el-form-item>

        <!-- 添加在线状态字段 -->
        <el-form-item v-if="selectedType === '机械设备'" label="在线状态" prop="is_online">
          <el-select v-model="editFormData.is_online" placeholder="请选择在线状态">
            <el-option label="离线" value= 0 />
            <el-option label="在线" value= 1 />
          </el-select>
        </el-form-item>


        <!-- 摄像头特有字段 -->
        <template v-if="selectedType === '摄像头'">
          <el-form-item label="IP地址" prop="ip">
            <el-input v-model="editFormData.ip" placeholder="请输入IP地址" />
          </el-form-item>
          <el-form-item label="RTSP地址" prop="rtsp">
            <el-input v-model="editFormData.rtsp" placeholder="请输入RTSP地址" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
          <el-select v-model="editFormData.status" placeholder="请选择状态">
            <el-option label="停用" value="停用" />
            <el-option label="运行" value="运行" />
          </el-select>
        </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editFormData.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="editFormData.password" type="password" placeholder="请输入密码" />
          </el-form-item>
          <!-- 添加坐标输入框 -->
          <el-form-item label="X坐标" prop="x">
            <el-input-number v-model="editFormData.x" :min="0" :step="0.01" :precision="2" placeholder="请输入X坐标" />
          </el-form-item>
          <el-form-item label="Y坐标" prop="y">
            <el-input-number v-model="editFormData.y" :min="0" :step="0.01" :precision="2" placeholder="请输入Y坐标" />
          </el-form-item>
        </template>

        <!-- 设备和传感器特有字段 -->
        <template v-else>
          <el-form-item label="设备编码" prop="equipment_code">
            <el-input v-model="editFormData.equipment_code" placeholder="请输入设备编码" />
          </el-form-item>
          <el-form-item label="规格型号" prop="equipment_model">
            <el-input v-model="editFormData.equipment_model" placeholder="请输入规格型号" />
          </el-form-item>
          <el-form-item label="制造商" prop="manufacturer">
            <el-input v-model="editFormData.manufacturer" placeholder="请输入制造商" />
          </el-form-item>
          <el-form-item label="额定功率(kW)" prop="rated_power">
            <el-input-number v-model="editFormData.rated_power" :min="0" />
          </el-form-item>
          <el-form-item label="额定电压(V)" prop="rated_voltage">
            <el-input-number v-model="editFormData.rated_voltage" :min="0" />
          </el-form-item>
          <el-form-item label="额定电流(A)" prop="rated_current">
            <el-input-number v-model="editFormData.rated_current" :min="0" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="editFormData.remark"
              type="textarea"
              placeholder="请输入备注信息"
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleEditSubmit">确定</el-button>
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
import { getDevicesApi , addDeviceApi,updateDeviceApi,deleteDeviceApi} from '@/api/device'
import { getAllCamerasApi, addCameraApi, updateCameraApi, deleteCameraApi } from '@/api/camera'
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
const addDialogVisible = ref<boolean>(false)
const editDialogVisible = ref<boolean>(false)
const currentEditId = ref<number | null>(null)
const currentEditType = ref<string>('')
const selectedDevice = ref<any>(null)
const originalEquipmentCode = ref<string>('')

// 分别存储设备、传感器和摄像头数据
const mechanicalDevices = ref<DeviceData[]>([])
const cameras = ref<CameraData[]>([])



// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 独立的表单数据
const addFormData = reactive({
  id: null,
  equipment_type: '',
  equipment_name: '',
  equipment_code: '',
  equipment_model: '',
  manufacturer: '',
  install_location: '',
  install_date: '',
  rated_power: 0,
  rated_voltage: 0,
  rated_current: 0,
  equipment_status: '运行',
  // 摄像头特有字段
  ip: '',
  rtsp: '',
  username: '',
  password: '',
  remark: '',
  x: 0,
  y: 0
})

// 编辑表单数据
const editFormData = reactive({
  id: null,
  equipment_type: '',
  equipment_name: '',
  equipment_code: '',
  equipment_model: '',
  manufacturer: '',
  install_location: '',
  install_date: '',
  rated_power: 0,
  rated_voltage: 0,
  rated_current: 0,
  equipment_status: '运行',
  is_online: 0,
  // 摄像头特有字段
  ip: '',
  rtsp: '',
  username: '',
  password: '',
  remark: '',
  status: '',
  x: 0,
  y: 0
})

// 独立的表单引用
const addDeviceFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const editDeviceFormRef = ref<InstanceType<typeof ElForm> | null>(null)
// 表单验证规则
const formRules = {
  equipment_type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  equipment_name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  equipment_code: [
    { required: true, message: '请输入设备编码', trigger: 'blur' },
    { min: 2, max: 20, message: '编码长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  equipment_model: [{ required: true, message: '请输入设备型号', trigger: 'blur' }], // 修改字段名和提示
  manufacturer: [{ required: true, message: '请输入制造商', trigger: 'blur' }],
  install_location: [{ required: true, message: '请输入安装位置', trigger: 'blur' }], // 修改字段名
  install_date: [{ required: true, message: '请选择安装日期', trigger: 'change' }], // 修改字段名
  equipment_status: [{ required: true, message: '请选择设备状态', trigger: 'change' }], // 修改字段名
  // 摄像头相关验证规则
  ip: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
      message: '请输入有效的IP地址',
      trigger: 'blur'
    }
  ],
  rtsp: [{ required: true, message: '请输入RTSP地址', trigger: 'blur' }],
  rated_power: [{ type: 'number', min: 0, message: '功率不能为负数', trigger: 'blur' }],
  rated_voltage: [{ type: 'number', min: 0, message: '电压不能为负数', trigger: 'blur' }],
  rated_current: [{ type: 'number', min: 0, message: '电流不能为负数', trigger: 'blur' }]
}


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
      status: device.equipment_status,
      createTime: formatDate(device.create_time),
      remark: device.remark,
      is_online: device.is_online
    }))

  // 添加摄像头数据
  const formattedCameras = cameras.value
    .map(camera => ({
      id: camera.id,
      type: '摄像头', // 固定为中文类型
      code: `CAM-${camera.id}`,
      name: camera.name,
      ip: camera.ip,
      rtsp: camera.rtsp,
      username: camera.username,
      password: camera.password,
      location: '',
      installDate: '',
      status: camera.status === 0 ? '停用' : '运行',
      createTime: formatDate(camera.create_time),
      updateTime: formatDate(camera.update_time),
      x: camera.x,
      y: camera.y
    }))

  // 根据选择的类型组合数据
  if (selectedType.value === '机械设备') {
    // 按类型分组排序：提升机 -> 压风机 -> 排水机 -> 运输机
    allDevices = formattedDevices.sort((a, b) => {
      const typeOrder = ['提升机', '压风机', '排水机', '运输机']
      const indexA = typeOrder.indexOf(a.type)
      const indexB = typeOrder.indexOf(b.type)
      
      // 如果都在列表中，按列表顺序排序
      if (indexA !== -1 && indexB !== -1) {
        if (indexA !== indexB) return indexA - indexB
        // 类型相同按编码排序
        return (a.code || '').localeCompare(b.code || '')
      }
      
      // 如果只有一个在列表中，在列表中的排前面
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1
      
      // 都不在列表中，按类型名称排序
      const typeCompare = (a.type || '').localeCompare(b.type || '', 'zh-CN')
      if (typeCompare !== 0) return typeCompare
      
      return (a.code || '').localeCompare(b.code || '')
    })
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
  currentEditId.value = null
  currentEditType.value = ''
  // 重置表单数据
  Object.assign(addFormData, {
    id: null,
    equipment_type: '',
    equipment_name: '',
    equipment_code: '',
    equipment_model: '',
    manufacturer: '',
    install_location: '',
    install_date: '',
    rated_power: 0,
    rated_voltage: 0,
    rated_current: 0,
    equipment_status: '',
    // 摄像头特有字段
    ip: '',
    rtsp: '',
    username: '',
    password: '',
    remark: '',
    x: 0,
    y: 0
  })
  addDialogVisible.value = true
}

// 编辑设备
function editDevice(device: any ): void {
  currentEditId.value = device.id
  currentEditType.value = device.type

  if (selectedType.value === '摄像头') {
    const camera = device
    // 填充摄像头数据
    Object.assign(editFormData, {
      id: camera.id,
      equipment_type: '摄像头',
      equipment_name: camera.name,
      ip: camera.ip || '',
      rtsp: camera.rtsp || '',
      username: camera.username || '',
      password: camera.password || '',
      status: camera.status,
      x: camera.x,
      y: camera.y
    })
  } else {
    const deviceData = device
    // 填充设备数据
    Object.assign(editFormData, {
      id: deviceData.id,
      equipment_type: deviceData.type,
      equipment_name: deviceData.name,
      equipment_code: deviceData.code,
      equipment_model: deviceData.model,
      manufacturer: deviceData.manufacturer,
      install_location: deviceData.location,
      install_date: deviceData.installDate,
      rated_power: deviceData.power,
      rated_voltage: deviceData.voltage,
      rated_current: deviceData.current,
      equipment_status: deviceData.status || '运行',
      is_online: deviceData.is_online,
      remark: deviceData.remark || ''
    })
    originalEquipmentCode.value = deviceData.code
  }
  editDialogVisible.value = true

}


// 删除设备
function deleteDevice(device: any): void {
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
    if (device.type === '摄像头' || selectedType.value === '摄像头') {
      deleteCameraApi({ id: device.id }).then(() => {
        fetchAllDevices() // 重新获取数据
      }).catch(() => {
        ElMessage.error('删除设备失败')
      })
    } else {

      deleteDeviceApi(device.code).then(() => {
        // const index = mechanicalDevices.value.findIndex(device => device.id === id)
        // if (index !== -1) {
        //   mechanicalDevices.value.splice(index, 1)
        //   ElMessage.success('设备删除成功')
        // }
        fetchAllDevices() // 重新获取数据
      }).catch(() => {
        ElMessage.error('删除设备失败')
      })
    }
    // 如果删除的是当前选中的设备，清除选中状态
    if (selectedDevice.value && selectedDevice.value.code === device.code) {
      selectedDevice.value = null
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 新增设备类型变更
// function onAddDeviceTypeChange(value: string): void {
//   if (value === '摄像头') {
//     // 清空设备和传感器特有字段
//     addFormData.equipment_code = ''
//     addFormData.equipment_model = ''
//     addFormData.manufacturer = ''
//     addFormData.install_location = ''
//     addFormData.install_date = ''
//     addFormData.rated_power = 0
//     addFormData.rated_voltage = 0
//     addFormData.rated_current = 0
//   } else {
//     // 清空摄像头特有字段
//     addFormData.ip = ''
//     addFormData.rtsp = ''
//     addFormData.username = ''
//     addFormData.password = ''
//   }
// }

// 编辑设备类型变更
// function onEditDeviceTypeChange(value: string): void {
//   // 编辑模式下可能需要更严格的控制，这里仅作参考
//   if (value === '摄像头') {
//     // 清空设备和传感器特有字段
//     editFormData.equipment_code = ''
//     editFormData.equipment_model = ''
//     editFormData.manufacturer = ''
//     editFormData.install_location = ''
//     editFormData.install_date = ''
//     editFormData.rated_power = 0
//     editFormData.rated_voltage = 0
//     editFormData.rated_current = 0
//   } else {
//     // 清空摄像头特有字段
//     editFormData.ip = ''
//     editFormData.rtsp = ''
//     editFormData.username = ''
//     editFormData.password = ''
//   }
// }




// 新增设备表单提交
function handleAddSubmit(): void {
  addDeviceFormRef.value?.validate((valid) => {
    if (valid) {
      // 根据设备类型进行不同的API调用
      if (selectedType.value === '摄像头') {
        // 摄像头新增逻辑
        const add_cameraData = {
          name: addFormData.equipment_name,
          ip: addFormData.ip,
          rtsp: addFormData.rtsp,
          username: addFormData.username,
          password: addFormData.password,
          // 新增坐标字段
          x: addFormData.x,
          y: addFormData.y
        }

        addCameraApi(add_cameraData)
          .then(() => {
            ElMessage.success('摄像头添加成功')
            fetchAllDevices() // 重新获取数据
            addDialogVisible.value = false
          })
          .catch(error => {
            ElMessage.error('摄像头添加失败')
            console.error(error)
          })
      } else if (selectedType.value === '机械设备' || selectedType.value === '传感器') {
        // 机械设备和传感器新增逻辑
        const add_deviceData = {
          equipment_code: addFormData.equipment_code,
          equipment_name: addFormData.equipment_name,
          equipment_type: addFormData.equipment_type,
          equipment_model: addFormData.equipment_model,
          manufacturer: addFormData.manufacturer,
          install_location: addFormData.install_location,
          install_date: addFormData.install_date ? new Date(addFormData.install_date).toISOString() : '',
          rated_power: addFormData.rated_power,
          rated_voltage: addFormData.rated_voltage,
          rated_current: addFormData.rated_current,
          equipment_status: addFormData.equipment_status,
          remark: addFormData.remark
        }

        addDeviceApi(add_deviceData)
          .then(() => {
            ElMessage.success('设备添加成功')
            fetchAllDevices() // 重新获取数据
            addDialogVisible.value = false
          })
          .catch(error => {
            ElMessage.error('设备添加失败')
            console.error(error)
          })
      }
    }

  })
}

// 编辑设备表单提交
function handleEditSubmit(): void {
  editDeviceFormRef.value?.validate((valid) => {
    if (valid) {
      // 根据设备类型进行不同的API调用
      if (selectedType.value === '摄像头') {
        // 摄像头编辑逻辑
        const edit_cameraData = {
          id: currentEditId.value,
          name: editFormData.equipment_name,
          ip: editFormData.ip,
          rtsp: editFormData.rtsp,
          username: editFormData.username,
          password: editFormData.password,
          // 新增状态字段
          status: editFormData.status === '停用' ? 0 : 1,
          // 新增坐标字段
          x: editFormData.x,
          y: editFormData.y
        }

        updateCameraApi(edit_cameraData)
          .then(() => {
            ElMessage.success('摄像头更新成功')
            fetchAllDevices() // 重新获取数据
            editDialogVisible.value = false
          })
          .catch(error => {
            ElMessage.error('摄像头更新失败')
            console.error(error)
          })
      } else if (selectedType.value === '机械设备' || selectedType.value === '传感器') {
        // 机械设备和传感器编辑逻辑
        const edit_deviceData = {
          equipment_code: editFormData.equipment_code,
          equipment_name: editFormData.equipment_name,
          equipment_type: editFormData.equipment_type,
          equipment_model: editFormData.equipment_model,
          manufacturer: editFormData.manufacturer,
          install_location: editFormData.install_location,
          install_date: editFormData.install_date ? new Date(editFormData.install_date).toISOString() : '',
          rated_power: editFormData.rated_power,
          rated_voltage: editFormData.rated_voltage,
          rated_current: editFormData.rated_current,
          equipment_status: editFormData.equipment_status,
          is_online: editFormData.is_online,
          remark: editFormData.remark
        }

        updateDeviceApi(originalEquipmentCode.value, edit_deviceData)
          .then(() => {
            ElMessage.success('设备更新成功')
            fetchAllDevices()
            editDialogVisible.value = false
          })
          .catch(error => {
            ElMessage.error('设备更新失败')
            console.error(error)
          })
      }
    }
  })
}

// 获取所有设备数据
async function fetchAllDevices(): Promise<void> {
  loading.value = true
  try {
    // 获取机械设备数据（保持不变）
      const mechanicalResponse = await getDevicesApi({
      page: 1,
      page_size: 1000
    })
    if (mechanicalResponse && mechanicalResponse.data && mechanicalResponse.data.list) {
      mechanicalDevices.value = mechanicalResponse.data.list
    }

    //获取摄像头数据（但无论是否获取到，都使用模拟数据）
    const cameraResponse = await getAllCamerasApi()
    if (cameraResponse && cameraResponse.data && cameraResponse.data && cameraResponse.data.list) {
      cameras.value = cameraResponse.data.list
    }

  } catch (error) {
    console.error('获取设备数据失败:', error)
    // 在API调用失败时提供模拟数据
    //provideMockData()
    ElMessage.error('获取设备数据失败，已加载模拟数据')
  } finally {
    loading.value = false
  }
}

// // 提供模拟数据（保持机械设备数据不变，只添加传感器和摄像头数据）
// function provideMockData(): void {
//   // 保存原始的机械设备数据，用于后续过滤
//   const originalMechanicalDevices = [...mechanicalDevices.value]

//   // 模拟传感器数据 - 使用中文设备类型
//   const sensors = [
//     {
//       id: 1001, // 使用较大ID避免冲突
//       equipment_code: 'CGQ001',
//       equipment_name: '提升机压力传感器',
//       equipment_type: '传感器', // 中文类型
//       equipment_model: 'MPM480',
//       manufacturer: '传感器公司',
//       install_location: '主井井筒',
//       install_date: '2022-05-08T00:00:00',
//       rated_power: 5,
//       rated_voltage: 24,
//       rated_current: 0.2,
//       equipment_status: '正常',
//       is_online: 1,
//       created_at: '2025-09-06T10:55:50',
//       updated_at: '2025-09-06T10:55:50',
//       remark: '提升机压力监测'
//     },
//     {
//       id: 1002,
//       equipment_code: 'WD001',
//       equipment_name: '温度传感器',
//       equipment_type: '传感器', // 中文类型
//       equipment_model: 'PT100',
//       manufacturer: '测温仪器厂',
//       install_location: '主通风机房',
//       install_date: '2023-01-15T00:00:00',
//       rated_power: 10,
//       rated_voltage: 24,
//       rated_current: 0.4,
//       equipment_status: '正常',
//       is_online: 1,
//       created_at: '2025-09-06T10:55:50',
//       updated_at: '2025-09-06T10:55:50',
//       remark: '电机温度监测'
//     },
//     {
//       id: 1003,
//       equipment_code: 'FS001',
//       equipment_name: '风速传感器',
//       equipment_type: '传感器', // 中文类型
//       equipment_model: 'GFW15',
//       manufacturer: '风速仪表公司',
//       install_location: '风井',
//       install_date: '2022-11-20T00:00:00',
//       rated_power: 8,
//       rated_voltage: 24,
//       rated_current: 0.3,
//       equipment_status: '正常',
//       is_online: 1,
//       created_at: '2025-09-06T10:55:50',
//       updated_at: '2025-09-06T10:55:50',
//       remark: '通风风速监测'
//     },
//     {
//       id: 1004,
//       equipment_code: 'YLD001',
//       equipment_name: '振动传感器',
//       equipment_type: '传感器', // 中文类型
//       equipment_model: 'VS-068',
//       manufacturer: '振动测量公司',
//       install_location: '提升机电机',
//       install_date: '2023-03-10T00:00:00',
//       rated_power: 6,
//       rated_voltage: 24,
//       rated_current: 0.25,
//       equipment_status: '正常',
//       is_online: 1,
//       created_at: '2025-09-06T10:55:50',
//       updated_at: '2025-09-06T10:55:50',
//       remark: '电机振动监测'
//     },
//     {
//       id: 1005,
//       equipment_code: 'DCQ001',
//       equipment_name: '电流传感器',
//       equipment_type: '传感器',
//       equipment_model: 'ACS712',
//       manufacturer: '电流测量公司',
//       install_location: '中央变电所',
//       install_date: '2022-08-15T00:00:00',
//       rated_power: 4,
//       rated_voltage: 24,
//       rated_current: 0.17,
//       equipment_status: '正常',
//       is_online: 1,
//       created_at: '2025-09-06T10:55:50',
//       updated_at: '2025-09-06T10:55:50',
//       remark: '供电电流监测'
//     },
//     {
//       id: 1006,
//       equipment_code: 'DQY001',
//       equipment_name: '电压传感器',
//       equipment_type: '传感器',
//       equipment_model: 'LV25-P',
//       manufacturer: '电压测量公司',
//       install_location: '井下变电所',
//       install_date: '2023-02-20T00:00:00',
//       rated_power: 5,
//       rated_voltage: 24,
//       rated_current: 0.21,
//       equipment_status: '正常',
//       is_online: 1,
//       created_at: '2025-09-06T10:55:50',
//       updated_at: '2025-09-06T10:55:50',
//       remark: '供电电压监测'
//     },
//     {
//       id: 1007,
//       equipment_code: 'CO2_001',
//       equipment_name: '二氧化碳传感器',
//       equipment_type: '传感器',
//       equipment_model: 'GTH1000',
//       manufacturer: '气体检测公司',
//       install_location: '3101掘进面',
//       install_date: '2023-05-10T00:00:00',
//       rated_power: 7,
//       rated_voltage: 24,
//       rated_current: 0.29,
//       equipment_status: '正常',
//       is_online: 1,
//       created_at: '2025-09-06T10:55:50',
//       updated_at: '2025-09-06T10:55:50',
//       remark: '气体浓度监测'
//     },
//     {
//       id: 1008,
//       equipment_code: 'CH4_001',
//       equipment_name: '甲烷传感器',
//       equipment_type: '传感器',
//       equipment_model: 'KGJ16',
//       manufacturer: '气体检测公司',
//       install_location: '2103回采面',
//       install_date: '2023-04-15T00:00:00',
//       rated_power: 8,
//       rated_voltage: 24,
//       rated_current: 0.33,
//       equipment_status: '正常',
//       is_online: 1,
//       created_at: '2025-09-06T10:55:50',
//       updated_at: '2025-09-06T10:55:50',
//       remark: '瓦斯浓度监测'
//     },
//     {
//       id: 1009,
//       equipment_code: 'YSQ001',
//       equipment_name: '液位传感器',
//       equipment_type: '传感器',
//       equipment_model: '投入式液位计',
//       manufacturer: '液位测量公司',
//       install_location: '井下泵房水仓',
//       install_date: '2023-01-25T00:00:00',
//       rated_power: 6,
//       rated_voltage: 24,
//       rated_current: 0.25,
//       equipment_status: '正常',
//       is_online: 1,
//       created_at: '2025-09-06T10:55:50',
//       updated_at: '2025-09-06T10:55:50',
//       remark: '水仓水位监测'
//     },
//     {
//       id: 1010,
//       equipment_code: 'GZQ001',
//       equipment_name: '光照传感器',
//       equipment_type: '传感器',
//       equipment_model: 'BH1750',
//       manufacturer: '光学仪器厂',
//       install_location: '井口候车室',
//       install_date: '2023-06-10T00:00:00',
//       rated_power: 3,
//       rated_voltage: 24,
//       rated_current: 0.13,
//       equipment_status: '正常',
//       is_online: 1,
//       created_at: '2025-09-06T10:55:50',
//       updated_at: '2025-09-06T10:55:50',
//       remark: '环境光照监测'
//     },
//     {
//       id: 1011,
//       equipment_code: 'WDQ002',
//       equipment_name: '温度传感器',
//       equipment_type: '传感器',
//       equipment_model: 'DS18B20',
//       manufacturer: '测温仪器厂',
//       install_location: '提升机房',
//       install_date: '2023-03-20T00:00:00',
//       rated_power: 2,
//       rated_voltage: 24,
//       rated_current: 0.08,
//       equipment_status: '正常',
//       is_online: 1,
//       created_at: '2025-09-06T10:55:50',
//       updated_at: '2025-09-06T10:55:50',
//       remark: '机房环境温度监测'
//     }
//   ]

//   // 保留原始机械设备数据，只添加传感器数据
//   mechanicalDevices.value = originalMechanicalDevices.filter(device => device.equipment_type !== '传感器')
//   mechanicalDevices.value = [...mechanicalDevices.value, ...sensors]
// ,

//   cameras.value = [
//     {
//       id: 101,
//       name: '主井摄像头',
//       ip: '192.168.1.101',
//       username: 'admin',
//       password: '123456',
//       rtsp: 'rtsp://192.168.1.101:554/stream1',
//       status: 1,
//       x: 100,
//       y: 150,
//       vx: 200,
//       vy: 300,
//       create_time: '2022-01-20T10:00:00Z',
//       update_time: '2023-06-15T14:30:00Z'
//     },
//     {
//       id: 102,
//       name: '风井摄像头',
//       ip: '192.168.1.102',
//       username: 'admin',
//       password: '123456',
//       rtsp: 'rtsp://192.168.1.102:554/stream1',
//       status: 1,
//       x: 200,
//       y: 250,
//       vx: 400,
//       vy: 500,
//       create_time: '2022-02-15T11:30:00Z',
//       update_time: '2023-05-20T16:45:00Z'
//     },
//     {
//       id: 103,
//       name: '压风机房摄像头',
//       ip: '192.168.1.103',
//       username: 'admin',
//       password: '123456',
//       rtsp: 'rtsp://192.168.1.103:554/stream1',
//       status: 1,
//       x: 300,
//       y: 350,
//       vx: 600,
//       vy: 700,
//       create_time: '2022-03-20T09:15:00Z',
//       update_time: '2023-04-10T11:20:00Z'
//     },
//     {
//       id: 104,
//       name: '水泵房摄像头',
//       ip: '192.168.1.104',
//       username: 'admin',
//       password: '123456',
//       rtsp: 'rtsp://192.168.1.104:554/stream1',
//       status: 1,
//       x: 400,
//       y: 450,
//       vx: 800,
//       vy: 900,
//       create_time: '2022-04-05T14:20:00Z',
//       update_time: '2023-03-15T08:30:00Z'
//     },
//     {
//       id: 105,
//       name: '井口摄像头',
//       ip: '192.168.1.105',
//       username: 'admin',
//       password: '123456',
//       rtsp: 'rtsp://192.168.1.105:554/stream1',
//       status: 0,
//       x: 500,
//       y: 550,
//       vx: 1000,
//       vy: 1100,
//       create_time: '2022-05-10T16:45:00Z',
//       update_time: '2023-02-20T10:15:00Z'
//     },
//     {
//       id: 106,
//       name: '井下变电所摄像头',
//       ip: '192.168.1.106',
//       username: 'admin',
//       password: '123456',
//       rtsp: 'rtsp://192.168.1.106:554/stream1',
//       status: 1,
//       x: 600,
//       y: 650,
//       vx: 1200,
//       vy: 1300,
//       create_time: '2022-06-15T09:30:00Z',
//       update_time: '2023-07-25T15:40:00Z'
//     },
//     {
//       id: 107,
//       name: '提升机房摄像头',
//       ip: '192.168.1.107',
//       username: 'admin',
//       password: '123456',
//       rtsp: 'rtsp://192.168.1.107:554/stream1',
//       status: 1,
//       x: 700,
//       y: 750,
//       vx: 1400,
//       vy: 1500,
//       create_time: '2022-07-20T14:15:00Z',
//       update_time: '2023-08-10T11:30:00Z'
//     },
//     {
//       id: 108,
//       name: '主通风机房摄像头',
//       ip: '192.168.1.108',
//       username: 'admin',
//       password: '123456',
//       rtsp: 'rtsp://192.168.1.108:554/stream1',
//       status: 1,
//       x: 800,
//       y: 850,
//       vx: 1600,
//       vy: 1700,
//       create_time: '2022-08-25T10:45:00Z',
//       update_time: '2023-09-05T16:20:00Z'
//     },
//     {
//       id: 109,
//       name: '调度室摄像头',
//       ip: '192.168.1.109',
//       username: 'admin',
//       password: '123456',
//       rtsp: 'rtsp://192.168.1.109:554/stream1',
//       status: 1,
//       x: 900,
//       y: 950,
//       vx: 1800,
//       vy: 1900,
//       create_time: '2022-09-30T15:20:00Z',
//       update_time: '2023-10-15T10:10:00Z'
//     },
//     {
//       id: 110,
//       name: '井口候车室摄像头',
//       ip: '192.168.1.110',
//       username: 'admin',
//       password: '123456',
//       rtsp: 'rtsp://192.168.1.110:554/stream1',
//       status: 0,
//       x: 1000,
//       y: 1050,
//       vx: 2000,
//       vy: 2100,
//       create_time: '2022-10-05T11:30:00Z',
//       update_time: '2023-11-20T14:50:00Z'
//     },
//     {
//       id: 111,
//       name: '仓库摄像头',
//       ip: '192.168.1.111',
//       username: 'admin',
//       password: '123456',
//       rtsp: 'rtsp://192.168.1.111:554/stream1',
//       status: 1,
//       x: 1100,
//       y: 1150,
//       vx: 2200,
//       vy: 2300,
//       create_time: '2022-11-10T09:45:00Z',
//       update_time: '2023-12-05T12:30:00Z'
//     },
//     {
//       id: 112,
//       name: '办公区摄像头',
//       ip: '192.168.1.112',
//       username: 'admin',
//       password: '123456',
//       rtsp: 'rtsp://192.168.1.112:554/stream1',
//       status: 1,
//       x: 1200,
//       y: 1250,
//       vx: 2400,
//       vy: 2500,
//       create_time: '2022-12-15T16:20:00Z',
//       update_time: '2024-01-15T10:40:00Z'
//     }
//   ]
// }

// 组件挂载时获取数据
onMounted(() => {
  fetchAllDevices()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 20px 10px 20px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.header-left h1 {
  margin: 0 0 8px 0;
  color: #333333;
  font-size: 24px;
  font-weight: 600;
}

.header-left p {
  margin: 0;
  color: #999999;
  font-size: 14px;
}
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-item .el-icon {
  font-size: 16px;
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
