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

// 坐标变换改为计算属性
const positionStyle = computed(() => {
  if (!imagesLoaded.value || !cameraImage.complete) return {left: '0', top: '0'};

  const baseX = props.item.vx * props.scale + props.offsetX;
  const baseY = props.item.vy * props.scale + props.offsetY;

  // 以图片正中心为锚点，添加安全检查
  const imageWidth = cameraImage.width || 32; // 默认宽度
  const imageHeight = cameraImage.height || 32; // 默认高度
  
  return {
    left: `${baseX - imageWidth / 2}px`,
    top: `${baseY - imageHeight / 2}px`
  };
});

// 坐标变换
const calculatedX = ref(props.item.vx * props.scale + props.offsetX);
const calculatedY = ref(props.item.vy * props.scale + props.offsetY);

// 监听变化
watch([() => props.offsetX, () => props.offsetY, () => props.scale], () => {
  calculatedX.value = props.item.vx * props.scale + props.offsetX;
  calculatedY.value = props.item.vy * props.scale + props.offsetY;
});

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
};

// ————————————————————————————————————————————————————————————  右键事件
// 控制右键菜单的显示与隐藏
const contextMenuVisible = ref(false);
// 当前右键点击的项
const contextMenuItem = ref<Camera | null>(null);

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
  left: `${calculatedX.value + 20}px`,
  top: `${calculatedY.value - 20}px`
}))

</script>

<template>

  <div class="item-container" @contextmenu.prevent="showContextMenu($event, item)"
         :style="positionStyle" @mouseleave="handleMouseLeave" @click="handleClick">
      <img :src="cameraImageSrc" alt="未找到图标" draggable="false">
  </div>


  <!-- 视频预览弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    width="840px"
    :title="`${props.item.name} - 实时视频`"
    :before-close="closeVideoDialog"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="video-container">
      <WebRTCVideo
        v-if="dialogVisible && props.item.rtsp"
        :camera-id="props.item.id"
        :rtsp-url="props.item.rtsp"
        :width="800"
        :height="400"
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
}


.video-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 10px;

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

