export type HomeAlarmLevel = 'alarm' | 'warning'

export function getHomeAlarmLevel(hasFieldAlarm: boolean, thresholdBreachCount: number): HomeAlarmLevel | null {
  if (hasFieldAlarm) {
    // 字段报警通常来自设备故障、急停等强故障信号，优先按红色报警展示。
    return 'alarm'
  }

  if (thresholdBreachCount > 0) {
    // 仅阈值超限时按黄色警告展示，便于和故障字段报警区分。
    return 'warning'
  }

  return null
}
