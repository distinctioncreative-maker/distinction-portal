# BASE44 DEPENDENCY AUDIT — Distinction OS Portal

Last audited: 2026-03-30
Status: Phase 1 complete — build system clean, runtime stubs in place.

---

## Build-Time Dependencies (REMOVED in Phase 1)

| Package | Where used | Status |
|---------|-----------|--------|
| `@base44/vite-plugin` | `vite.config.js` | ✅ Removed |
| `@base44/sdk` | `src/api/base44Client.js`, `src/lib/AuthContext.jsx` | ✅ Removed |

---

## Runtime Dependencies — File-by-File

### `src/api/base44Client.js`
| Was | Replacement | Phase | Status |
|-----|-------------|-------|--------|
| `createClient()` from `@base44/sdk` | `fetch('/api/entities/:entity')` | 3 | 🟡 Stubbed |
| `base44.entities.*` (16 entities) | Generic Hono CRUD client | 3 | 🟡 Stubbed — returns `[]` |
| `base44.auth.*` | `fetch('/api/auth/*')` | 2 | 🟡 Stubbed — no-ops |
| `base44.integrations.Core.InvokeLLM` | `fetch('/api/llm/invoke')` | 5 | 🟡 Stubbed — returns placeholder string |

---

### `src/lib/AuthContext.jsx`
| Was | Replacement | Phase | Status |
|-----|-------------|-------|--------|
| `createAxiosClient` from `@base44/sdk/dist/utils/axios-client` | Removed | 1 | ✅ Done |
| `base44.auth.me()` | `GET /api/auth/me` | 2 | 🟡 Stubbed |
| `base44.auth.logout()` | `POST /api/auth/logout` | 2 | 🟡 Stubbed |
| `base44.auth.redirectToLogin()` | `navigate('/login')` | 2 | 🟡 Stubbed → `window.location.href = '/login'` |
| Base44 public settings check | Remove entirely | 1 | ✅ Done |

---

### `src/lib/app-params.js`
| Was | Replacement | Phase | Status |
|-----|-------------|-------|--------|
| `VITE_BASE44_APP_ID` env var read | `VITE_API_BASE_URL` (or removed) | 2 | ✅ Replaced with empty stub |
| URL param token bootstrap | Lucia session cookie | 2 | ✅ Replaced with empty stub |
| `localStorage` `base44_*` keys | Lucia session cookie | 2 | ✅ Replaced with empty stub |

---

### `src/components/OrgContext.jsx`
| Was | Replacement | Phase | Status |
|-----|-------------|-------|--------|
| `base44.entities.Organization.list()` | `GET /api/entities/organizations` | 3 | 🔴 Still depends on Base44 stub |
| `base44.entities.Organization.filter({id})` | `GET /api/entities/organizations?id=X` | 3 | 🔴 Still depends |
| `base44.auth.updateMe({organizationId})` | `PATCH /api/auth/me` | 2 | 🔴 Still depends |
| `base44.entities.SupportSession.create()` | `POST /api/entities/support_sessions` | 3 | 🔴 Still depends |
| `base44.entities.SupportSession.update()` | `PATCH /api/entities/support_sessions/:id` | 3 | 🔴 Still depends |

---

### `src/components/OrgInitializer.jsx`
| Was | Replacement | Phase | Status |
|-----|-------------|-------|--------|
| `base44.entities.Organization.list()` | `GET /api/entities/organizations` | 3 | 🔴 Still depends |
| `base44.auth.updateMe({organizationId})` | `PATCH /api/auth/me` | 2 | 🔴 Still depends |

---

### `src/components/layout/Sidebar.jsx`
| Was | Replacement | Phase | Status |
|-----|-------------|-------|--------|
| `base44.auth.logout()` on Sign Out click | `useAuth().logout()` | 2 | 🔴 Still calls base44 stub |

---

### `src/components/layout/AiSearchBar.jsx`
| Was | Replacement | Phase | Status |
|-----|-------------|-------|--------|
| `base44.integrations.Core.InvokeLLM({prompt})` | `POST /api/llm/invoke` | 5 | 🟡 Stubbed — returns placeholder |
| `base44.entities.Lead.filter(...)` | via base44Client stub | 3 | 🟡 Stubbed — returns `[]` |
| `base44.entities.Task.filter(...)` | via base44Client stub | 3 | 🟡 Stubbed — returns `[]` |
| `base44.entities.Appointment.filter(...)` | via base44Client stub | 3 | 🟡 Stubbed — returns `[]` |

---

### `src/pages/InitDemo.jsx`
| Was | Replacement | Phase | Status |
|-----|-------------|-------|--------|
| `base44.auth.updateMe({organizationId: '69b2f6b90317a99f9510341c', role: 'owner'})` | Rewrite as seed utility or remove | 7 | 🔴 Still calls base44 stub (hardcoded org ID is dead) |

---

### All 19 Pages
All pages call `base44.entities.[Entity].filter/list/create/update` via the `base44` import from `src/api/base44Client.js`. Since that file is now a stub returning empty arrays, pages will render with no data but won't crash.

| Phase | What it fixes |
|-------|-------------|
| Phase 3 | Replace all entity stubs with real `fetch()` calls |

---

## Summary by Phase

| Phase | What gets fixed |
|-------|----------------|
| ✅ Phase 1 | Build system, SDK removed, stubs in place |
| 🔜 Phase 2 | Auth: login page, Lucia sessions, real `GET/POST/PATCH /api/auth/*`, fix Sidebar logout, fix OrgContext `auth.updateMe` |
| 🔜 Phase 3 | All entity CRUD: Drizzle schema, Hono CRUD router, replace base44Client stubs with real fetch calls |
| 🔜 Phase 4 | Backend automations: ActivityLog writes, DailyMetric cron, Notification service |
| 🔜 Phase 5 | LLM: `POST /api/llm/invoke` → Anthropic, fix AiSearchBar |
| 🔜 Phase 6 | RBAC server-side enforcement |
| 🔜 Phase 7 | Cleanup: InitDemo, UserNotRegisteredError, env files |
