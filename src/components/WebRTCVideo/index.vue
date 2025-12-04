<template>
  <div class="webrtc-player" ref="containerRef">
    <video
      ref="videoElement"
      class="video-js"
      autoplay
      muted
      controls
      playsinline
      crossorigin="anonymous"
      :width="width"
      :height="height"
    ></video>

    <canvas
      ref="canvasRef"
      class="overlay-canvas"
    ></canvas>

    <div v-if="isLoading" class="loading-overlay">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>正在连接实时流...</span>
    </div>

    <div v-if="errorMsg" class="error-overlay">
      <el-icon><Warning /></el-icon>
      <span>{{ errorMsg }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { Loading, Warning } from '@element-plus/icons-vue';

const props = defineProps({
  rtspUrl: {
    type: String,
    required: true
  },
  cameraId: {
    type: Number,
    default: 0
  },
  modelName: {
    type: String,
    default: 'yolov8n'
  },
  width: {
    type: [Number, String],
    default: '100%'
  },
  height: {
    type: [Number, String],
    default: '100%'
  },
  autoplay: {
    type: Boolean,
    default: true
  }
});

const containerRef = ref<HTMLElement | null>(null);
const videoElement = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isLoading = ref(true);
const errorMsg = ref('');
let peerConnection: RTCPeerConnection | null = null;
let ws: WebSocket | null = null;
let resizeObserver: ResizeObserver | null = null;

// ———————————————————————————————————————————————————————————————— WebSocket AI 检测绘制
const initWebSocket = () => {
  if (!props.cameraId) return;
  if (props.modelName === 'none') {
    console.log('模型选择为none，不建立WS连接');
    return;
  }

  // 构造 WebSocket 地址
  // 假设 API 基础路径是 /api/v1，则 WS 地址为 ws://host/api/v1/camera/{id}/ws
  // 注意：如果项目使用了 vite proxy，这里可能需要特殊处理，或者直接用 location.host
  // const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // const host = window.location.host;
  // const wsUrl = `${protocol}//${host}/api/v1/camera/${props.cameraId}/ws`;
  const wsUrl = `ws://localhost:9000/api/v1/camera/${props.cameraId}/ws?model_name=${props.modelName}`;

  console.log('正在强制连接后端 AI WS:', wsUrl); // 加个日志方便确认

  console.log('Connecting to AI WS:', wsUrl);

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('AI WebSocket Connected');
  };

  ws.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      drawDetections(payload);
    } catch (e) {
      console.error('WS Parse Error:', e);
    }
  };

  ws.onclose = () => {
    console.log('AI WebSocket Closed');
  };

  ws.onerror = (err) => {
    console.warn('AI WebSocket Error:', err);
  };
};

const closeWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
  // 清空画布
  const canvas = canvasRef.value;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }
};

const emit = defineEmits(['person-detected']);

// 监听模型变化，重新连接 WebSocket
watch(() => props.modelName, (newVal) => {
  console.log('Model changed to:', newVal);
  closeWebSocket();
  if (newVal !== 'none') {
    initWebSocket();
  }
});

const drawDetections = (payload: any) => {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 确保画布尺寸与容器一致（视觉清晰度）
  if (canvas.width !== container.clientWidth || canvas.height !== container.clientHeight) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  // 清除上一帧
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const { width: origW, height: origH, data } = payload;
  if (!data || !Array.isArray(data)) return;

  // 计算缩放比例
  const scaleX = canvas.width / origW;
  const scaleY = canvas.height / origH;

  ctx.lineWidth = 2;
  ctx.font = '16px Arial';

  let hasPerson = false;
  let personInfo = null;

  data.forEach((item: any) => {
    const [x1, y1, x2, y2] = item.box;
    const label = item.label;
    const conf = Math.round(item.conf * 100);

    // 检测到人
    if (label === 'person') {
      hasPerson = true;
      personInfo = { label, conf, box: item.box };
    }

    // 转换坐标
    const drawX = x1 * scaleX;
    const drawY = y1 * scaleY;
    const drawW = (x2 - x1) * scaleX;
    const drawH = (y2 - y1) * scaleY;

    // 绘制框
    ctx.strokeStyle = '#00ff00'; // 绿色框
    ctx.strokeRect(drawX, drawY, drawW, drawH);

    // 绘制背景标签
    const text = `${label} ${conf}%`;
    const textMetrics = ctx.measureText(text);
    const textHeight = 20; // 近似高度

    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.fillRect(drawX, drawY - textHeight, textMetrics.width + 10, textHeight);

    // 绘制文字
    ctx.fillStyle = '#fff';
    ctx.fillText(text, drawX + 5, drawY - 5);
  });

  if (hasPerson) {
    emit('person-detected', personInfo);
  }
};

// ———————————————————————————————————————————————————————————————— 视频播放逻辑

// 动态加载 HLS.js
const loadHlsFromCdn = async (): Promise<any> => {
  const win: any = window as any
  if (win.Hls) return win.Hls
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('hls.js load error'))
    document.head.appendChild(s)
  })
  return (window as any).Hls
}

// 核心逻辑：开始播放
const startPlay = async () => {
  if (!props.rtspUrl) {
    errorMsg.value = "无效的播放地址";
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  errorMsg.value = '';

  const urlLower = props.rtspUrl.toLowerCase();

  // 1. 处理 HLS (.m3u8)
  if (urlLower.includes('.m3u8')) {
    try {
      const video = videoElement.value;
      if (!video) return;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = props.rtspUrl;
        await video.play().catch(() => {});
        isLoading.value = false;
        // 播放成功后启动 WS
        initWebSocket();
        return;
      }

      const Hls = await loadHlsFromCdn();
      if (Hls && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(props.rtspUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
          isLoading.value = false;
          // 播放成功后启动 WS
          initWebSocket();
        });
        hls.on(Hls.Events.ERROR, (_e: any, data: any) => {
          if (data.fatal) {
             errorMsg.value = "HLS加载失败";
             isLoading.value = false;
          }
        });
        return;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // 2. 处理普通 HTTP 视频 (mp4等)
  if (urlLower.match(/\.(mp4|webm|ogg)$/)) {
    if (videoElement.value) {
      videoElement.value.src = props.rtspUrl;
      isLoading.value = false;
      initWebSocket();
    }
    return;
  }

  // 3. 处理 WebRTC (WHEP)
  try {
    peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnection.ontrack = (event) => {
      if (videoElement.value) {
        videoElement.value.srcObject = event.streams[0];
        isLoading.value = false;
        initWebSocket();
      }
    };

    peerConnection.addTransceiver('video', { direction: 'recvonly' });
    peerConnection.addTransceiver('audio', { direction: 'recvonly' });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    let postUrl = props.rtspUrl;

    let res = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/sdp' },
      body: offer.sdp,
    });

    if (res.status === 404) {
      console.warn('Direct POST 404, trying with /whep suffix...');
      postUrl = props.rtspUrl.endsWith('/') ? `${props.rtspUrl}whep` : `${props.rtspUrl}/whep`;
      res = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: offer.sdp,
      });
    }

    if (!res.ok) {
      throw new Error(`连接服务器失败: ${res.status} (${postUrl})`);
    }

    const answerSdp = await res.text();
    await peerConnection.setRemoteDescription(new RTCSessionDescription({
      type: 'answer',
      sdp: answerSdp,
    }));

  } catch (err: any) {
    console.error('WebRTC Error:', err);
    errorMsg.value = `连接失败: ${err.message || '未知错误'}`;
    isLoading.value = false;
  }
};

// 销毁连接
const stopPlay = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null;
    videoElement.value.src = '';
  }
  closeWebSocket();
};

// 生命周期
onMounted(() => {
  startPlay();

  // 监听容器大小变化，调整 Canvas
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      const canvas = canvasRef.value;
      const container = containerRef.value;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    });
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  stopPlay();
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

watch(() => props.rtspUrl, () => {
  stopPlay();
  setTimeout(() => startPlay(), 500);
});
</script>

<style scoped>
.webrtc-player {
  position: relative;
  width: 100%;
  height: 100%;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;
}

video {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 保持比例 */
}

.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 让鼠标事件穿透到视频控件 */
  z-index: 5; /* 在视频之上，但在loading/error之下 */
}

.loading-overlay, .error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  z-index: 10;
  gap: 10px;
}

.error-overlay {
  color: #f56c6c;
}
</style>
