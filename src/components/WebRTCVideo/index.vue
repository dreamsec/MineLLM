<template>
  <div class="webrtc-player">
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
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { Loading, Warning } from '@element-plus/icons-vue';

const props = defineProps({
  rtspUrl: { // 这里接收的是后端返回的 http://...:8889/cam_x 地址
    type: String,
    required: true
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

const videoElement = ref<HTMLVideoElement | null>(null);
const isLoading = ref(true);
const errorMsg = ref('');
let peerConnection: RTCPeerConnection | null = null;

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
    // 如果HLS处理失败，继续往下尝试（虽然不太可能）
  }

  // 2. 处理普通 HTTP 视频 (mp4等)
  if (urlLower.match(/\.(mp4|webm|ogg)$/)) {
    if (videoElement.value) {
      videoElement.value.src = props.rtspUrl;
      isLoading.value = false;
    }
    return;
  }

  // 3. 处理 WebRTC (WHEP)
  // 假设是 MediaMTX 或类似支持 WHEP 的服务
  try {
    // 1. 创建 RTCPeerConnection
    peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // 2. 监听远程流 (MediaMTX 发回来的视频)
    peerConnection.ontrack = (event) => {
      if (videoElement.value) {
        videoElement.value.srcObject = event.streams[0];
        isLoading.value = false; // 画面来了，关闭加载动画
      }
    };

    // 3. 添加 Transceiver
    peerConnection.addTransceiver('video', { direction: 'recvonly' });
    peerConnection.addTransceiver('audio', { direction: 'recvonly' });

    // 4. 创建 Offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // 5. 发送 Offer 给 MediaMTX (通过 HTTP POST)
    // 优先尝试直接 POST，如果 404 则尝试追加 /whep (MediaMTX 规范)
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

    // 6. 拿到 Answer 并设置
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
};

// 生命周期
onMounted(() => {
  startPlay();
});

onBeforeUnmount(() => {
  stopPlay();
});

// 监听 URL 变化
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
