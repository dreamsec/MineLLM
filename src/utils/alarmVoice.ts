export interface AlarmVoiceItem {
  id: string
  name?: string
  message?: string
}

export function pickNewAlarmItems<T extends AlarmVoiceItem>(
  alarms: readonly T[],
  announcedIds: ReadonlySet<string>,
) {
  return alarms.filter((alarm) => alarm.id && !announcedIds.has(alarm.id))
}

export function appendAnnouncedAlarmIds<T extends AlarmVoiceItem>(
  announcedIds: ReadonlySet<string>,
  alarms: readonly T[],
) {
  const nextIds = new Set(announcedIds)
  alarms.forEach((alarm) => {
    if (alarm.id) nextIds.add(alarm.id)
  })
  return nextIds
}

export function buildAlarmSpeechText(alarm: AlarmVoiceItem) {
  const deviceName = normalizeSpeechText(alarm.name) || '未知设备'
  const message = normalizeSpeechText(alarm.message) || '收到新的报警'
  return `${deviceName}，${message}`
}

function normalizeSpeechText(text?: string) {
  if (!text) return ''

  return text
    // 浏览器朗读 # 时经常会读成“井号”，这里转成设备语义里的“号”。
    .replace(/#/g, '号')
    // 把首页卡片里的 [设备报警] 转成更适合播报的停顿。
    .replace(/\[(.+?)\]/g, '$1，')
    .replace(/\s+/g, ' ')
    .replace(/，\s+/g, '，')
    .replace(/，+/g, '，')
    .trim()
}
