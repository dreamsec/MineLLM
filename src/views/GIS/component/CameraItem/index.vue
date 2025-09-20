<script setup lang="ts">
import cameraImageSrc from "@/assets/img/camera.png";
import type {PropType} from "vue";
import { VideoCamera, InfoFilled, Loading, Warning } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, computed, watch, nextTick, onUnmounted } from 'vue';
import WebRTCVideo from '@/components/WebRTCVideo/index.vue';

interface Camera {
  id: number;
  name: string;
  ip: string;
  rtsp: string;
  vx: number;
  vy: number;
  status: number;
}

const props = defineProps({
  item: {
    type: Object as PropType<Camera>,
    required: true,
  },
  scale: {
    type: Number,
    default: 1
  },
  offsetX: {
    type: Number,
    default: 0
  },
  offsetY: {
    type: Number,
    default: 0
  }
})

// 图标源
const imagesLoaded = ref(false);
const cameraImage = new Image();
cameraImage.onload = () => checkAllLoaded();
cameraImage.onerror = () => {
  console.warn('摄像头图标加载失败');
  imagesLoaded.value = true; // 即使失败也设置为true，避免无限等待
};
cameraImage.src = cameraImageSrc;

// 新增图片加载完成检测
const checkAllLoaded = () => {
  if (cameraImage.complete) {
    imagesLoaded.value = true;
  }
};

// 优化的坐标变换计算属性
const positionStyle = computed(() => {
  if (!imagesLoaded.value) {
    // 图片未加载完成时，使用默认尺寸计算
    const baseX = props.item.vx * props.scale + props.offsetX;
    const baseY = props.item.vy * props.scale + props.offsetY;
    return {
      left: `${baseX - 16}px`, // 默认图片宽度的一半
      top: `${baseY - 16}px`,  // 默认图片高度的一半
      visibility: 'hidden' as const     // 图片未加载时隐藏
    };
  }

  const baseX = props.item.vx * props.scale + props.offsetX;
  const baseY = props.item.vy * props.scale + props.offsetY;

  // 使用实际图片尺寸或默认尺寸
  const imageWidth = cameraImage.complete ? cameraImage.width : 32;
  const imageHeight = cameraImage.complete ? cameraImage.height : 32;

  return {
    left: `${baseX - imageWidth / 2}px`,
    top: `${baseY - imageHeight / 2}px`,
    visibility: 'visible' as const
  };
});

// 计算摄像头在地图上的实际坐标（用于其他功能，如信息窗口定位）
const calculatedPosition = computed(() => ({
  x: props.item.vx * props.scale + props.offsetX,
  y: props.item.vy * props.scale + props.offsetY
}));

// 点击摄像头图标直接打开视频弹窗
const handleClick = () => {
  if (props.item.rtsp) {
    openVideoDialog();
  } else {
    ElMessage.warning('该摄像头未配置RTSP地址');
  }
};

const handleMouseLeave = () => {
  contextMenuVisible.value = false;
  isHovered.value = false;
};

const handleMouseEnter = () => {
  isHovered.value = true;
};

// ————————————————————————————————————————————————————————————  右键事件
// 控制右键菜单的显示与隐藏
const contextMenuVisible = ref(false);
// 当前右键点击的项
const contextMenuItem = ref<Camera | null>(null);

// 控制摄像头名称标签的显示
const isHovered = ref(false);

// 显示右键菜单
const showContextMenu = (event: MouseEvent, item: Camera) => {
  contextMenuItem.value = item;
  contextMenuVisible.value = true;
};

// 视频详情弹窗
const dialogVisible = ref<boolean>(false);
const videoError = ref<boolean>(false);
const isVideoLoading = ref<boolean>(false);

// 打开视频预览弹窗
const openVideoDialog = () => {
  dialogVisible.value = true;
  videoError.value = false;
  if (props.item.rtsp) {
    isVideoLoading.value = true;
  }
};

// 关闭视频预览弹窗
const closeVideoDialog = () => {
  dialogVisible.value = false;
  videoError.value = false;
  isVideoLoading.value = false;
};

// 处理视频加载成功
const handleVideoLoad = () => {
  isVideoLoading.value = false;
  videoError.value = false;
  console.log('视频加载成功');
};

// 处理视频加载错误
const handleVideoError = (event: Event) => {
  console.error('视频加载失败:', event);
  isVideoLoading.value = false;
  videoError.value = true;
};

// 检查RTSP地址是否有效
const isValidRtspUrl = (url: string): boolean => {
  if (!url) return false;
  return url.toLowerCase().startsWith('rtsp://') ||
         url.toLowerCase().startsWith('http://') ||
         url.toLowerCase().startsWith('https://');
};

// 复制RTSP地址
const copyRtspUrl = async () => {
  try {
    if (props.item.rtsp) {
      await navigator.clipboard.writeText(props.item.rtsp);
      ElMessage.success('RTSP地址已复制到剪贴板');
    }
  } catch (error) {
    console.error('复制失败:', error);
    ElMessage.error('复制失败，请手动复制');
  }
};



// WebRTC视频组件引用
const webRtcVideoRef = ref<InstanceType<typeof WebRTCVideo> | null>(null)

// 信息窗口样式
const infoWindowStyle = computed(() => ({
  left: `${calculatedPosition.value.x + 20}px`,
  top: `${calculatedPosition.value.y - 20}px`
}))

// 工具提示样式
const tooltipStyle = computed(() => ({
  left: '50%',
  top: '100%',
  transform: 'translateX(-50%)',
  marginTop: '8px'
}))

// 对话框视频尺寸计算
const videoWidth = computed(() => {
  const dialogWidth = Math.min(window.innerWidth * 0.9, 1400);
  return dialogWidth - 80; // 减去对话框内边距
});

const videoHeight = computed(() => {
  const dialogHeight = Math.min(window.innerHeight * 0.85, 900);
  return dialogHeight - 180; // 减去标题、按钮和对话框内边距
});

</script>

<template>
  <div
    class="item-container"
    @contextmenu.prevent="showContextMenu($event, item)"
    :style="positionStyle"
    @mouseleave="handleMouseLeave"
    @mouseenter="handleMouseEnter"
    @click.stop="handleClick"
    @mousedown.stop
    @mouseup.stop>
    <img
      :src="cameraImageSrc"
      alt="摄像头"
      draggable="false"
      @click.stop="handleClick">

    <!-- 摄像头名称标签 -->
    <div
      class="camera-name-tooltip"
      :class="{ 'show': isHovered }"
      :style="tooltipStyle">
      {{ props.item.name }}
    </div>
  </div>


  <!-- 视频预览弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    width="50vw"
    :title="`${props.item.name} - 实时视频`"
    :before-close="closeVideoDialog"
    :close-on-click-modal="false"
    :modal="true"
    :append-to-body="true"
    :draggable="true"
    :resizable="true"
    destroy-on-close
    class="large-dialog"
  >
    <div class="video-container">
      <WebRTCVideo
        v-if="dialogVisible && props.item.rtsp"
        :camera-id="props.item.id"
        :rtsp-url="props.item.rtsp"
        :width="videoWidth"
        :height="videoHeight"
        :show-controls="true"
        :autoplay="true"
        ref="webRtcVideoRef"
      />

      <!-- 如果没有RTSP地址 -->
      <div v-else class="no-rtsp-message">
        <el-icon size="64"><Warning /></el-icon>
        <h3>未配置RTSP地址</h3>
        <p>该摄像头尚未配置RTSP流地址，无法播放视频</p>
        <el-button type="primary" @click="copyRtspUrl" :disabled="!props.item.rtsp">
          复制RTSP地址
        </el-button>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="camera-info">
          <span><strong>IP地址:</strong> {{ props.item.ip }}</span>
          <span><strong>状态:</strong>
            <span :class="{ 'status-online': props.item.status === 1, 'status-offline': props.item.status !== 1 }">
              {{ props.item.status === 1 ? '在线' : '离线' }}
            </span>
          </span>
        </div>
        <div class="dialog-actions">
          <el-button @click="copyRtspUrl" :disabled="!props.item.rtsp">
            复制RTSP地址
          </el-button>
          <el-button type="primary" @click="closeVideoDialog">
            关闭
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>

</template>



<style scoped lang="scss">
.item-container {
  position: absolute;
  cursor: pointer;
  user-select: none;

  /* 确保摄像头图标能正确接收点击事件 */
  pointer-events: auto;
  z-index: 1001; /* 确保在覆盖层中的最高层级 */

  /* 悬停效果 */
  &:hover {
    transform: scale(1.1);
    filter: drop-shadow(0 0 8px rgba(64, 158, 255, 0.6));
    transition: all 0.2s ease;
  }

  /* 点击效果 */
  &:active {
    transform: scale(1.05);
    filter: drop-shadow(0 0 12px rgba(64, 158, 255, 0.8));
  }

  img {
    width: 32px;
    height: 32px;
    display: block;
    user-select: none;
    -webkit-user-drag: none;
    pointer-events: none; /* 图片本身不拦截事件，由容器处理 */
  }
}

/* 摄像头名称工具提示样式 */
.camera-name-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 1002;
  pointer-events: none;
  opacity: 0;
  transform: translateX(-50%) translateY(-5px);
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);

  /* 小箭头指向摄像头图标 */
  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid rgba(0, 0, 0, 0.8);
  }

  &.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}


/* 大尺寸对话框样式 */
:deep(.large-dialog) {
  .el-dialog {
    width: 90vw !important;
    max-width: 1400px !important;
    height: 85vh !important;
    max-height: 900px !important;
    margin: 7.5vh auto !important;
    border-radius: 8px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  }

  .el-dialog__body {
    height: calc(85vh - 120px) !important; /* 减去标题和按钮高度 */
    padding: 20px !important;
    overflow: hidden;
    background: #000;
  }

  .el-dialog__header {
    padding: 20px 20px 10px 20px !important;
    background: #f5f7fa;
    border-bottom: 1px solid #ebeef5;
    border-radius: 8px 8px 0 0;
  }

  .el-dialog__footer {
    padding: 10px 20px 20px 20px !important;
    background: #f5f7fa;
    border-top: 1px solid #ebeef5;
    border-radius: 0 0 8px 8px;
  }

  .el-dialog__headerbtn {
    top: 15px !important;
    right: 15px !important;
  }
}

.video-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  .no-rtsp-message {
    text-align: center;
    color: #909399;
    padding: 40px;

    h3 {
      margin: 16px 0 8px 0;
      font-size: 18px;
      color: #606266;
    }

    p {
      margin: 0 0 24px 0;
      font-size: 14px;
      color: #909399;
    }
  }
}

// 视频弹窗样式
.video-dialog {
  .el-dialog__body {
    padding: 10px;
  }

  .el-dialog__footer {
    padding: 10px 20px;
    border-top: 1px solid #ebeef5;
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .camera-info {
    display: flex;
    gap: 24px;
    font-size: 14px;
    color: #606266;

    span {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-online {
      color: #67c23a;
      font-weight: 500;
    }

    .status-offline {
      color: #f56c6c;
      font-weight: 500;
    }
  }

  .dialog-actions {
    display: flex;
    gap: 12px;
  }
}

.context-menu {
  position: absolute;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;

  .menu-item {
    padding: 8px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #606266;

    &:hover {
      background: #f5f7fa;
    }

    .el-icon {
      font-size: 16px;
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>

