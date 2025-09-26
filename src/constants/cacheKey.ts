const SYSTEM_NAME = "equipment_yunwei"

/** 缓存数据时用到的 Key */
class CacheKey {
  static TOKEN = `${SYSTEM_NAME}-token-key`
  static TOKEN2 = `${SYSTEM_NAME}-token2-key`  // 添加第二个后端的Token键名
  static SIDEBAR_STATUS = `${SYSTEM_NAME}-sidebar-status-key`
  static ACTIVE_THEME_NAME = `${SYSTEM_NAME}-active-theme-name-key`
}

export default CacheKey
