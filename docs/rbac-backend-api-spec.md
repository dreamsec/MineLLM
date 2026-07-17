# RBAC 权限管理系统 — 后端 API 需求文档

> **目标**：重构角色管理、权限管理相关接口，解决当前前后端数据类型不一致、接口职责混乱、非原子操作等问题。

---

## 一、通用约定

### 1.1 统一响应格式

所有接口统一返回以下 JSON 结构：

```json
{
  "code": 1,
  "message": "处理成功",
  "data": { ... }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 业务状态码，**1** 表示成功，**0** 表示失败 |
| message | string | 提示信息 |
| data | object / array / null | 实际返回数据 |

### 1.2 分页请求参数

需要分页的列表接口，统一使用以下 query 参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码，从 1 开始 |
| size | int | 否 | 20 | 每页条数，最大 200 |

### 1.3 分页响应格式

```json
{
  "code": 1,
  "message": "success",
  "data": {
    "items": [ ... ],
    "total": 100,
    "page": 1,
    "size": 20
  }
}
```

---

## 二、核心数据结构

### 2.1 Permission（权限）

```json
{
  "id": 1,
  "name": "用户列表",
  "code": "user:list",
  "type": 1,
  "parent_id": 0,
  "path": "/system/users",
  "route_name": "UserList",
  "icon": "user",
  "order_num": 1,
  "status": 1,
  "remark": "查看用户列表",
  "create_time": "2025-01-01T00:00:00Z"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | int | 自动 | 主键 |
| name | string | 是 | 权限名称（用于前端展示） |
| code | string | 是 | 权限标识码，全局唯一，如 `user:create` |
| type | int | 是 | **1**=菜单权限，**2**=按钮权限，**3**=API 权限 |
| parent_id | int | 否 | 父权限 ID，0 表示顶级 |
| path | string | 否 | 前端路由路径（菜单权限使用） |
| route_name | string | 否 | 前端路由名称（菜单权限使用） |
| icon | string | 否 | 图标标识 |
| order_num | int | 否 | 排序号 |
| status | int | 是 | **1**=启用，**0**=禁用 |
| remark | string | 否 | 备注 |

### 2.2 Role（角色）

```json
{
  "id": 1,
  "name": "管理员",
  "code": "admin",
  "description": "系统管理员，拥有全部权限",
  "status": 1,
  "permissions": [
    { "id": 1, "name": "用户列表", "code": "user:list", "type": 1 }
  ],
  "user_count": 5,
  "create_time": "2025-01-01T00:00:00Z",
  "update_time": "2025-06-01T12:00:00Z"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| name | string | 角色名称 |
| code | string | 角色标识码，全局唯一 |
| description | string | 角色描述 |
| status | int | **1**=启用，**0**=禁用 |
| permissions | array | 关联的权限对象数组（**每个对象至少包含 id + name**） |
| user_count | int | 拥有该角色的用户数量 |
| create_time | string | 创建时间 |
| update_time | string | 更新时间 |

> **重要**：`permissions` 字段返回的是**权限对象数组**而非纯字符串数组，每个对象必须携带 `id` 和 `name`，这样前端在编辑回填时可以用 **ID 直接匹配**，避免名称反查的脆弱性。

### 2.3 User（用户 — 仅涉及角色相关字段）

角色关联的用户简要信息：

```json
{
  "id": 1,
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "avatar": "https://xxx/avatar.png",
  "status": 1
}
```

---

## 三、API 接口详细设计

### 3.1 权限管理

#### 3.1.1 获取权限列表（平铺）

```
GET /api/v1/rbac/permission/list
```

**请求参数**（Query）：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页条数，默认 200（建议设大一些，前端一般不分页） |
| type | int | 否 | 按类型筛选：1=菜单，2=按钮，3=API |
| status | int | 否 | 按状态筛选：1=启用，0=禁用 |
| keyword | string | 否 | 按 name 或 code 模糊搜索 |

**响应示例**：

```json
{
  "code": 1,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "用户管理",
        "code": "user:manage",
        "type": 1,
        "parent_id": 0,
        "path": "/system/users",
        "route_name": "UserList",
        "icon": "user",
        "order_num": 1,
        "status": 1,
        "remark": ""
      },
      {
        "id": 2,
        "name": "创建用户",
        "code": "user:create",
        "type": 2,
        "parent_id": 1,
        "path": "",
        "route_name": "",
        "icon": "",
        "order_num": 1,
        "status": 1,
        "remark": ""
      }
    ],
    "total": 50,
    "page": 1,
    "size": 200
  }
}
```

---

#### 3.1.2 获取权限树（推荐前端使用）

```
GET /api/v1/rbac/permission/tree
```

> 按 `parent_id` 组装成树形结构，前端可直接用于渲染带层级的权限选择器。

**请求参数**（Query）：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | int | 否 | 按类型筛选 |
| status | int | 否 | 默认 **1**（只返回启用的权限） |

**响应示例**：

```json
{
  "code": 1,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "系统管理",
      "code": "system",
      "type": 1,
      "children": [
        {
          "id": 2,
          "name": "用户管理",
          "code": "user:manage",
          "type": 1,
          "children": [
            { "id": 3, "name": "创建用户", "code": "user:create", "type": 2, "children": [] },
            { "id": 4, "name": "编辑用户", "code": "user:update", "type": 2, "children": [] },
            { "id": 5, "name": "删除用户", "code": "user:delete", "type": 2, "children": [] }
          ]
        },
        {
          "id": 6,
          "name": "角色管理",
          "code": "role:manage",
          "type": 1,
          "children": [
            { "id": 7, "name": "创建角色", "code": "role:create", "type": 2, "children": [] }
          ]
        }
      ]
    }
  ]
}
```

---

### 3.2 角色管理

#### 3.2.1 获取角色列表

```
GET /api/v1/rbac/role/list
```

**请求参数**（Query）：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页条数，默认 20 |
| keyword | string | 否 | 按 name 或 code 模糊搜索 |
| status | int | 否 | 按状态筛选 |

**响应示例**：

```json
{
  "code": 1,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "管理员",
        "code": "admin",
        "description": "系统管理员",
        "status": 1,
        "permissions": [
          { "id": 1, "name": "用户管理", "code": "user:manage", "type": 1 },
          { "id": 2, "name": "创建用户", "code": "user:create", "type": 2 }
        ],
        "user_count": 3,
        "create_time": "2025-01-01T00:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "size": 20
  }
}
```

---

#### 3.2.2 获取角色详情

```
GET /api/v1/rbac/role/{id}
```

**响应示例**：

```json
{
  "code": 1,
  "message": "success",
  "data": {
    "id": 1,
    "name": "管理员",
    "code": "admin",
    "description": "系统管理员",
    "status": 1,
    "permissions": [
      { "id": 1, "name": "用户管理", "code": "user:manage", "type": 1 },
      { "id": 2, "name": "创建用户", "code": "user:create", "type": 2 }
    ],
    "users": [
      { "id": 1, "username": "zhangsan", "email": "zhangsan@example.com", "avatar": "...", "status": 1 }
    ],
    "create_time": "2025-01-01T00:00:00Z",
    "update_time": "2025-06-01T12:00:00Z"
  }
}
```

---

#### 3.2.3 创建角色 ⭐ 关键接口

```
POST /api/v1/rbac/role
```

**请求体**：

```json
{
  "name": "编辑员",
  "code": "editor",
  "description": "内容编辑角色",
  "status": 1,
  "permission_ids": [1, 2, 3, 5, 7]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | **是** | 角色名称 |
| code | string | **是** | 角色标识码，全局唯一 |
| description | string | 否 | 角色描述 |
| status | int | 否 | 默认 1 |
| permission_ids | int[] | **是** | 关联的权限 ID 数组（**允许空数组 `[]`**） |

> **设计要点**：创建角色和分配权限在**一个事务中完成**，不要分开两个接口。如果 `permission_ids` 为空数组，只创建角色不关联权限。

**响应**：

```json
{
  "code": 1,
  "message": "角色创建成功",
  "data": {
    "id": 10,
    "name": "编辑员",
    "code": "editor",
    "description": "内容编辑角色",
    "status": 1,
    "permissions": [
      { "id": 1, "name": "用户管理" },
      { "id": 2, "name": "创建用户" }
    ],
    "create_time": "2025-07-07T10:00:00Z"
  }
}
```

> **关键**：响应中直接返回完整的角色对象（含 `id` 和 `permissions`），前端无需再调用其他接口。

---

#### 3.2.4 更新角色 ⭐ 关键接口

```
PUT /api/v1/rbac/role/{id}
```

**请求体**：

```json
{
  "name": "编辑员",
  "code": "editor",
  "description": "内容编辑角色（已更新）",
  "status": 1,
  "permission_ids": [1, 2, 3]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | **是** | 角色名称 |
| code | string | **是** | 角色标识码，全局唯一（排除自身） |
| description | string | 否 | 角色描述 |
| status | int | 否 | 状态 |
| permission_ids | int[] | **是** | 关联的权限 ID 数组（**全量替换**，非增量） |

> **设计要点**：
> 1. 角色信息更新和权限更新在**一个事务中完成**
> 2. `permission_ids` 采用**全量替换**策略 — 传什么就设为什么，旧权限关联先删后插
> 3. **不再需要单独的"为角色分配权限"接口**

**响应**：

```json
{
  "code": 1,
  "message": "角色更新成功",
  "data": {
    "id": 10,
    "name": "编辑员",
    "code": "editor",
    "description": "内容编辑角色（已更新）",
    "status": 1,
    "permissions": [
      { "id": 1, "name": "用户管理" },
      { "id": 2, "name": "创建用户" },
      { "id": 3, "name": "编辑用户" }
    ],
    "update_time": "2025-07-07T12:00:00Z"
  }
}
```

---

#### 3.2.5 删除角色

```
DELETE /api/v1/rbac/role/{id}
```

**逻辑要求**：
- 删除角色时，自动解除该角色与所有用户、所有权限的关联
- 需要检查该角色是否有关联用户，如果有，建议返回确认信息或直接拒绝

**响应**：

```json
{
  "code": 1,
  "message": "角色删除成功",
  "data": null
}
```

---

### 3.3 用户-角色关联

#### 3.3.1 为用户分配角色

```
POST /api/v1/rbac/user/{id}/roles
```

**请求体**：

```json
{
  "role_ids": [1, 2, 3]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| role_ids | int[] | **是** | 角色 ID 数组（**全量替换**） |

**响应**：

```json
{
  "code": 1,
  "message": "角色分配成功",
  "data": null
}
```

---

## 四、关键设计决策（与旧版对比）

| 对比项 | 旧设计 | 新设计 |
|--------|--------|--------|
| 创建角色 | `POST /role`（只含基本信息） + `POST /role/{id}/permissions`（再发一次请求关联权限） | `POST /role` **一步完成**，请求体直接带 `permission_ids` |
| 更新角色 | `PUT /role` + `POST /role/{id}/permissions` | `PUT /role/{id}` **一步完成**，全量替换权限 |
| 权限数据格式 | 列表接口返回**字符串数组** `["用户管理", "创建用户"]` | 统一返回**对象数组** `[{id:1, name:"用户管理"}]`，ID 始终存在 |
| 编辑回填 | 前端用权限名反查 ID（不可靠） | 前端用权限 ID 直接匹配（精确可靠） |
| 权限列表 | 仅平铺 | 平铺 + **树形**两个接口，前端按需选择 |
| 事务性 | 两步操作非原子 | 单次请求，数据库事务保证 |

---

## 五、移除的旧接口

以下接口在新设计中**不再需要**，后端可移除或标记废弃：

- ~~`POST /api/v1/rbac/role/{id}/permissions`~~ → 功能已合并到创建/更新角色接口的 `permission_ids` 字段

---

## 六、前端对接改造清单（预览）

当后端按本文档改好后，前端需要做以下改动：

1. **删除** `assignRolePermissionsapi` 调用 — 创建/更新角色时不再单独调权限分配接口
2. **修改** `createRole` / `updateRole` 的请求体，增加 `permission_ids` 字段
3. **修改** `saveRole` 逻辑 — 用接口返回的角色 ID 更新本地状态，不再依赖 `editingRole`
4. **修改** `editRole` 回填逻辑 — 用 `permission.id` 直接匹配，不再用名称反查
5. **更新** TypeScript 类型定义，对齐新接口结构
6. **可选** 如果后端提供 `GET /permission/tree`，前端可改为树形权限选择器
