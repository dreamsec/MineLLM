# Safety Monitor Table Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the safety-monitor card wall with a blue technology-style table that displays all station sensors by default.

**Architecture:** Preserve the existing API, route, polling, cancellation, and error behavior. Add one pure local-filter helper in `src/utils/safetyMonitor.ts`, then rebuild only the safety-monitor Vue template and scoped styles around an Element Plus table.

**Tech Stack:** Vue 3, TypeScript, Element Plus, Node assert scripts, Vite.

## Global Constraints

- Default request must omit `types` and return all station sensors.
- Table columns must expose every documented sensor field.
- `status_code` remains raw and uninterpreted.
- Refresh interval remains exactly 30 seconds.
- Do not add humidity placeholders.
- Add concise Chinese comments for non-obvious logic.
- Do not create Git commits before user review.

---

### Task 1: Local table filtering

**Files:**
- Modify: `scripts/safetyMonitor.test.mjs`
- Modify: `src/utils/safetyMonitor.ts`

**Interfaces:**
- Produces: `filterSafetySensors(sensors, { type, keyword })`.

- [ ] Write assertions for combined type and keyword matching.
- [ ] Run `node --experimental-strip-types scripts/safetyMonitor.test.mjs` and verify it fails because `filterSafetySensors` is missing.
- [ ] Implement trim-aware, case-insensitive matching against sensor name, code, and type.
- [ ] Run the same command and verify `safetyMonitor tests passed`.

### Task 2: Table page contract

**Files:**
- Modify: `scripts/safetyMonitorPage.test.mjs`
- Modify: `src/views/Dashboard/safety-monitor/index.vue`

**Interfaces:**
- Consumes: `filterSafetySensors`.
- Produces: the existing `SafetyMonitorIndex` route component with a table-first layout.

- [ ] Change the page contract to require an `el-table`, all-data default request, search input, type filter, and absence of `sensor-card`.
- [ ] Run `node scripts/safetyMonitorPage.test.mjs` and verify the old card page fails the contract.
- [ ] Replace the card sections with a single table and blue technology-style header, toolbar, metrics, rows, fixed header, and responsive overflow.
- [ ] Preserve error, empty, loading, polling, visibility, cancellation, and stale-response behavior.
- [ ] Run both safety-monitor scripts and verify they pass.

### Task 3: Verification

**Files:**
- Verify the files changed in Tasks 1-2.

- [ ] Run targeted ESLint for the safety-monitor utility, page, and tests.
- [ ] Run all `scripts/*.test.mjs`.
- [ ] Run `npm.cmd run build-only`.
- [ ] Run `npm.cmd run type-check` and confirm no safety-monitor errors remain, while reporting repository pre-existing errors separately.
- [ ] Run `git diff --check`.
- [ ] Verify `http://127.0.0.1:8085/dashboard/safety-monitor` returns the Vite page.
