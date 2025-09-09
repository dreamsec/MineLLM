<script setup lang="ts">
import {ref, onActivated, nextTick, onMounted, onBeforeUnmount} from 'vue'
// 图标资源
import surfaceImage from '@/assets/map/map.svg'; // 使用项目中现有的图片作为底图
import {throttle} from "lodash";
import svgPanZoom from 'svg-pan-zoom';
import CameraItem from './component/CameraItem/index.vue';

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
  x: number;
  y: number;
  create_time: string;
  update_time: string;
  show?: boolean;
}

// 缓存键名常量
const LAYER_VISIBILITY_STATE = 'layer_visibility_state';
const TOKEN = 'token';

// ————————————————————————————————————————————————————————————————————————————— 图标
// 定义 canvas 元素的引用
const canvasRef = ref<HTMLCanvasElement | null>(null);

// 响应式调整底图宽高
const restrictedWidth = ref<number>(window.innerWidth);
const restrictedHeight = ref<number>(window.innerHeight);

// 监听窗口大小变化
const handleResize = () => {
  restrictedWidth.value = window.innerWidth;
  restrictedHeight.value = window.innerHeight;
  initCanvas(); // 重新初始化canvas
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

// 图标列表
const CameraList = ref<Camera[]>([
  {
    id: 1,
    name: '摄像头1',
    ip: '192.168.1.100',
    username: 'admin',
    password: '123456',
    rtsp: 'rtsp://192.168.1.100:554/test',
    status: 1,
    vx: 500,
    vy: 222,
    x: 0,
    y: 0,
    create_time: '2021-01-01',
    update_time: '2021-01-01',
  },
  {
    id: 1,
    name: '摄像头1',
    ip: '192.168.1.100',
    username: 'admin',
    password: '123456',
    rtsp: 'rtsp://192.168.1.100:554/test',
    status: 1,
    vx: 200,
    vy: 330,
    x: 0,
    y: 0,
    create_time: '2021-01-01',
    update_time: '2021-01-01',
  },
  {
    id: 1,
    name: '摄像头1',
    ip: '192.168.1.100',
    username: 'admin',
    password: '123456',
    rtsp: 'rtsp://192.168.1.100:554/test',
    status: 1,
    vx: 1100,
    vy: 252,
    x: 0,
    y: 0,
    create_time: '2021-01-01',
    update_time: '2021-01-01',
  },
  {
    id: 1,
    name: '摄像头1',
    ip: '192.168.1.100',
    username: 'admin',
    password: '123456',
    rtsp: 'rtsp://192.168.1.100:554/test',
    status: 1,
    vx: 930,
    vy: 92,
    x: 0,
    y: 0,
    create_time: '2021-01-01',
    update_time: '2021-01-01',
  }
]);

// 定义缩放比例
const scale = ref(1);
// 定义偏移量
const offsetX = ref(0);
const offsetY = ref(0);

// 图层状态接口定义
interface LayerVisibilityState {
  isCameraVisible: boolean;
}

// 默认图层状态
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
  } catch (error) {
    console.warn('保存图层状态失败:', error);
  }
};

// 初始化图层状态（从本地存储加载）
const initialState = loadLayerState();

// 控制图层显隐
const isCameraVisible = ref(initialState.isCameraVisible);

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
        requestAnimationFrame(() => throttledDrawImage(canvasRef.value?.getContext('2d')));
      },
      // 监听平移事件
      onPan: function (newPan: { x: number; y: number }) {
        offsetX.value = newPan.x;
        offsetY.value = newPan.y;
        requestAnimationFrame(() => throttledDrawImage(canvasRef.value?.getContext('2d')));
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

const initCanvas = () => {
  if (canvasRef.value) {
    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 获取容器的实际尺寸
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        throttledDrawImage(ctx);
      }
    }
  }
}

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
  initCanvas();
  isSVGLoaded.value = true;
};

// ————————————————————————————————————————————————————————————————————————————— 生命周期
onActivated(() => {
  offsetX.value = 0;
  offsetY.value = 0;
  scale.value = 1;
  initCanvas();
});
</script>


<template>
  <div class="content-container">
    <div class="title-box"><span>GIS一张图</span></div>
    <div class="main-box">
      <embed id="svg-trigger" type="image/svg+xml" style="width: 100%; height: 100%;"
             :src="surfaceImage" @load="handleSVGLoad"/>
      <canvas ref="canvasRef"></canvas>
    </div>
    <div v-if="!isSVGLoaded" class="loading-overlay">
      <div class="loading-indicator">
        <span>地图加载中...</span>
      </div>
    </div>
    <CameraItem
      class="icon-box"
      v-for="item in CameraList"
      :item="item"
      :scale="scale"
      :offsetX="offsetX"
      :offsetY="offsetY"/>
  </div>
</template>

<style scoped lang="scss">
.content-container {
  width: 100%;
  height: 100%;
  background: #001440;
  position: relative;
  overflow: hidden;
}

.title-box {
  position: relative;
  background-image: url('@/assets/img/up.png');
  height: 100px;
  background-position: 0 -20px;
  background-size: cover;
  z-index: 10;

  span {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 30px;
    font-size: 32px;
    font-weight: bold;
    color: #fff;
    letter-spacing: 8px;
    text-shadow: 0 4px 16px #1e90ff, 0 1px 0 #000;
  }
}

.main-box {
  position: relative;
  background-color: #001440;
  will-change: transform;
  width: 100%;
  height: 100%;
}

.icon-box {
  position: absolute;
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
  z-index: 1; /* 底图较低层级 */
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

@media (max-width: 1680px) {
  .nav-box {
    height: 50%;
  }

  .path-box {
    height: 45%;
    bottom: 2%;
  }
}
</style>
