import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { dismissEquipmentAlarmApi, getActiveEquipmentAlarmsApi } from '@/api/equipment-alarm'
import {
  mapAlarmEventToHomeItem,
  normalizeAlarmEventList,
  type HomeAlarmItem,
} from '@/utils/homeAlarmEvent'
import {
  appendAnnouncedAlarmIds,
  buildAlarmSpeechText,
  pickNewAlarmItems,
} from '@/utils/alarmVoice'

const ALARM_POLLING_INTERVAL = 60000

export const useAlarmCenterStore = defineStore('alarmCenter', () => {
  const alarmList = ref<HomeAlarmItem[]>([])
  const dismissingAlarmIds = ref<Record<string, boolean>>({})
  const voiceEnabled = ref(false)
  const baselineReady = ref(false)
  const polling = ref(false)
  const announcedAlarmIds = ref<Set<string>>(new Set())

  let pollingTimer: number | null = null

  const activeAlarmCount = computed(() => alarmList.value.length)
  const speechSupported = computed(() => {
    return typeof window !== 'undefined'
      && 'speechSynthesis' in window
      && 'SpeechSynthesisUtterance' in window
  })

  async function fetchActiveAlarms() {
    try {
      const res = await getActiveEquipmentAlarmsApi()
      const events = normalizeAlarmEventList(res?.data)
      const nextAlarms = events.map((event) =>
        mapAlarmEventToHomeItem(event, getDeviceName(event.equipment_code)),
      )

      alarmList.value = nextAlarms
      handleAlarmVoice(nextAlarms)
    } catch (error) {
      console.error('获取全局活跃报警失败:', error)
    }
  }

  function startPolling() {
    if (pollingTimer !== null) return

    polling.value = true
    fetchActiveAlarms()
    pollingTimer = window.setInterval(fetchActiveAlarms, ALARM_POLLING_INTERVAL)
  }

  function stopPolling() {
    if (pollingTimer === null) return

    window.clearInterval(pollingTimer)
    pollingTimer = null
    polling.value = false
  }

  async function dismissAlarm(item: HomeAlarmItem) {
    if (dismissingAlarmIds.value[item.id]) return

    dismissingAlarmIds.value = {
      ...dismissingAlarmIds.value,
      [item.id]: true,
    }

    try {
      await dismissEquipmentAlarmApi(item.eventId)
      alarmList.value = alarmList.value.filter(alarm => alarm.id !== item.id)
      announcedAlarmIds.value = appendAnnouncedAlarmIds(announcedAlarmIds.value, [item])
      ElMessage.success('报警已忽略')
    } catch (error) {
      console.error('忽略报警失败:', error)
      ElMessage.error('报警忽略失败，请稍后重试')
    } finally {
      const nextState = { ...dismissingAlarmIds.value }
      delete nextState[item.id]
      dismissingAlarmIds.value = nextState
    }
  }

  function toggleAlarmVoice() {
    if (voiceEnabled.value) {
      disableAlarmVoice()
      return
    }

    enableAlarmVoice()
  }

  function enableAlarmVoice() {
    if (!speechSupported.value) {
      ElMessage.warning('当前浏览器不支持语音播报')
      return
    }

    voiceEnabled.value = true
    // 开启时把当前已存在的报警作为基线，避免旧报警一次性连续播报。
    announcedAlarmIds.value = appendAnnouncedAlarmIds(announcedAlarmIds.value, alarmList.value)
    speakText('报警语音已开启')
  }

  function disableAlarmVoice() {
    voiceEnabled.value = false
    if (speechSupported.value) {
      window.speechSynthesis.cancel()
    }
  }

  function handleAlarmVoice(nextAlarms: HomeAlarmItem[]) {
    // 首次拉取只建立基线，避免进入系统时把历史活跃报警都播一遍。
    if (!baselineReady.value) {
      announcedAlarmIds.value = appendAnnouncedAlarmIds(announcedAlarmIds.value, nextAlarms)
      baselineReady.value = true
      return
    }

    const newAlarms = pickNewAlarmItems(nextAlarms, announcedAlarmIds.value)
    if (newAlarms.length === 0) return

    announcedAlarmIds.value = appendAnnouncedAlarmIds(announcedAlarmIds.value, newAlarms)
    if (!voiceEnabled.value) return

    newAlarms.forEach((alarm) => {
      speakText(buildAlarmSpeechText(alarm))
    })
  }

  function speakText(text: string) {
    if (!speechSupported.value) return

    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 1
      utterance.pitch = 1
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('报警语音播报失败:', error)
    }
  }

  return {
    activeAlarmCount,
    alarmList,
    dismissingAlarmIds,
    fetchActiveAlarms,
    polling,
    speechSupported,
    startPolling,
    stopPolling,
    toggleAlarmVoice,
    voiceEnabled,
    dismissAlarm,
  }
})

function getDeviceName(code: string) {
  if (code.startsWith('TS')) return '主提升机'
  if (code.startsWith('YF')) return `压风机#${parseInt(code.replace('YF', ''))}`
  if (code.startsWith('TF')) return `通风机#${parseInt(code.replace('TF', ''))}`
  if (code.startsWith('PS')) return `排水泵#${parseInt(code.replace('PS', ''))}`
  if (code.startsWith('YS')) return '运输皮带'
  return code
}
