import { request2 } from "@/utils/service"
import type * as SwitchRole from "./types/switch_role"

/** 切换权限（切换用户登录）并返回 Token */
export function switchRoleApi(data: SwitchRole.ISwitchRoleRequestData) {
  return request2<SwitchRole.ISwitchRoleResponseData>({
    url: "auth/switch/role",
    method: "post",
    data
  })
}
