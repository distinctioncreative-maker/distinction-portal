# MIGRATION PLAN — Distinction OS Portal
## Base44 → Self-Hosted Stack

Target stack: Hono + Bun (backend) · Postgres (database) · Drizzle ORM · Lucia v3 (auth) · Anthropic API (LLM)

---

## Phase Status

| Phase | Scope | Status |
|-------|-------|--------|
| Phase 1 | Build fix + stubs | ✅ Complete |
| Phase 2 | Auth backend + Login page | 🔜 Next |
| Phase 3 | DB schema + CRUD API | 🔜 Pending |
| Phase 4 | Backend automations | 🔜 Pending |
| Phase 5 | LLM replacement | 🔜 Pending |
| Phase 6 | RBAC server enforcement | 🔜 Pending |
| Phase 7 | Cleanup + env files | 🔜 Pending |

---

## Phase 1 — Build Fix ✅ COMPLETE

**Goal:** Get `npm run dev` running without Base44 credentials.

**Files changed:**
- `vite.config.js` — removed `@base44/vite-plugin`; added `@vitejs/plugin-react`, `@/` alias, `/api` proxy to `localhost:3000`
- `src/lib/app-params.js` — replaced URL/localStorage token bootstrap with `export const appParams = {}`
- `src/api/base44Client.js` — replaced `createClient()` from `@base44/sdk` with full-interface stub (16 entities + auth + integrations); all methods return empty data
- `src/lib/AuthContext.jsx` — removed `createAxiosClient` import; stubbed to immediately return unauthenticated state; hook shape preserved
- `package.json` — uninstalled `@base44/sdk` and `@base44/vite-plugin`

**Result:** `npm run build` passes clean. App renders unauthenticated state. All 19 pages load with empty data. No crashes.

---

## Phase 2 — Auth Backend + Login Page

**Goal:** Replace Base44 auth stubs with real session-based auth.

### New files
- `server/` — Hono + Bun project
- `server/src/index.ts` — entry point, middleware, route registration
- `server/src/db/schema/users.ts` — Drizzle schema: `users`, `sessions` tables
- `server/src/routes/auth.ts` — `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `PATCH /api/auth/me`
- `src/pages/Login.jsx` — login form calling `POST /api/auth/login`

### Updated files
- `src/lib/AuthContext.jsx` — replace stubs with real `fetch('/api/auth/me')` on mount; real logout call
- `src/components/layout/Sidebar.jsx` — replace `base44.auth.logout()` with `useAuth().logout()`
- `src/components/OrgContext.jsx` — replace `base44.auth.updateMe()` with `PATCH /api/auth/me`
- `src/components/OrgInitializer.jsx` — replace `base44.auth.updateMe()` with `PATCH /api/auth/me`
- `src/App.jsx` — add `/login` route; update auth guard to redirect to `/login`

### Auth library
- **Lucia v3** for session management — stores sessions in Postgres, issues `Set-Cookie` session token
- User table columns: `id`, `email`, `passwordHash`, `role`, `organizationId`, `firstName`, `lastName`, `isActive`, `createdDate`, `updatedDate`

### Role normalization
- Resolve `OrgContext.jsx` defaulting to `'staff'` — change default to `'user'`
- Use role enum: `user | admin | support | superadmin` everywhere

### Risks
- Session cookie config (SameSite, domain) must work in Vite dev proxy setup
- `PATCH /api/auth/me` must be available before Phase 3 entity routes (OrgContext depends on it)

---

## Phase 3 — Database Schema + Generic CRUD API

**Goal:** Replace all `base44.entities.*` stubs with real Postgres-backed fetch calls.

### New files
- `server/src/db/schema/` — one Drizzle schema file per entity (17 entities)
- `server/src/routes/entities.ts` — generic Hono CRUD router: `GET/POST /api/entities/:entity`, `PATCH/DELETE /api/entities/:entity/:id`
- `server/src/middleware/orgBoundary.ts` — enforces `WHERE organization_id = session.orgId` on every query

### Updated files
- `src/api/base44Client.js` — replace all stubs with real `fetch('/api/entities/:entity', {...})` calls

### Schema notes
- **`camelCase: true`** in Drizzle config — all DB columns are `snake_case`; JS/frontend uses `camelCase`
- **`fullName` computed field on Lead** — either store it or return `firstName + ' ' + lastName` in API response; frontend uses `lead.fullName` in Leads, Dashboard
- **`id` auto-generated** — backend sets UUID on every `POST`; frontend never sends `id`
- **`created_date` / `updated_date` auto-set** — backend middleware sets timestamps on create/update
- **`created_by` auto-set** — backend injects `session.userId` from Lucia session
- **Default sort** — apply `ORDER BY created_date DESC` when no sort param is provided

### Entity list
Lead, Task, Appointment, PipelineStage, PipelineItem, DailyMetric, ActivityLog, ClientNote, Organization, OrganizationSetting, BillingPackage, SupportSession, SupportActionLog, WidgetSetting, Notification, IntegrationStatus

### Risks
- camelCase/snake_case mismatch if Drizzle `camelCase` mode is not enabled — will silently break field access
- React Query `queryKey` naming must be consistent with entity names used in `queryClient.invalidateQueries()`

---

## Phase 4 — Backend Automations

**Goal:** Rebuild invisible Base44 behaviors that no frontend code creates.

These 4 entities will always be empty until this phase is done:

| Entity | What populates it | Impact if empty |
|--------|------------------|----------------|
| `ActivityLog` | Backend middleware on every mutation | Activity page, LeadDetail activity tab, Dashboard recent activity |
| `DailyMetric` | Scheduled cron job (daily aggregation) | Dashboard KPIs, Financials charts, Metrics charts |
| `Notification` | Service layer on relevant events | Notifications page, Dashboard unread count |
| `SupportActionLog` | Middleware on support session mutations | SupportLogs page |

### ActivityLog middleware
- Hono middleware wrapping every `POST`, `PATCH`, `DELETE` on entity routes
- Writes: `entityType`, `entityId`, `action`, `userId`, `organizationId`, `timestamp`, `diff` (optional)

### DailyMetric cron job
- Bun cron (daily at midnight or configurable)
- Aggregates from Lead, PipelineItem, Appointment for the previous day
- Fields: `date`, `revenueDaily`, `leadsCount`, `appointmentsCount`, `conversionRate`, `organizationId`

### Notification service
- Called from relevant mutation handlers (e.g., new lead assigned, task due, appointment reminder)
- Writes: `type`, `message`, `userId`, `organizationId`, `isRead=false`, `createdDate`

### SupportActionLog
- Written by middleware when `SupportSession` is created/updated
- Fields: `sessionId`, `action`, `performedBy`, `organizationId`, `timestamp`

---

## Phase 5 — LLM Replacement

**Goal:** Wire `AiSearchBar` to a real LLM endpoint.

### New files
- `server/src/routes/llm.ts` — `POST /api/llm/invoke`; calls Anthropic API via `@anthropic-ai/sdk`

### Updated files
- `src/components/layout/AiSearchBar.jsx` — one call site; replace `base44.integrations.Core.InvokeLLM(...)` with `fetch('/api/llm/invoke', { method: 'POST', body: JSON.stringify({ prompt }) })`

### Model recommendation
- Use `claude-haiku-4-5-20251001` — cheap, fast, sufficient for search queries
- Pass relevant entity context (leads, tasks, appointments) as part of the prompt for grounded results

---

## Phase 6 — RBAC Server-Side Enforcement

**Goal:** Enforce role checks server-side so frontend RBAC cannot be bypassed.

### Current state
- Frontend RBAC is real (Sidebar filters by `requiresRole`) but bypassable — any logged-in user can hit API routes directly
- No server-side role checks exist yet

### Implementation
- Hono middleware: `requireRole(roles: string[])` — checks `session.userRole` against allowed roles
- Apply per entity route group:
  - `support` + `superadmin` routes: SupportConsole, SupportLogs, OrgManagement
  - `admin` + `superadmin` routes: OrgSettings, OrgManagement write
  - `superadmin` only: cross-org queries, Organization create/delete

### Org boundary
- Already added in Phase 3 middleware — confirm it cannot be overridden by query params

---

## Phase 7 — Cleanup

**Goal:** Remove dead code, finalize env config, make repo handoff-ready.

### Files to delete or rewrite
- `src/pages/InitDemo.jsx` — hardcoded Base44 org ID; useless without Base44; rewrite as a proper seed CLI script or remove
- `src/components/UserNotRegisteredError.jsx` — Base44-specific error state; repurpose for "account not found" or remove

### Env files
- `frontend/.env.example` — `VITE_API_BASE_URL=http://localhost:3000`
- `server/.env.example` — `DATABASE_URL`, `LUCIA_SECRET`, `ANTHROPIC_API_KEY`, `PORT`

### Final docs update
- Update `BASE44_DEPENDENCY_AUDIT.md` status columns to reflect completed phases
- Update `PROJECT_MAP.md` stack table with live technology versions

---

## Key Risks Summary

| Risk | Phase | Mitigation |
|------|-------|-----------|
| camelCase/snake_case mismatch | 3 | Enable Drizzle `camelCase: true`; test each entity response shape against what pages expect |
| `fullName` computed field missing | 3 | Return `firstName + ' ' + lastName` as `fullName` in all Lead API responses |
| ActivityLog/DailyMetric/Notification always empty | 4 | Do not mark Phase 3 done until Phase 4 automation stub is at least in place |
| Session cookie not working through Vite proxy | 2 | Configure `credentials: 'include'` on all fetch calls; set `SameSite=Lax` on cookie |
| `'staff'` role default causes silent RBAC failures | 2 | Normalize to `'user'` in `OrgContext.jsx` and auth seed |
| RBAC bypassable until Phase 6 | 2–5 | Acceptable for internal tool; document explicitly |

---

## Target Infrastructure

| Service | Development | Production |
|---------|------------|------------|
| Frontend | Vite dev server (localhost:5173) | Vercel |
| Backend API | Bun (localhost:3000) | Railway or Render |
| Database | Local Postgres (port 54329) | Neon (serverless Postgres) |
| Auth | Lucia v3 sessions in Postgres | Same |
| LLM | Anthropic API (direct) | Same |
