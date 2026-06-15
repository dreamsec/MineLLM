// 摄像头所属位置约定：用于区分 GIS 图层摄像头和 Unity 场景摄像头。
export const CAMERA_LOCATION_GIS = 'gis'
export const CAMERA_LOCATION_YAFENG_PREFIX = 'yafeng'

export const CAMERA_LOCATION_OPTIONS = [
  { label: 'GIS一张图', value: CAMERA_LOCATION_GIS },
  { label: '压风机Unity图标1', value: `${CAMERA_LOCATION_YAFENG_PREFIX}-1` },
  { label: '压风机Unity图标2', value: `${CAMERA_LOCATION_YAFENG_PREFIX}-2` },
  { label: '压风机Unity图标3', value: `${CAMERA_LOCATION_YAFENG_PREFIX}-3` }
]

export function getYafengCameraLocation(iconId: number | string) {
  return `${CAMERA_LOCATION_YAFENG_PREFIX}-${Number(iconId)}`
}

export function getYafengIconIdFromLocation(location?: string | null) {
  const match = String(location || '').trim().match(/^yafeng-(\d+)$/)
  return match ? Number(match[1]) : null
}

export function isGisCameraLocation(location?: string | null) {
  const normalized = String(location || '').trim()
  // 兼容后端升级前没有 location 的旧摄像头，避免 GIS 老数据突然消失。
  return normalized === '' || normalized === CAMERA_LOCATION_GIS
}
