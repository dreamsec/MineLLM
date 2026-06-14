<template>
  <div ref="chartRef" class="ai-echart"></div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = defineProps<{
  option?: EChartsOption | Record<string, unknown>
}>()

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const resizeChart = () => {
  chartInstance?.resize()
}

const renderChart = async () => {
  await nextTick()
  if (!chartRef.value || !props.option) return

  // 图表容器首次出现时再初始化，避免隐藏状态下拿不到正确尺寸。
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
    window.addEventListener('resize', resizeChart)
  }

  chartInstance.setOption(props.option as EChartsOption, true)
  resizeChart()
}

watch(() => props.option, renderChart, { deep: true, immediate: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped>
.ai-echart {
  width: 100%;
  height: 320px;
  min-height: 260px;
}
</style>
