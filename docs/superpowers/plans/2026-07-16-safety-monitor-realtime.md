# Safety Monitor Realtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a realtime safety-monitor station dashboard beside the five existing machine dashboards.

**Architecture:** Keep transport types and API calls in `src/api/safety-monitor`, keep deterministic display transformations in `src/utils/safetyMonitor.ts`, and keep polling plus rendering in one focused Vue page. Register the page as a child of the existing dashboard route so the current route-driven menu renders it automatically.

**Tech Stack:** Vue 3, TypeScript, Vue Router, Axios request wrapper, Element Plus, Node assert scripts, Vite.

## Global Constraints

- Station code is exactly `24080000000043`.
- Recommended types are exactly `激光甲烷`, `粉尘`, and `环境温度`.
- Automatic refresh interval is exactly 30 seconds.
- Do not interpret `status_code`.
- Do not add a humidity placeholder.
- Add concise Chinese comments for non-obvious logic.
- Do not create Git commits before user review.

---

### Task 1: Safety monitor display utilities

**Files:**
- Create: `scripts/safetyMonitor.test.mjs`
- Create: `src/utils/safetyMonitor.ts`

**Interfaces:**
- Produces: `DEFAULT_SAFETY_MONITOR_STATION_CODE`, `RECOMMENDED_SAFETY_SENSOR_TYPES`, `normalizeSensorTypes`, `buildSensorTypesParam`, `groupSafetySensorsByType`, `formatSafetySensorValue`, `formatSafetyMonitorTime`, and `getSafetySensorTone`.

- [ ] **Step 1: Write the failing test**

Create assertions that require:

```js
normalizeSensorTypes([' 激光甲烷 ', '粉尘', '激光甲烷', '']) // ['激光甲烷', '粉尘']
buildSensorTypesParam([' 激光甲烷 ', '粉尘', '激光甲烷']) // '激光甲烷,粉尘'
formatSafetySensorValue(0) // '0'
formatSafetySensorValue(null) // '--'
groupSafetySensorsByType([{ sensor_type: null }]) // { 未知类型: [...] }
getSafetySensorTone('环境温度') // 'temperature'
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types scripts/safetyMonitor.test.mjs`

Expected: module-not-found failure for `src/utils/safetyMonitor.ts`.

- [ ] **Step 3: Write minimal implementation**

Implement pure functions without Vue or browser dependencies. Preserve numeric zero, trim and deduplicate types, and format valid ISO-like times with `Intl.DateTimeFormat('zh-CN', { hour12: false })`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types scripts/safetyMonitor.test.mjs`

Expected: `safetyMonitor tests passed`.

### Task 2: Safety monitor API contract

**Files:**
- Create: `src/api/safety-monitor/types/safetyMonitor.ts`
- Create: `src/api/safety-monitor/request.ts`
- Create: `src/api/safety-monitor/index.ts`

**Interfaces:**
- Produces: `SafetyMonitorSensor`, `SafetyMonitorStationRealtime`, `GetSafetyMonitorRealtimeResponse`, and `getSafetyMonitorRealtimeApi(stationCode, types?, signal?)`.
- Consumes: `buildSensorTypesParam(types)` from Task 1.

- [ ] **Step 1: Add response types**

Define every backend field as documented. Nullable fields must include `null`; `value` is `number | null`, and timestamps are `string | null`.

- [ ] **Step 2: Add request function**

Use:

```ts
request<GetSafetyMonitorRealtimeResponse>({
  url: `/api/v1/safety-monitor/stations/${encodeURIComponent(stationCode)}/realtime`,
  method: 'get',
  params: typesParam ? { types: typesParam } : undefined,
  signal,
  silent: true,
})
```

- [ ] **Step 3: Run type check**

Run: `npm.cmd run type-check`

Expected: no new TypeScript errors from the safety-monitor API module.

### Task 3: Realtime dashboard page

**Files:**
- Create: `scripts/safetyMonitorPage.test.mjs`
- Create: `src/views/Dashboard/safety-monitor/index.vue`

**Interfaces:**
- Consumes: Task 1 display utilities and Task 2 API function.
- Produces: Vue component named `SafetyMonitorIndex`.

- [ ] **Step 1: Add page states and data flow**

Use refs for station data, loading, refreshing, error message, current mode, and last successful refresh. Maintain one `AbortController` and one interval ID. Treat Axios cancellation as a silent exit.
Add a controller identity check before applying successful data or errors so an older request cannot overwrite the current filter result.

- [ ] **Step 2: Add lifecycle behavior**

On mount, request immediately, start a 30-second interval, and listen for `visibilitychange`. When hidden, stop and abort. When visible, refresh and restart. On unmount, remove all resources.

- [ ] **Step 3: Add rendered states**

Render:

- station header and raw metadata;
- a two-option segmented control for recommended/all;
- manual refresh icon button;
- grouped sensor sections;
- sensor cards containing name, code, value, unit, monitor time, category, and raw status code;
- initial loading, first-load error, stale-data refresh error, and empty list states.

- [ ] **Step 4: Add responsive styling**

Use a full-height dark dashboard, 8px-or-less card radius, stable responsive grid tracks, no nested cards, and mobile rules that prevent text overlap.

### Task 4: Route and menu integration

**Files:**
- Modify: `src/router/index.ts`
- Modify: `src/layouts/MainLayout.vue`

**Interfaces:**
- Produces: `/dashboard/safety-monitor`.

- [ ] **Step 1: Register the route**

Add a child after `yunshu`:

```ts
{
  path: 'safety-monitor',
  name: 'SafetyMonitor',
  component: () => import('../views/Dashboard/safety-monitor/index.vue'),
  meta: {
    title: '安全监测',
    hideInMenu: true,
  },
}
```

The existing submenu renders every titled child, so no separate menu list is needed.

- [ ] **Step 2: Add keep-alive name**

Append `SafetyMonitorIndex` to the existing keep-alive include list so route switching pauses and resumes the component consistently with machine dashboards.

### Task 5: Verification

**Files:**
- Verify all files changed by Tasks 1-4.

- [ ] **Step 1: Run focused test**

Run:

```text
node --experimental-strip-types scripts/safetyMonitor.test.mjs
node scripts/safetyMonitorPage.test.mjs
```

Expected: both safety-monitor scripts pass.

- [ ] **Step 2: Run type check**

Run: `npm.cmd run type-check`

Expected: exit code 0, or report pre-existing errors separately from new changes.

- [ ] **Step 3: Run production build**

Run: `npm.cmd run build-only`

Expected: exit code 0 and generated Vite assets.

- [ ] **Step 4: Inspect working tree**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; safety-monitor files remain uncommitted for user review.
