<script setup lang="ts">
import {ref, onActivated, nextTick, onMounted, onBeforeUnmount} from 'vue'
// 图标资源
import surfaceImage from '@/assets/map/map.svg'; // 使用项目中现有的图片作为底图
import {throttle} from "lodash";
import svgPanZoom from 'svg-pan-zoom';
import CameraItem from './component/CameraItem/index.vue';
import { getAllCamerasApi, addCameraApi, updateCameraApi, deleteCameraApi } from '@/api/camera';
import type { AddCameraRequestParams, UpdateCameraRequestParams } from '@/api/camera/types/camera'
import { ElMessage, ElMessageBox } from 'element-plus';

interface Camera {
  id: number;
  name: string;
  ip: string;
  username: string;
  password: string;
  rtsp: string;
  status: number;
  vx: number;
  vy: number;
  create_time: string;
  update_time: string;
  show?: boolean;
}

// 缓存键名常量
const LAYER_VISIBILITY_STATE = 'layer_visibility_state';
const TOKEN = 'token';

// ————————————————————————————————————————————————————————————————————————————— 图标
// 响应式调整底图宽高
const restrictedWidth = ref<number>(window.innerWidth);
const restrictedHeight = ref<number>(window.innerHeight);

// 监听窗口大小变化
const handleResize = () => {
  restrictedWidth.value = window.innerWidth;
  restrictedHeight.value = window.innerHeight;

  // 根据屏幕尺寸自动调整侧边栏状态
  const shouldCollapse = window.innerWidth <= 768;
  if (shouldCollapse && (!leftSidebarCollapsed.value || !rightSidebarCollapsed.value)) {
    leftSidebarCollapsed.value = true;
    rightSidebarCollapsed.value = true;
  }
};

onMounted(() => {
  fetchCameraData();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

// 摄像头列表 - 煤矿GIS监控点位
// const CameraList = ref<Camera[]>([
//   {
//     id: 1,
//     name: '主井口监控',
//     ip: '192.168.1.101',
//     username: 'admin',
//     password: '123456',
//     rtsp: 'rtsp://192.168.1.101:554/main_shaft',
//     status: 1,
//     vx: 120,
//     vy: 222,
//     create_time: '2024-01-01',
//     update_time: '2024-01-01',
//     show: true
//   },
//   {
//     id: 2,
//     name: '副井口监控',
//     ip: '192.168.1.102',
//     username: 'admin',
//     password: '123456',
//     rtsp: 'rtsp://192.168.1.102:554/sub_shaft',
//     status: 1,
//     vx: 200,
//     vy: 95,
//     x: 0,
//     y: 0,
//     create_time: '2024-01-01',
//     update_time: '2024-01-01',
//     show: true
//   },
//   {
//     id: 3,
//     name: '1301工作面',
//     ip: '192.168.1.103',
//     username: 'admin',
//     password: '123456',
//     rtsp: 'rtsp://192.168.1.103:554/workface_1301',
//     status: 1,
//     vx: 503,
//     vy: 252,
//     x: 0,
//     y: 0,
//     create_time: '2024-01-01',
//     update_time: '2024-01-01',
//     show: true
//   }
// ]);
// 摄像头列表 - 现在使用空数组初始化
const CameraList = ref<Camera[]>([]);

// 定义缩放比例
const scale = ref(1);
// 定义偏移量
const offsetX = ref(0);
const offsetY = ref(0);



const mainBoxRef = ref<HTMLElement | null>(null);

const handleDragStartCamera = (e: DragEvent) => {
  e.dataTransfer?.setData('text/plain', 'camera');
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
};

const handleDropCamera = async (e: DragEvent) => {
  e.preventDefault();
  const kind = e.dataTransfer?.getData('text/plain');
  if (kind !== 'camera') return;
  const rect = mainBoxRef.value?.getBoundingClientRect();
  if (!rect) return;
  const dropX = e.clientX - rect.left;
  const dropY = e.clientY - rect.top;
  const vx = Math.round((dropX - offsetX.value) / scale.value);
  const vy = Math.round((dropY - offsetY.value) / scale.value);

  // 记录临时选点坐标并打开“添加摄像头”弹窗，由用户填写配置后再保存
  tempPosition.value = { vx, vy };
  newCameraForm.value.x = vx;
  newCameraForm.value.y = vy;
  addDialogVisible.value = true;
};
// 获取摄像头列表数据的函数
const fetchCameraData = async () => {
  try {
    const response = await getAllCamerasApi();
    // 检查响应数据格式并适配
    if (response.data && response.data.list) {
      // 将后端返回的数据适配到当前所需的格式
      CameraList.value = response.data.list.map((camera: any) => ({
        id: camera.id,
        name: camera.name,
        ip: camera.ip,
        username: camera.username || 'admin',
        password: camera.password || '123456',
        rtsp: camera.rtsp,
        status: camera.status || 0,
        vx: camera.vx || (camera.x || 0), // 如果没有vx，使用x或默认0
        vy: camera.vy || (camera.y || 0), // 如果没有vy，使用y或默认0
        create_time: camera.create_time || new Date().toISOString().split('T')[0],
        update_time: camera.update_time || new Date().toISOString().split('T')[0],
        show: camera.status === 1 ? true : false // 默认显示
      }));
    } else {
      ElMessage.error('获取摄像头数据失败');
      console.error('摄像头数据格式不正确:', response);
    }
  } catch (error) {
    ElMessage.error('获取摄像头数据时发生错误');
    console.error('获取摄像头数据失败:', error);
  }
  // finally {
  //   loading.value = false;
  // }
};

// ————————————————————————————————————————————————————————————————————————————— 添加摄像头模式相关状态
// 是否处于添加摄像头模式
const isAddMode = ref(false)
// 是否处于删除/编辑选择模式
const isDeleteMode = ref(false)
const isEditMode = ref(false)
// 是否处于查看模式（用于明确提示与按钮状态，不改变select-mode）
const isViewMode = ref(false)
// 临时选点坐标（存储未缩放的地图坐标系下的vx/vy）
const tempPosition = ref<{ vx: number; vy: number } | null>(null)
// 添加摄像头表单数据
const addDialogVisible = ref(false)
const newCameraForm = ref<AddCameraRequestParams>({
  // 摄像头基础信息，用户填写
  name: '',
  ip: '',
  username: '',
  password: '',
  rtsp: '',
  // 坐标信息，用户在地图点击选点后自动填充
  x: 0,
  y: 0,
})

// 进入添加模式
const startAddCamera = () => {
  isAddMode.value = true
  tempPosition.value = null
  addDialogVisible.value = false
}

// 取消添加模式
const cancelAddCamera = () => {
  isAddMode.value = false
  tempPosition.value = null
  addDialogVisible.value = false
}

// 进入删除模式
const startDeleteMode = () => {
  isDeleteMode.value = true
  isEditMode.value = false
}

// 取消删除模式
const cancelDeleteMode = () => {
  isDeleteMode.value = false
}

// 进入编辑模式
const startEditMode = () => {
  isEditMode.value = true
  isDeleteMode.value = false
  isViewMode.value = false
}

// 取消编辑模式
const cancelEditMode = () => {
  isEditMode.value = false
  editDialogVisible.value = false
}

// 进入查看模式
const startViewMode = () => {
  isViewMode.value = true
  isDeleteMode.value = false
  isEditMode.value = false
}

// 取消查看模式
const cancelViewMode = () => {
  isViewMode.value = false
}

// 地图点击事件：将屏幕坐标转换为地图坐标（vx/vy）
const handleMapClick = (event: MouseEvent) => {
  if (!isAddMode.value) return
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  // 计算点击点相对于主地图容器的本地坐标
  const localX = event.clientX - rect.left
  const localY = event.clientY - rect.top
  // 依据当前pan/zoom状态，将本地像素坐标反变换为未缩放的地图坐标
  const vx = (localX - offsetX.value) / scale.value
  const vy = (localY - offsetY.value) / scale.value
  tempPosition.value = { vx, vy }
  // 将坐标同步到表单中，供用户确认
  newCameraForm.value.x = vx
  newCameraForm.value.y = vy
  // 打开添加表单弹窗
  addDialogVisible.value = true
}

// 提交添加摄像头
const submitAddCamera = async () => {
  try {
    // 基础校验，避免空数据提交
    if (!newCameraForm.value.name?.trim()) {
      ElMessage.warning('请输入摄像头名称')
      return
    }
    if (!tempPosition.value) {
      ElMessage.warning('请在地图上选择位置')
      return
    }

    const payload: AddCameraRequestParams = { ...newCameraForm.value }
    const res = await addCameraApi(payload)
    if (res ) {

      ElMessage.success('摄像头添加成功')
      await fetchCameraData()
      // 重置添加状态
      cancelAddCamera()
    } else {
      ElMessage.error((res as any)?.message || '摄像头添加失败')
    }
  } catch (e) {
    ElMessage.error('摄像头添加异常')
    console.error(e)
  }
}

// 选择的摄像头ID与编辑表单
const selectedCameraId = ref<number | null>(null)
const editDialogVisible = ref(false)
const editCameraForm = ref<UpdateCameraRequestParams>({
  id: 0,
  name: '',
  ip: '',
  username: '',
  password: '',
  rtsp: '',
  status: 1,
  x: 0,
  y: 0
})

// 查看摄像头属性对话框与数据
const viewDialogVisible = ref(false)
const viewCameraData = ref<Camera | null>(null)

// 处理摄像头选择（删除/编辑/查看）
const onCameraSelected = async (item: any) => {
  if (isDeleteMode.value) {
    try {
      await ElMessageBox.confirm('确认删除该摄像头？', '提示', { type: 'warning' })
      const res = await deleteCameraApi({ id: item.id })
      if (res.code === 1) {
        ElMessage.success('删除成功')
        fetchCameraData()
        isDeleteMode.value = false
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch {
      // 用户取消
    }
    return
  }

  if (isEditMode.value) {
    selectedCameraId.value = item.id
    editCameraForm.value = {
      id: item.id,
      name: item.name,
      ip: item.ip,
      username: item.username,
      password: item.password,
      rtsp: item.rtsp,
      status: item.status ?? 1,
      x: item.vx,
      y: item.vy
    }
    editDialogVisible.value = true
    return
  }

  if (isViewMode.value) {
    // 填充查看数据并打开查看弹窗
    viewCameraData.value = {
      id: item.id,
      name: item.name,
      ip: item.ip,
      username: item.username,
      password: item.password,
      rtsp: item.rtsp,
      status: item.status ?? 1,
      vx: item.vx,
      vy: item.vy,
      create_time: item.create_time,
      update_time: item.update_time,
      show: item.show
    }
    viewDialogVisible.value = true
    return
  }
}

// 提交编辑摄像头
const submitEditCamera = async () => {
  try {
    const payload: UpdateCameraRequestParams = { ...editCameraForm.value }
    const res = await updateCameraApi(payload)
    if (res.code === 1) {
      ElMessage.success('更新成功')
      await fetchCameraData()
      editDialogVisible.value = false
      isEditMode.value = false
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (e) {
    ElMessage.error('更新异常')
    console.error(e)
  }
}

// 图层状态接口定义
interface LayerVisibilityState {
  isCameraVisible: boolean;
}

// 默认图层状态 - 确保摄像头默认可见
const defaultLayerState: LayerVisibilityState = {
  isCameraVisible: true
};

// 从本地存储加载图层状态
const loadLayerState = (): LayerVisibilityState => {
  try {
    const saved = localStorage.getItem(LAYER_VISIBILITY_STATE);
    if (saved) {
      const parsed = JSON.parse(saved) as LayerVisibilityState;
      // 确保所有必需的属性都存在
      return {
        isCameraVisible: parsed.isCameraVisible ?? defaultLayerState.isCameraVisible,
      };
    }
  } catch (error) {
    console.warn('加载图层状态失败，使用默认状态:', error);
  }
  return defaultLayerState;
};

// 保存图层状态到本地存储
const saveLayerState = () => {
  try {
    const state: LayerVisibilityState = {
      isCameraVisible: isCameraVisible.value
    };
    localStorage.setItem(LAYER_VISIBILITY_STATE, JSON.stringify(state));
    console.log('图层状态已保存:', state); // 调试信息
  } catch (error) {
    console.warn('保存图层状态失败:', error);
  }
};

// 初始化图层状态（从本地存储加载）
const initialState = loadLayerState();

// 控制图层显隐
const isCameraVisible = ref(initialState.isCameraVisible);

// 侧边栏控制 - 根据屏幕尺寸初始化
const initSidebarState = () => {
  const screenWidth = window.innerWidth;
  return screenWidth <= 768; // 小屏幕默认收缩
};

const leftSidebarCollapsed = ref(initSidebarState());
const rightSidebarCollapsed = ref(initSidebarState());

// 图层状态
const layerStates = ref({
  sensors: true,
  ventilation: true,
  safety: true
});

// 设备状态数据
const onlineDevices = ref(24);
const offlineDevices = ref(3);
const warningDevices = ref(2);

// 工作面信息
const workingFaces = ref([
  {id: 1, name: '1301工作面', status: 'working', statusText: '正常生产'},
  {id: 2, name: '1302工作面', status: 'maintenance', statusText: '检修中'},
  {id: 3, name: '1303工作面', status: 'stopped', statusText: '停产'}
]);

// 实时告警数据
const realtimeAlerts = ref([
  {
    id: 1,
    time: '14:32:15',
    message: '瓦斯浓度超标警报',
    location: '1301工作面',
    level: 'critical'
  },
  {
    id: 2,
    time: '14:28:42',
    message: '环境温度异常升高',
    location: '主运输巷道',
    level: 'warning'
  },
  {
    id: 3,
    time: '14:25:18',
    message: '人员定位信号丢失',
    location: '掘进工作面',
    level: 'info'
  },
  {
    id: 4,
    time: '14:20:33',
    message: '通风系统风速过低',
    location: '副井通风道',
    level: 'warning'
  },
  {
    id: 5,
    time: '14:15:07',
    message: '设备运行状态异常',
    location: '主井提升机房',
    level: 'critical'
  },
  {
    id: 6,
    time: '14:12:55',
    message: '粉尘浓度监测告警',
    location: '1302工作面',
    level: 'warning'
  },
  {
    id: 7,
    time: '14:08:21',
    message: '紧急停车按钮触发',
    location: '运输皮带区域',
    level: 'critical'
  },
  {
    id: 8,
    time: '14:05:12',
    message: '监控摄像头离线',
    location: '安全出口3号',
    level: 'info'
  }
]);

// 环境监测数据
// ————————————————————————————————————————————————————————————————————————————— 报警弹窗逻辑
const alarmVisible = ref(false);
const alarmData = ref({
  cameraName: '',
  time: '',
  conf: 0
});

const handleAlarm = (data: { camera: any, info: any }) => {
  // 简单的防抖：如果当前已经有弹窗且未处理，可以选择忽略或更新
  // 这里选择更新并显示
  alarmData.value = {
    cameraName: data.camera.name,
    time: new Date().toLocaleTimeString(),
    conf: data.info.conf
  };
  alarmVisible.value = true;

  // 播放报警音效（可选）
  // playAlarmSound();
};

const closeAlarm = () => {
  alarmVisible.value = false;
};

const handleAlarmConfirm = () => {
  ElMessage.success('报警已处理');
  closeAlarm();
};

const gasConcentration = ref(0.3);
const temperature = ref(28);
const humidity = ref(65);
const windSpeed = ref(2.5);

// 人员统计数据
const personnelCount = ref({
  total: 156,
  underground: 89,
  surface: 67
});

// 视频监控数据
const videoFeeds = ref([
  {id: 1, name: '主井口', status: 'online', statusText: '在线'},
  {id: 2, name: '副井口', status: 'online', statusText: '在线'},
  {id: 3, name: '1301工作面', status: 'offline', statusText: '离线'},
  {id: 4, name: '主运输巷', status: 'online', statusText: '在线'}
]);

// 侧边栏切换方法
const toggleLeftSidebar = () => {
  leftSidebarCollapsed.value = !leftSidebarCollapsed.value;
};

const toggleRightSidebar = () => {
  rightSidebarCollapsed.value = !rightSidebarCollapsed.value;
};

// ————————————————————————————————————————————————————————————————————————————— 地图
const svgTiger = ref();
// 定义 initPanZoom 函数
const initPanZoom = () => {
  try {
    // 确保在尺寸获取后初始化
    if (!restrictedWidth.value || !restrictedHeight.value) return;

    const svgElement = document.getElementById('svg-trigger');
    if (!svgElement) {
      console.error('SVG元素未找到');
      return;
    }

    // 确保svg-pan-zoom只初始化一次
    if (svgTiger.value) {
      svgTiger.value.destroy();
    }

    // 强制设置SVG对齐方式为左上角，防止容器变宽导致地图居中而产生坐标偏移
    try {
      const embedEl = svgElement as HTMLEmbedElement;
      // 某些浏览器或环境下可能需要稍作等待，但此处是在handleSVGLoad后调用的，应已就绪
      const svgDoc = embedEl.getSVGDocument();
      if (svgDoc && svgDoc.documentElement) {
        svgDoc.documentElement.setAttribute('preserveAspectRatio', 'xMinYMin meet');
      }
    } catch (e) {
      console.warn('无法修改SVG对齐方式:', e);
    }

    // 初始化 svg-pan-zoom
    svgTiger.value = svgPanZoom('#svg-trigger', {
      zoomScaleSensitivity: 0.25,
      zoomEnabled: true,
      maxZoom: 100,
      // 监听缩放事件
      onZoom: function (newZoom: number) {
        scale.value = newZoom;
        const pan = svgTiger.value?.getPan?.();
        if (pan) {
          offsetX.value = pan.x;
          offsetY.value = pan.y;
        }
        // 确保摄像头图标位置实时更新
        nextTick(() => {
          console.log('缩放更新:', { scale: newZoom, pan });
        });
      },
      // 监听平移事件
      onPan: function (newPan: { x: number; y: number }) {
        offsetX.value = newPan.x;
        offsetY.value = newPan.y;
        // 确保摄像头图标位置实时更新
        nextTick(() => {
          console.log('平移更新:', newPan);
        });
      },
    });

    // 设置初始缩放和偏移
    setTimeout(() => {
      if (svgTiger.value) {
        // 设置初始缩放倍数为1.5倍
        svgTiger.value.zoom(1.5);
        // 设置初始偏移
        svgTiger.value.pan({x: 50, y: 120});
        // 更新状态变量
        scale.value = 1.5;
        offsetX.value = 50;
        offsetY.value = 120;
      }
    }, 100);
  } catch (error) {
    console.error('初始化svg-pan-zoom失败:', error);
  }
};

const throttledDrawImage = throttle((ctx) => {
  if (!ctx) return;
  drawCanvas(ctx);
}, 16, {leading: true, trailing: true});

// 绘制图片的函数
const drawCanvas = (ctx: CanvasRenderingContext2D) => {
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true; // 启用图像平滑
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(offsetX.value, offsetY.value);
  ctx.scale(scale.value, scale.value);
  ctx.restore();
};

// ————————————————————————————————————————————————————————————————————————————— 初始化
// 新增状态：标记 SVG 是否加载完成
const isSVGLoaded = ref(false);

const handleSVGLoad = async () => {
  // 确保SVG元素已完全加载
  await nextTick();

  const svgElement = document.getElementById('svg-trigger');
  if (!svgElement) {
    console.error('1SVG元素未正确加载');
    return;
  }

  // 初始化canvas和panzoom
  initPanZoom();
  isSVGLoaded.value = true;
};

// ————————————————————————————————————————————————————————————————————————————— 生命周期
onActivated(() => {
  // 保持之前的视图状态，不要重置
  // offsetX.value = 0;
  // offsetY.value = 0;
  // scale.value = 1;
  // 获取摄像头数据
  fetchCameraData();
});
</script>


<template>
  <div class="content-container">
    <div class="title-box"><span>煤矿GIS一张图</span></div>

    <!-- 左侧边栏 -->
    <div class="left-sidebar" :class="{ 'collapsed': leftSidebarCollapsed }">
      <div class="sidebar-header">
        <span v-if="!leftSidebarCollapsed">图层控制</span>
        <button class="collapse-btn" @click="toggleLeftSidebar">
          <span class="icon">{{ leftSidebarCollapsed ? '▶' : '◀' }}</span>
        </button>
      </div>

      <div class="sidebar-content" v-if="!leftSidebarCollapsed">
        <!-- 图层控制面板 -->
        <div class="panel layer-control">
          <h4>图层管理</h4>
          <div class="layer-item">
            <label>
              <input type="checkbox" v-model="isCameraVisible" @change="saveLayerState">
              <span>监控摄像头</span>
            </label>
          </div>

          <!-- 拖拽添加摄像头 -->
          <div class="layer-item">
            <div class="layer-row">
              <span style="color:#fff; font-size:13px;">拖拽添加摄像头</span>
              <div
                class="drag-camera-icon"
                draggable="true"
                title="拖到地图上以添加摄像头"
                @dragstart="handleDragStartCamera"
              >📹</div>
            </div>
            <div class="drag-hint">拖动右侧图标到地图，松开后弹出配置窗口</div>
          </div>

          <!-- 删除/编辑选择模式 -->
          <div class="layer-item">
            <!-- 删除分组：包含 删除 与 取消删除 两个按钮 -->
            <div style="display:flex; gap:8px;width:100%;">
              <el-button type="warning" size="small" width="50%" @click="startDeleteMode" :disabled="isDeleteMode">
                删除
              </el-button>
              <el-button type="danger" size="small" width="50%" @click="cancelDeleteMode" :disabled="!isDeleteMode">
                取消
              </el-button>
            </div>
            <!-- 模式提示：根据当前模式动态提示下一步操作 -->
            <div style="margin-top:6px; color:#C0C4CC; font-size:12px;">
              {{ isDeleteMode ? '提示：点击地图上的摄像头进行删除' : isEditMode ? '提示：点击地图上的摄像头进行编辑' : '点击“删除”进入选择模式' }}
            </div>
          </div>


            <!-- 编辑分组：包含 编辑 与 取消编辑 两个按钮 -->
          <div class="layer-item">
            <div style="display:flex; gap:8px;width:100%;">
              <el-button type="success" width="50%" size="small" @click="startEditMode" :disabled="isEditMode">
                编辑
              </el-button>
              <el-button type="danger" width="50%" size="small" @click="cancelEditMode" :disabled="!isEditMode">
                取消
              </el-button>
            </div>
            <!-- 模式提示：根据当前模式动态提示下一步操作 -->
            <div style="margin-top:6px; color:#C0C4CC; font-size:12px;">
              {{ isDeleteMode ? '提示：点击地图上的摄像头进行删除' : isEditMode ? '提示：点击地图上的摄像头进行编辑' : '点击“编辑”进入选择模式' }}
            </div>
          </div>

          <!-- 查看分组：样式模仿编辑分组，包含 查看 与 取消 两个按钮 -->
          <div class="layer-item">
            <div style="display:flex; gap:8px;width:100%;">
              <el-button type="primary" width="50%" size="small" @click="startViewMode" :disabled="isViewMode">
                查看
              </el-button>
              <el-button type="danger" width="50%" size="small" @click="cancelViewMode" :disabled="!isViewMode">
                取消
              </el-button>
            </div>
            <!-- 模式提示：根据当前模式动态提示下一步操作 -->
            <div style="margin-top:6px; color:#C0C4CC; font-size:12px;">
              {{ isViewMode ? '点击摄像头查看属性信息' : '点击“查看”进入查看模式' }}
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 主地图区域 -->
    <div class="main-box"
         ref="mainBoxRef"
         @dragover="handleDragOver"
         @drop="handleDropCamera"
         :style="{left: leftSidebarCollapsed ? '60px' : '320px', right: '0px'}">
      <!-- SVG底图容器 -->
      <div class="svg-container">
        <embed id="svg-trigger" type="image/svg+xml" style="width: 100%; height: 100%;"
               :src="surfaceImage" @load="handleSVGLoad"/>
      </div>

      <!-- 选点捕获层（仅在添加模式时启用点击） -->
      <div class="click-capture-layer" :class="{ active: isAddMode }" @click="handleMapClick"></div>

      <!-- 临时标记（显示用户选择的点位） -->
      <div v-if="tempPosition" class="temp-marker"
           :style="{
             left: (tempPosition.vx * scale + offsetX - 8) + 'px',
             top: (tempPosition.vy * scale + offsetY - 8) + 'px'
           }"></div>

      <!-- 摄像头图标层 - 独立的覆盖层 -->
      <div class="camera-overlay">
        <template v-for="item in CameraList" :key="item.id">
          <CameraItem
            v-if="isCameraVisible && item.show"
            class="icon-box"
            :item="item"
            :scale="scale"
            :offsetX="offsetX"
            :offsetY="offsetY"
            :select-mode="isDeleteMode ? 'delete' : (isEditMode ? 'edit' : (isViewMode ? 'view' : 'none'))"
            @select="onCameraSelected"
            @alarm="handleAlarm"/>
        </template>
      </div>
    </div>

    <!-- 报警弹窗组件 -->
    <Teleport to="body">
      <div v-if="alarmVisible" class="alarm-popup">
        <div class="alarm-header">
          <span class="alarm-title">⚠️ 人员入侵告警</span>
          <button class="close-btn" @click="closeAlarm">×</button>
        </div>
        <div class="alarm-content">
          <div class="alarm-info-row">
            <span class="label">位置:</span>
            <span class="value">{{ alarmData.cameraName }}</span>
          </div>
          <div class="alarm-info-row">
            <span class="label">时间:</span>
            <span class="value">{{ alarmData.time }}</span>
          </div>
          <div class="alarm-info-row">
            <span class="label">类型:</span>
            <span class="value warning-text">检测到人员 ({{ alarmData.conf }}%)</span>
          </div>
          <div class="alarm-actions">
            <el-button type="danger" size="small" @click="handleAlarmConfirm">立即处理</el-button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 加载遮罩 -->
    <div v-if="!isSVGLoaded" class="loading-overlay">
      <div class="loading-indicator">
        <span>地图加载中...</span>
      </div>
    </div>

    <!-- 添加摄像头表单弹窗 -->
    <el-dialog v-model="addDialogVisible" title="添加摄像头" width="480px" :close-on-click-modal="false">
      <div style="display:flex; flex-direction:column; gap:12px;">
        <el-form-item label="摄像头名称" prop="name">
          <el-input v-model="newCameraForm.name" placeholder="摄像头名称" />
        </el-form-item>
        <el-form-item label="IP地址:" prop="ip">
          <el-input v-model="newCameraForm.ip" placeholder="IP地址" />
        </el-form-item>
        <el-form-item label="用户名:" prop="username">
          <el-input v-model="newCameraForm.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item label="密码:" prop="password">
          <el-input v-model="newCameraForm.password" placeholder="密码" type="password" />
        </el-form-item>
        <el-form-item label="RTSP地址:" prop="rtsp">
          <el-input v-model="newCameraForm.rtsp" placeholder="RTSP地址" />
        </el-form-item>
        <el-form-item label="X坐标:" prop="x">
          <el-input v-model.number="newCameraForm.x" placeholder="X坐标" />
        </el-form-item>
        <el-form-item label="Y坐标:" prop="y">
          <el-input v-model.number="newCameraForm.y" placeholder="Y坐标" />
        </el-form-item>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px;">
          <el-button @click="cancelAddCamera">取消</el-button>
          <el-button type="primary" @click="submitAddCamera">保存</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 查看摄像头属性弹窗 -->
    <el-dialog v-model="viewDialogVisible" title="查看摄像头属性" width="520px" :close-on-click-modal="false">
      <el-descriptions v-if="viewCameraData" :column="1" border size="small">
        <el-descriptions-item label="摄像头名称">{{ viewCameraData.name }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ viewCameraData.ip }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ viewCameraData.username }}</el-descriptions-item>
        <el-descriptions-item label="密码">{{ viewCameraData.password }}</el-descriptions-item>
        <el-descriptions-item label="RTSP地址">{{ viewCameraData.rtsp }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <span :class="{ 'status-online': viewCameraData.status === 1, 'status-offline': viewCameraData.status !== 1 }">
            {{ viewCameraData.status === 1 ? '在线' : '离线' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="坐标X">{{ viewCameraData.vx }}</el-descriptions-item>
        <el-descriptions-item label="坐标Y">{{ viewCameraData.vy }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewCameraData.create_time }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ viewCameraData.update_time }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <el-button type="primary" @click="viewDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑摄像头表单弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑摄像头" width="520px" :close-on-click-modal="false">
      <div style="display:flex; flex-direction:column; gap:12px;">
        <el-form-item label="摄像头名称" prop="name">
          <el-input v-model="editCameraForm.name" placeholder="摄像头名称" />
        </el-form-item>
        <el-form-item label="IP地址:" prop="ip">
          <el-input v-model="editCameraForm.ip" placeholder="IP地址" />
        </el-form-item>
        <el-form-item label="用户名:" prop="username">
          <el-input v-model="editCameraForm.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item label="密码:" prop="password">
          <el-input v-model="editCameraForm.password" placeholder="密码" type="password" />
        </el-form-item>
        <el-form-item label="RTSP地址:" prop="rtsp">
          <el-input v-model="editCameraForm.rtsp" placeholder="RTSP地址" />
        </el-form-item>
        <div style="display:flex; gap:12px;">
          <el-form-item label="X坐标:" prop="x">
            <el-input v-model.number="editCameraForm.x" placeholder="X坐标" />
          </el-form-item>
          <el-form-item label="Y坐标:" prop="y">
            <el-input v-model.number="editCameraForm.y" placeholder="Y坐标" />
          </el-form-item>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px;">
          <el-button @click="cancelEditMode">取消</el-button>
          <el-button type="primary" @click="submitEditCamera">保存</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
/* ============ 固定高度布局样式 ============ */
// 禁用所有滚动条，使用固定高度布局
* {
  // 隐藏滚动条
  &::-webkit-scrollbar {
    width: 0px;
    height: 0px;
  }

  // 禁用滚动
  overflow: hidden;
}

// 固定高度布局，无需滚动条

.content-container {
  width: 100%;
  height: 100%;
  background: #001440;
  position: relative;
  overflow: hidden;
}

.title-box {
  position: absolute;
  width: 100%;
  background-image: url('@/assets/img/up.png');
  height: clamp(80px, 8vh, 120px); /* 响应式高度 */
  background-position: center -10px;
  background-size: cover;
  background-repeat: no-repeat;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px; /* 最小高度保证 */

  span {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: clamp(20px, 3vw, 32px); /* 响应式字体大小 */
    font-weight: bold;
    color: #fff;
    letter-spacing: clamp(2px, 0.5vw, 8px); /* 响应式字间距 */
    text-shadow: 0 4px 16px #1e90ff, 0 1px 0 #000;
    text-align: center;
    white-space: nowrap; /* 防止换行 */
    padding: 0 20px; /* 左右内边距防止贴边 */
  }
}

.main-box {
  position: absolute;
  background-color: #001440;
  will-change: transform;
  top: clamp(80px, 8vh, 120px); /* 标题高度 */
  left: 320px; /* 左侧边栏宽度 */
  right: 0px; /* 右侧边栏宽度 */
  bottom: 0;
  transition: left 0.3s ease, right 0.3s ease;
  z-index: 1;
}

/* SVG容器样式 */
.svg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* SVG底图层级 */
  pointer-events: auto; /* 允许SVG交互（缩放、平移） */
}

/* 摄像头覆盖层样式 */
.camera-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999; /* 确保摄像头图标层在最上方 */
  pointer-events: none; /* 默认不拦截鼠标事件，让SVG可以正常缩放平移 */
}

/* 添加模式下的点击捕获层：覆盖地图区域，接收点击以选点 */
.click-capture-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 998; /* 位于摄像头覆盖层下方，避免遮挡摄像头交互 */
  pointer-events: none; /* 默认不拦截事件 */
}
.click-capture-layer.active {
  pointer-events: auto; /* 添加模式启用点击捕获 */
  cursor: crosshair; /* 显示十字准星提示可选点 */
}

/* 临时标记样式：小圆点显示选择位置 */
.temp-marker {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #409EFF;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
  z-index: 1000;
}

.icon-box {
  position: absolute;
  z-index: 1000; /* 摄像头图标的层级 */
  pointer-events: auto; /* 摄像头图标本身允许点击交互 */
  transition: all 0.3s ease; /* 平滑过渡效果 */
  cursor: pointer; /* 鼠标悬停时显示手型光标 */

  /* 确保图标可见性 */
  opacity: 1;
  visibility: visible;

  /* 防止图标被其他元素遮挡 */
  transform-style: preserve-3d;

  /* 添加悬停效果 */
  &:hover {
    transform: scale(1.1);
    filter: brightness(1.2);
  }

  /* 确保图标在所有情况下都能正确显示 */
  img {
    width: 32px;
    height: 32px;
    user-select: none; /* 禁止选择图片 */
    -webkit-user-drag: none; /* 禁止拖拽图片 */
  }
}

/* 左侧边栏样式 */
.left-sidebar {
  background: url('@/assets/img/239.png') left; /* 设置背景图片，图片靠左对齐 */
  background-size: cover; /* 背景图片覆盖整个面板 */
  width: min(320px, 22vw); /* 面板宽度，取320px和屏幕宽度22%中的较小值 */
  min-width: 250px; /* 面板最小宽度为250px */
  max-width: 350px; /* 面板最大宽度为350px */
  height: calc(100vh - 190px); /* 面板高度，等于整个屏幕高度减去190px */
  display: flex; /* 使用弹性布局 */
  flex-direction: column; /* 弹性布局方向为垂直方向 */
  gap: 1px; /* 面板内元素之间的间距为1px */
  margin: 0; /* 外边距为0 */
  padding: 15px 15px 15px 25px; /* 内边距：上下左右分别为15px、15px、15px、25px */
  position: absolute; /* 绝对定位 */
  top: 60px; /* 距离顶部60px */
  left: 15px; /* 距离左侧15px */
  z-index: 10; /* 层级为10，确保面板显示在其他元素上方 */
  overflow-y: auto; /* 当内容超出面板高度时，允许垂直滚动 */
  scrollbar-width: none; /* Firefox浏览器隐藏滚动条 */
  -ms-overflow-style: none; /* IE和Edge浏览器隐藏滚动条 */
  z-index: 999;
  overflow: hidden;

  &.collapsed {
    width: 50px;
    background-image: none;
  }
}

.right-sidebar {
  background: url('@/assets/img/240.png') right; /* 修正背景图片方向 */
  background-size: cover;
	width: min(320px, 22vw); /* 减小宽度避免超出屏幕 */
	min-width: 250px; /* 减小最小宽度 */
	max-width: 350px; /* 减小最大宽度 */
	height: calc(100vh - 190px); /* 使用视口高度 */
	display: flex;
	flex-direction: column;
	gap: 15px;
	margin: 0;
	padding: 15px 25px 15px 15px;
	position: absolute; /* 绝对定位浮层 */
	top: 60px; /* 在标题下方 */
	right: 15px; /* 减小右边距 */
	z-index: 999; /* 确保在3D模型上方 */
	overflow-y: auto; /* 允许滚动 */
	scrollbar-width: none; /* Firefox */
	-ms-overflow-style: none; /* IE and Edge */

  &.collapsed {
    width: 50px;
    background-image: none;
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  backdrop-filter: blur(10px);
  // background: rgba(0, 40, 100, 0.8);
  // border-bottom: 1px solid rgba(64, 158, 255, 0.2);
  color: #fff;
  font-weight: bold;
  min-height: 50px;
  margin-top: 15px;

  .collapse-btn {
    background: rgba(64, 158, 255, 0.2);
    border: 1px solid rgba(64, 158, 255, 0.4);
    color: #409EFF;
    width: 30px;
    height: 30px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(64, 158, 255, 0.3);
      border-color: #409EFF;
    }

    .icon {
      font-size: 12px;
    }
  }
}

.sidebar-content {
  height: calc(100% - 50px);
  overflow: hidden; /* 禁用滚动条 */
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px; /* 减少面板间距 */
}

.panel {
  backdrop-filter: blur(10px);
  height: auto;
  flex: 0 1 auto; /* 根据内容大小分配高度，而不是平均分配 */
  display: flex;
  flex-direction: column;
  min-height: 0; /* 允许flex子元素缩小 */
  overflow: visible; /* 允许内容正常显示 */

  h4 {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 15px;
      position: relative;
      background: url('@/assets/img/225.png') no-repeat center;
      background-size: cover;
      text-align: center;
      color:#f0f2f5;
  }
}

/* 左侧边栏面板高度分配 */
.left-sidebar .panel {
  &.layer-control {
    flex: 1 1 auto; /* 图层控制占用剩余空间 */
    min-height: 200px; /* 设置最小高度 */
  }

  &.device-status {
    flex: 0 0 auto; /* 设备状态固定高度 */
  }

  &.working-face {
    flex: 0 0 auto; /* 工作面信息固定高度 */
    min-height: 100px;
  }
}

/* 右侧边栏面板高度分配 */
.right-sidebar .panel {
  &.personnel-panel {
    flex: 0 0 auto; /* 人员定位固定高度 */
    order: 1; /* 显示顺序：第一个 */
  }

  &.alert-panel {
    flex: 1 1 45%; /* 告警面板占45%空间，增加空间 */
    min-height: 200px; /* 增加最小高度 */
    max-height: 300px; /* 设置最大高度 */
    order: 2; /* 显示顺序：第二个 */
  }

  &.environment-panel {
    flex: 0 0 auto; /* 环境监测固定高度 */
    order: 3; /* 显示顺序：第三个 */
  }

  &.video-panel {
    flex: 1 1 35%; /* 视频监控占35%空间，减少空间给告警面板 */
    min-height: 150px; /* 减少最小高度 */
    order: 4; /* 显示顺序：第四个 */
  }
}

/* 图层控制面板 */
.layer-control {
  display: flex;
  flex-direction: column;
  height: 100%; /* 占满父容器高度 */
  padding: 8px 0; /* 添加上下内边距 */

  .layer-item {
    padding: 12px 16px; /* 减少内边距，保留空间 */
    gap: 15px;
    background: rgba(0, 188, 212, 0.05);
    border: 1px solid rgba(0, 188, 212, 0.2);
    border-radius: 6px;
    //flex: 1; /* 每个图层项平均分配剩余空间 */
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
    margin: 0 8px; /* 添加左右边距 */

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: rgba(64, 158, 255, 0.05);
    }

    .layer-row {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 8px;
      justify-content: space-between;
    }

    label {
      display: flex;
      align-items: center;
      flex: 1;
      cursor: pointer;
      color: #fff;
      font-size: 13px;
      transition: all 0.2s ease;

      input[type="checkbox"] {
        margin-right: 12px;
        accent-color: #409EFF;
        transform: scale(1.1);
        cursor: pointer;
      }

      span {
        color: #fff;
        font-size: 13px;
        font-weight: 500;
      }

      &:hover {
        color: #409EFF;
      }
    }

    .drag-camera-icon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      border: 1px solid #e8e8e8;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      cursor: grab;
      user-select: none;
    }
    .drag-camera-icon:active { cursor: grabbing; }

    .drag-hint {
      margin-top: 6px;
      color: #c0c4cc;
      font-size: 12px;
    }
  }
}

/* 设备状态面板 */
.device-status {
  .status-item {
    display: flex;
    align-items: center;
    padding: 6px 12px; /* 减少内边距 */
    color: #fff;
    font-size: 13px; /* 统一字体大小 */

    position: relative;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(135deg, transparent, rgba(0, 188, 212, 0.5), transparent);
    }

    .status-dot {
      width: 6px; /* 缩小状态点 */
      height: 6px;
      border-radius: 50%;
      margin-right: 8px; /* 减少间距 */

      &.online {
        background: #67C23A;
        box-shadow: 0 0 4px rgba(103, 194, 58, 0.6);
      }

      &.offline {
        background: #909399;
      }

      &.warning {
        background: #E6A23C;
        box-shadow: 0 0 4px rgba(230, 162, 60, 0.6);
      }
    }
  }
}

/* 工作面信息面板 */
.working-face {
  .face-item {
    display: flex;
    align-items: center;
    gap: 15px;
    background: rgba(0, 188, 212, 0.05);
    border: 1px solid rgba(0, 188, 212, 0.2);
    border-radius: 6px;
    padding: 10px;

    &:last-child {
      border-bottom: none;
    }

    .face-name {
      color: #fff;
      font-size: 13px; /* 统一字体大小 */
    }

    .face-status {
      font-size: 11px; /* 统一字体大小 */
      padding: 1px 6px; /* 减少内边距 */
      border-radius: 8px; /* 减小圆角 */

      &.working {
        background: rgba(103, 194, 58, 0.2);
        color: #67C23A;
        border: 1px solid rgba(103, 194, 58, 0.3);
      }

      &.maintenance {
        background: rgba(230, 162, 60, 0.2);
        color: #E6A23C;
        border: 1px solid rgba(230, 162, 60, 0.3);
      }

      &.stopped {
        background: rgba(245, 108, 108, 0.2);
        color: #F56C6C;
        border: 1px solid rgba(245, 108, 108, 0.3);
      }
    }
  }
}

/* 告警面板 */
.alert-panel {
  .alert-list {
    height: 100%; /* 占满容器高度 */
    overflow-y: auto; /* 启用垂直滚动条 */
    overflow-x: hidden; /* 禁用水平滚动条 */
    padding-right: 2px; /* 为滚动条留出空间 */

    /* 告警专用滚动条样式 */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(245, 108, 108, 0.1);
      border-radius: 6px;
      margin: 2px 0;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg,
        rgba(245, 108, 108, 0.4) 0%,
        rgba(245, 108, 108, 0.7) 50%,
        rgba(245, 108, 108, 0.4) 100%);
      border-radius: 6px;
      border: 1px solid rgba(245, 108, 108, 0.2);
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(180deg,
          rgba(245, 108, 108, 0.6) 0%,
          rgba(245, 108, 108, 0.9) 50%,
          rgba(245, 108, 108, 0.6) 100%);
        border-color: rgba(245, 108, 108, 0.4);
        box-shadow: 0 0 8px rgba(245, 108, 108, 0.3);
      }

      &:active {
        background: linear-gradient(180deg,
          rgba(245, 108, 108, 0.8) 0%,
          rgba(245, 108, 108, 1) 50%,
          rgba(245, 108, 108, 0.8) 100%);
        box-shadow: 0 0 12px rgba(245, 108, 108, 0.5);
      }
    }

    &::-webkit-scrollbar-corner {
      background: rgba(245, 108, 108, 0.1);
    }

    /* Firefox 滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: rgba(245, 108, 108, 0.6) rgba(245, 108, 108, 0.1);
  }

  .alert-item {
    padding: 10px 12px; /* 恢复合适的内边距 */
    border-bottom: 1px solid rgba(64, 158, 255, 0.1);
    border-left: 3px solid transparent;
    flex-shrink: 0; /* 防止被压缩 */
    min-height: 60px; /* 设置最小高度确保内容显示完整 */

    &:last-child {
      border-bottom: none;
    }

    &.critical {
      border-left-color: #F56C6C;
      background: rgba(245, 108, 108, 0.08);

      &:hover {
        background: rgba(245, 108, 108, 0.12);
      }
    }

    &.warning {
      border-left-color: #E6A23C;
      background: rgba(230, 162, 60, 0.08);

      &:hover {
        background: rgba(230, 162, 60, 0.12);
      }
    }

    &.info {
      border-left-color: #409EFF;
      background: rgba(64, 158, 255, 0.08);

      &:hover {
        background: rgba(64, 158, 255, 0.12);
      }
    }

    .alert-time {
      font-size: 12px; /* 统一字体大小 */
      color: #909399;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .alert-message {
      font-size: 13px; /* 统一字体大小 */
      color: #fff;
      margin-bottom: 4px;
      font-weight: bold;
      line-height: 1.3;
      word-break: break-word; /* 确保长文本换行 */
    }

    .alert-location {
      font-size: 12px; /* 统一字体大小 */
      color: #C0C4CC;
      display: flex;
      align-items: center;

      &::before {
        content: "📍";
        margin-right: 4px;
        font-size: 11px; /* 统一字体大小 */
      }
    }
  }
}

/* 环境监测面板 */
.environment-panel {
  .env-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px; /* 减少内边距 */
    border-bottom: 1px solid rgba(64, 158, 255, 0.1);

    &:last-child {
      border-bottom: none;
    }

    .env-label {
      color: #C0C4CC;
      font-size: 12px; /* 统一字体大小 */
    }

    .env-value {
      color: #67C23A;
      font-weight: bold;
      font-size: 12px; /* 统一字体大小 */

      &.danger {
        color: #F56C6C;
        animation: blink 1s infinite;
      }
    }
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0.5;
  }
}

/* 人员定位面板 */
.personnel-panel {
  .personnel-stats {
    display: flex;
    justify-content: space-around;
    padding: 8px; /* 减少内边距 */

    .stat-item {
      text-align: center;

      .stat-number {
        display: block;
        font-size: 18px; /* 统一字体大小 */
        font-weight: bold;
        color: #409EFF;
        margin-bottom: 2px; /* 减少间距 */
      }

      .stat-label {
        font-size: 12px; /* 统一字体大小 */
        color: #C0C4CC;
      }
    }
  }
}

/* 视频监控面板 */
.video-panel {
  .video-preview {
    height: 100%; /* 占满容器高度 */
    overflow: hidden; /* 禁用滚动条 */
    display: flex;
    flex-direction: column;

    .video-item {
      display: flex;
      align-items: center;
      padding: 6px 12px; /* 减少内边距 */
      border-bottom: 1px solid rgba(64, 158, 255, 0.1);
      flex: 1; /* 平均分配空间 */
      min-height: 0; /* 允许收缩 */

      &:last-child {
        border-bottom: none;
      }

      .video-thumbnail {
        width: 32px; /* 缩小缩略图 */
        height: 24px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px; /* 减少间距 */

        .camera-icon {
          font-size: 12px; /* 减小图标 */
        }
      }

      .video-info {
        flex: 1;

        .video-name {
          color: #fff;
          font-size: 11px; /* 减小字体 */
          margin-bottom: 1px; /* 减少间距 */
          line-height: 1.2; /* 减小行高 */
        }

        .video-status {
          font-size: 9px; /* 减小字体 */

          &.online {
            color: #67C23A;
          }

          &.offline {
            color: #909399;
          }
        }
      }
    }
  }
}

/* 遮罩层样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3); /* 半透明黑色背景 */
  z-index: 999; /* 确保在最上层 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 添加加载指示器样式 */
.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid #409EFF;
  background: linear-gradient(60deg, #0056b3, #06306c);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 10;
}

.tool-box {
  position: absolute;
  top: 0;
  right: 0;
  //width: 20%;
  //height: 20%;
}

.nav-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 20%;
  height: 520px;
}

.path-box {
  position: absolute;
  top: 50vh;
  left: 0;
}

.mode-container {
  position: absolute;
  top: 0;
  margin: 15px 0;
  width: 100%;
  display: flex;
  height: 100%;
  justify-content: center;
  pointer-events: none;
  opacity: 0.8;
}

#svg-trigger {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* z-index由父容器.svg-container控制 */
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2; /* canvas 较高层级 */
  pointer-events: none; /* 确保 canvas 不影响鼠标事件 */
}

.review-box {
  display: flex;
  flex-direction: column;
  height: 100%;


  .header-section {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 12px;
    background-color: rgba(245, 247, 250, 0.9);
    border-radius: 4px;
    margin-bottom: 12px;
    height: 60px;

    .vehicle-info,
    .speed-control {
      display: flex;
      align-items: center;
      justify-content: left;
    }

    .btn-box {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .label {
      color: #606266;
      margin-right: 8px;
    }

    .value {
      font-weight: bold;
      color: #303133;
    }
  }

  .table-section {
    flex: 1;
  }
}

/* 响应式断点 */
@media (max-width: 1680px) {
  .nav-box {
    height: 50%;
  }

  .path-box {
    height: 45%;
    bottom: 2%;
  }
}

/* 中等屏幕 (平板) */
@media (max-width: 1024px) {
  .title-box {
    height: clamp(60px, 6vh, 90px);

    span {
      font-size: clamp(18px, 2.5vw, 28px);
      letter-spacing: clamp(1px, 0.3vw, 6px);
      padding: 0 15px;
    }
  }

  .main-box {
    top: clamp(60px, 6vh, 90px);
    left: 280px;
    right: 280px;
  }

  .left-sidebar,
  .right-sidebar {
    top: clamp(60px, 6vh, 90px);
    width: 280px;

    &.collapsed {
      width: 50px;
    }
  }

  .panel h4 {
    font-size: 14px; /* 统一标题字体大小 */
    padding: 10px 12px;
  }

  .sidebar-content {
    padding: 8px;
  }
}

/* 小屏幕 (手机横屏) */
@media (max-width: 768px) {
  .title-box {
    height: clamp(50px, 5vh, 80px);

    span {
      font-size: clamp(16px, 2vw, 24px);
      letter-spacing: clamp(1px, 0.2vw, 4px);
      padding: 0 10px;
    }
  }

  .main-box {
    top: clamp(50px, 5vh, 80px);
    left: 60px; /* 侧边栏默认收缩 */
    right: 60px;
  }

  .left-sidebar,
  .right-sidebar {
    top: clamp(50px, 5vh, 80px);
    width: 60px; /* 默认收缩状态 */

    &:not(.collapsed) {
      width: 250px; /* 展开时的宽度 */
    }
  }

  /* 小屏幕下默认收缩侧边栏 */
  .left-sidebar.collapsed ~ .main-box,
  .right-sidebar.collapsed ~ .main-box {
    left: 60px;
    right: 60px;
  }

  .panel h4 {
    font-size: 13px; /* 统一标题字体大小 */
    padding: 8px 10px;
  }

  .sidebar-content {
    padding: 6px;
  }

  .panel {
    margin-bottom: 10px;
  }

  /* 小屏幕适配 - 告警面板滚动条适配 */
  .alert-panel .alert-list {
    &::-webkit-scrollbar {
      width: 4px; /* 更细的滚动条 */
    }

    &::-webkit-scrollbar-thumb {
      border: none; /* 移除边框节省空间 */
    }
  }

  .alert-item {
    min-height: 50px; /* 减少最小高度 */
    padding: 8px 10px; /* 减少内边距 */

    .alert-message {
      font-size: 11px; /* 调整字体大小 */
    }
  }
}

/* 超小屏幕 (手机竖屏) */
@media (max-width: 480px) {
  .title-box {
    height: clamp(45px, 4vh, 70px);
    min-height: 45px;

    span {
      font-size: clamp(14px, 1.8vw, 20px);
      letter-spacing: clamp(0.5px, 0.15vw, 3px);
      padding: 0 8px;
    }
  }

  .main-box {
    top: clamp(45px, 4vh, 70px);
    left: 50px;
    right: 50px;
  }

  .left-sidebar,
  .right-sidebar {
    top: clamp(45px, 4vh, 70px);
    width: 50px;

    &:not(.collapsed) {
      width: 220px;
    }
  }

  .sidebar-header {
    padding: 10px;
    min-height: 40px;

    .collapse-btn {
      width: 25px;
      height: 25px;
    }
  }

  .panel h4 {
    font-size: 12px; /* 统一标题字体大小 */
    padding: 6px 8px;
  }

  .sidebar-content {
    padding: 4px;
  }

  .personnel-stats {
    flex-direction: column;
    gap: 10px;

    .stat-item {
      .stat-number {
        font-size: 16px;
      }

      .stat-label {
        font-size: 10px;
      }
    }
  }

  /* 超小屏幕适配 - 告警面板滚动条适配 */
  .alert-panel .alert-list {
    &::-webkit-scrollbar {
      width: 3px; /* 更细的滚动条 */
    }

    &::-webkit-scrollbar-thumb {
      border: none; /* 移除边框节省空间 */
    }
  }

  .alert-item {
    min-height: 45px; /* 进一步减少最小高度 */
    padding: 6px 8px; /* 进一步减少内边距 */

    .alert-time {
      font-size: 9px;
    }

    .alert-message {
      font-size: 10px;
    }

    .alert-location {
      font-size: 9px;
    }
  }
}

/* 超宽屏优化 */
@media (min-width: 1920px) {
  .title-box {
    height: clamp(100px, 10vh, 140px);

    span {
      font-size: clamp(28px, 3.5vw, 40px);
      letter-spacing: clamp(6px, 0.8vw, 12px);
    }
  }

  .main-box {
    top: clamp(100px, 10vh, 140px);
    left: 360px;
    right: 360px;
  }

  .left-sidebar,
  .right-sidebar {
    top: clamp(100px, 10vh, 140px);
    width: 360px;

    &.collapsed {
      width: 70px;
    }
  }

  .panel h4 {
    font-size: 16px; /* 统一标题字体大小 */
    padding: 15px 18px;
  }

  .sidebar-content {
    padding: 12px;
  }

  .personnel-stats .stat-item .stat-number {
    font-size: 24px;
  }

  /* 超宽屏优化 - 滚动条样式已移除 */
}

/* 报警弹窗样式 */
.alarm-popup {
  position: fixed;
  top: 140px;
  right: 20px;
  width: 300px;
  background: rgba(0, 20, 60, 0.95);
  border: 1px solid #F56C6C;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 9999;
  overflow: hidden;
  animation: slideInRight 0.3s ease-out;
}

.alarm-header {
  background: linear-gradient(90deg, rgba(245, 108, 108, 0.2), transparent);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(245, 108, 108, 0.3);

  .alarm-title {
    color: #F56C6C;
    font-weight: bold;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .close-btn {
    background: none;
    border: none;
    color: #909399;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    line-height: 1;

    &:hover {
      color: #fff;
    }
  }
}

.alarm-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alarm-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;

  .label {
    color: #909399;
  }

  .value {
    color: #fff;
    font-weight: 500;

    &.warning-text {
      color: #F56C6C;
      font-weight: bold;
    }
  }
}

.alarm-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
