<template>
	<!-- <div class="dashboard-container"> -->
		<!-- 顶部标题 -->
		<div class="dashboard-header">
			<img src="@/assets/img/up.png" class="header-bg" alt="header-bg" />
			<div class="header-title">煤矿运维大屏</div>
		</div>
		<div class="dashboard-main">
			<!-- 左侧数据区 -->
			<div class="dashboard-side left gradient-left">
				<div class="side-content-wrapper">
					<div class="side-section">
						<div class="section-title">关键设备</div>
						<div class="section-card">
							<div class="device-list">
								<div class="device-item"><span>主通风机</span><span class="status ok">正常</span></div>
								<div class="device-item"><span>主提升机</span><span class="status ok">正常</span></div>
								<div class="device-item"><span>压风机</span><span class="status warn">预警</span></div>
								<div class="device-item"><span>排水泵</span><span class="status error">故障</span></div>
							</div>
						</div>
					</div>

					<div class="side-section health-section">
						<div class="section-title">系统健康</div>
						<div class="health-ring-card" >
							<div class="health-ring">
								<svg viewBox="0 0 100 100">
									<circle cx="50" cy="50" r="42" class="ring-bg" />
									<circle cx="50" cy="50" r="42" class="ring-fg" stroke-dasharray="234.5" stroke-dashoffset="23.45" />
								</svg>
								<div class="health-value">90<small>%</small></div>
							</div>
							<div class="health-info">
								<div>设备接入: <span>12 台</span></div>
								<div>设备离线: <span>1 台</span></div>
							</div>
						</div>
					</div>

          <div class="side-section">
						<div class="section-title">实时预警</div>
						<div class="section-card" style="background-image: url('@/assets/img/card.png');">
							<ul class="alert-list">
								<li class="alert-item warn">压风机温度过高</li>
								<li class="alert-item error">排水泵已离线</li>
								<li class="alert-item info">主通风机振动异常</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<!-- 中间3D模型区 -->
			<!-- <div class="dashboard-center">
				<img src="@/assets/img/3D.png" class="center-3d" alt="3d-model" />
			</div> -->
			<!-- 右侧数据区 -->
			<div class="dashboard-side right gradient-right">
				<div class="side-content-wrapper">
					<div class="side-section">
						<div class="section-title">能耗统计</div>
						<div class="section-card" style="background-image: url('@/assets/img/card.png');">
							<div class="energy-stats">
								<div class="energy-item">
									<span>今日用电</span>
									<span class="value">1247 kW·h</span>
								</div>
								<div class="energy-item">
									<span>今日用水</span>
									<span class="value">856 m³</span>
								</div>
								<div class="energy-item">
									<span>设备开机率</span>
									<span class="value">87.5%</span>
								</div>
							</div>
						</div>
					</div>
					<div class="side-section">
						<div class="section-title">设备状态</div>
						<div class="section-card" style="background-image: url('@/assets/img/card.png');">
							<div class="device-status">
								<div class="status-item">
									<div class="status-circle running">122</div>
									<span>运行中</span>
								</div>
								<div class="status-item">
									<div class="status-circle stopped">8</div>
									<span>已停机</span>
								</div>
								<div class="status-item">
									<div class="status-circle maintenance">4</div>
									<span>维修中</span>
								</div>
							</div>
						</div>
					</div>
					<div class="side-section performance-section">
						<div class="section-title" >运行效率</div>
						<div class="section-card" style="background-image: url('@/assets/img/card.png');">
							<div class="performance-chart">
								<div class="chart-bar">
									<div class="bar-fill" style="height: 85%;"></div>
									<span class="bar-label">周一</span>
								</div>
								<div class="chart-bar">
									<div class="bar-fill" style="height: 92%;"></div>
									<span class="bar-label">周二</span>
								</div>
								<div class="chart-bar">
									<div class="bar-fill" style="height: 78%;"></div>
									<span class="bar-label">周三</span>
								</div>
								<div class="chart-bar">
									<div class="bar-fill" style="height: 88%;"></div>
									<span class="bar-label">周四</span>
								</div>
								<div class="chart-bar">
									<div class="bar-fill" style="height: 95%;"></div>
									<span class="bar-label">周五</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- 底部二级菜单 -->
		<div class="dashboard-footer">
			<img src="@/assets/img/down.png" class="footer-bg" alt="footer-bg" />
			<div class="footer-menu">
				<!-- 这里放二级菜单内容 -->
			</div>
		</div>
	<!-- </div> -->
</template>

<script setup lang="ts">
// 暂无具体逻辑
</script>

<!-- background: #0a1a2a; -->
<style scoped>
.dashboard-container {
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}
.dashboard-header {
	position: relative;
	width: 100%;
	height: 120px;
	display: flex;
	align-items: center;
	justify-content: center;
  /* background: linear-gradient(rgba(10,26,42) 80%, rgba(10,26,42,0.9) 100%); */
}
.header-bg {
	position: absolute;
	left: 50%;
	top: 0;
	transform: translateX(-50%);
	width: 100vw;
	height: 120px;
	object-fit: cover;
	z-index: 1;
	pointer-events: none;
}
.header-title {
	position: relative;
	z-index: 2;
	font-size: 40px;
	font-weight: bold;
	color: #fff;
	letter-spacing: 8px;
	text-shadow: 0 4px 16px #1e90ff, 0 1px 0 #000;
}
.dashboard-main {
	flex: 1;
	display: flex;
	flex-direction: row;
	align-items: stretch;
	justify-content: space-between;
	min-height: 0;
}
.dashboard-side {
	position: relative;
	width: 340px;
	min-width: 260px;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}
.dashboard-side.left.gradient-left {
	/* background: linear-gradient(to right, rgba(10,26,42,1) 10%, rgba(10,26,42,0.12) 90%, rgba(10,26,42,0) 100%); */
background: linear-gradient(
    90deg,
    #071e36 0%,
    #0a1a2a 60%,
    rgba(10,26,42,0.7) 90%,
    rgba(10,26,42,0.2) 95%,
    rgba(30,144,255,0.08) 100%
  );
}
.dashboard-side.right.gradient-right {
	/* background: linear-gradient(to left, rgba(10, 26, 102, 1), rgba(204, 204, 204, 1)); */
  background: linear-gradient(
    to left,
    #071e36 0%,
    #0a1a2a 60%,
    rgba(10,26,42,0.7) 90%,
    rgba(10,26,42,0.2) 95%,
    rgba(30,144,255,0.08) 100%
  );
}
.side-content {
	position: relative;
	z-index: 2;
	width: 90%;
	height: 90%;
	color: #fff;
	/* 可自定义内容样式 */
}
.side-content-wrapper {
	width: 92%;
	height: 100%;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 20px 0;
}
.side-section {
	display: flex;
	flex-direction: column;
}
.side-section.health-section {
	flex: 1; /* 让健康状况模块占据剩余空间 */
	min-height: 0;
}
.section-title {
  background: url('@/assets/img/01.png') no-repeat left center;
  background-size: cover;
	height: 35px;
	line-height: 39px;
	color: #fff;
	font-size: 17px;
	font-weight: bold;
	letter-spacing: 2px;
	padding-left: 50px;
	background-repeat: no-repeat;
	margin-bottom: 2px;
}
.section-card {
  /* background: url('@/assets/img/card.png'); */
  background-size: contain;
	background-repeat: no-repeat;
	border-radius: 8px;
	padding: 16px;
	box-shadow: 0 0 12px rgba(30, 144, 255, 0.1);
	display: flex;
	flex-direction: column;
	gap: 10px;
}
.side-section.health-section .section-card {
	flex: 1;
	min-height: 0;
}

/* 关键设备 */
.device-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}
.device-item {
  background: url('@/assets/img/252.png') no-repeat left center;
  background-size: cover;
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: #e0e0e0;
	font-size: 15px;
  padding-left: 15px;
}
.status {
	padding: 2px 10px;
	border-radius: 4px;
	font-size: 13px;
	color: #fff;
}
.status.ok { background: rgba(23, 182, 147, 0.3); border: 1px solid #17B693; color: #17B693; }
.status.warn { background: rgba(255, 186, 0, 0.3); border: 1px solid #FFBA00; color: #FFBA00; }
.status.error { background: rgba(255, 77, 79, 0.3); border: 1px solid #FF4D4F; color: #FF4D4F; }

/* 实时预警 */
.alert-list {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 8px;
}
.alert-item {
	font-size: 15px;
	padding-left: 16px;
	position: relative;
}
.alert-item::before {
	content: '●';
	position: absolute;
	left: 0;
	top: 2px;
	font-size: 12px;
}
.alert-item.warn { color: #FFBA00; }
.alert-item.error { color: #FF4D4F; }
.alert-item.info { color: #1E90FF; }

/* 系统健康 */
.health-ring-card {
  display: flex;
  flex-direction: row;
	align-items: center;
	justify-content: center;
	gap: 10px;
}
.health-ring {
	position: relative;
	width: 120px;
	height: 120px;
}
.health-ring svg {
	transform: rotate(-90deg);
}
.health-ring .ring-bg {
	fill: none;
	stroke-width: 10;
	stroke: rgba(0, 122, 255, 0.15);
}
.health-ring .ring-fg {
	fill: none;
	stroke-width: 10;
	stroke: #00A37F;
	stroke-linecap: round;
	transition: stroke-dashoffset 0.5s;
}
.health-value {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	color: #fff;
	font-size: 32px;
	font-weight: bold;
}
.health-value small {
	font-size: 16px;
	margin-left: 2px;
}
.health-info {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	color: #e0e0e0;
	font-size: 15px;
}
.health-info span {
	color: #1E90FF;
	font-weight: bold;
	margin-left: 8px;
}

/* 右侧能耗统计 */
.energy-stats {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
.energy-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: #e0e0e0;
	font-size: 15px;
}
.energy-item .value {
	color: #1E90FF;
	font-weight: bold;
}

/* 右侧设备状态 */
.device-status {
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 10px 0;
}
.status-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
}
.status-circle {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
	font-weight: bold;
	color: #fff;
}
.status-circle.running {
	background: rgba(23, 182, 147, 0.3);
	border: 2px solid #17B693;
}
.status-circle.stopped {
	background: rgba(255, 77, 79, 0.3);
	border: 2px solid #FF4D4F;
}
.status-circle.maintenance {
	background: rgba(255, 186, 0, 0.3);
	border: 2px solid #FFBA00;
}
.status-item span {
	color: #e0e0e0;
	font-size: 14px;
}

/* 右侧运行效率图表 */
.performance-section {
	flex: 1;
}
.performance-chart {
	height: 100%;
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	padding: 20px 10px 30px;
}
.chart-bar {
	width: 30px;
	height: calc(100% - 30px);
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.bar-fill {
	width: 100%;
	background: linear-gradient(to top, #17B693, #1E90FF);
	border-radius: 4px;
	transition: height 0.5s ease;
}
.bar-label {
	position: absolute;
	bottom: -25px;
	color: #e0e0e0;
	font-size: 12px;
}

.dashboard-center {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100vw;
	background: url('@/assets/img/3D.png') no-repeat center center;
	background-size: cover;
	padding: 0;           /* 新增，去除内边距 */
	margin: 0;            /* 新增，去除外边距 */
	min-width: 0;         /* 新增，防止溢出 */
	max-width: 100vw;     /* 新增，限制最大宽度 */
}
.center-3d {
	max-width: 700px;
	max-height: 80vh;
	width: 100%;
	object-fit: contain;
	filter: drop-shadow(0 0 32px #1e90ff88);
}
.dashboard-footer {
	position: relative;
	width: 100%;
	height: 100px;
	display: flex;
	align-items: flex-end;
	justify-content: center;
  /* background: #0a1a2a; */
  /* background: linear-gradient(to top,rgba(10,26,42) 80%, rgba(10,26,42,0.9) 100%,rgba(30,144,255,0.9) 100%); */
  border: none;
}
.footer-bg {
	position: absolute;
	left: 50%;
	bottom: 0;
	transform: translateX(-50%);
	width: 100vw;
	height: 100px;
	object-fit: cover;
	z-index: 1;
	pointer-events: none;
}
.footer-menu {
	position: relative;
	z-index: 2;
	width: 80vw;
	height: 60px;
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: center;
	/* 可自定义菜单样式 */
}
@media (max-width: 1200px) {
	.dashboard-side {
		width: 180px;
		min-width: 120px;
	}
	.center-3d {
		max-width: 400px;
	}
}
</style>
