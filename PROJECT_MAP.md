# PROJECT MAP — Distinction OS Portal

## What This App Is
Multi-tenant B2B CRM SaaS for Distinction Creative LLC. Manages leads, pipeline, tasks, appointments, financial metrics, and provides a support console for internal staff.

## Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 6 |
| Routing | React Router v6 |
| Data fetching | TanStack React Query v5 |
| UI | Tailwind CSS + Radix UI + shadcn/ui |
| Charts | Recharts |
| Animation | Framer Motion |
| Backend (needed) | Hono on Bun — Phase 2 |
| Database (needed) | Postgres — Phase 3 |

## CLI Commands
```bash
npm run dev       # Start Vite dev server (localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build
npm run lint      # ESLint
```

## Routes & Entity Dependencies

| Route | Page | Entities Read | Entities Written |
|-------|------|--------------|-----------------|
| `/` | → redirect to `/Dashboard` | — | — |
| `/Dashboard` | Dashboard | DailyMetric, Lead, Task, PipelineItem, ActivityLog, Notification, OrgSetting, WidgetSetting | Lead, Appointment (quick actions) |
| `/Leads` | Leads | Lead, PipelineStage | Lead |
| `/LeadDetail/:id` | LeadDetail | Lead, Task, Appointment, ActivityLog, ClientNote, PipelineStage | Lead, Task, Appointment, ClientNote |
| `/Pipeline` | Pipeline | PipelineStage, PipelineItem, Lead | PipelineStage, PipelineItem |
| `/Tasks` | Tasks | Task, Lead | Task |
| `/TaskDetail/:id` | TaskDetail | Task, Lead | Task |
| `/Calendar` | CalendarPage | Appointment, Lead, OrgSetting | Appointment |
| `/Financials` | Financials | DailyMetric, OrgSetting | — |
| `/Metrics` | Metrics | DailyMetric | — |
| `/Activity` | Activity | ActivityLog | — |
| `/Notifications` | Notifications | Notification | Notification |
| `/Profile` | Profile | User (via auth) | User (via auth.updateMe) |
| `/OrgSettings` | OrgSettings | Organization, OrganizationSetting | Organization, OrganizationSetting |
| `/Billing` | Billing | BillingPackage | — (display only) |
| `/SupportConsole` | SupportConsole | Organization, SupportSession | SupportSession |
| `/SupportLogs` | SupportLogs | SupportSession, SupportActionLog | — |
| `/OrgManagement` | OrgManagement | Organization, SupportSession, User | Organization, User |
| `/WidgetPreferences` | WidgetPreferences | WidgetSetting | WidgetSetting |
| `/InitDemo` | InitDemo | — | User (via auth.updateMe — hardcoded org ID, broken) |
| `*` | PageNotFound | — | — |

## Key Context Providers
| Provider | What it provides | File |
|----------|----------------|------|
| `AuthProvider` | `user`, `isAuthenticated`, `logout`, `navigateToLogin` | `src/lib/AuthContext.jsx` |
| `OrgProvider` | `organization`, `activeOrgId`, `userRole`, `isInternal`, `isSupportMode`, `enterSupportMode`, `exitSupportMode` | `src/components/OrgContext.jsx` |
| `QueryClientProvider` | React Query instance | `src/lib/query-client.js` |

## File Tree (src/)
```
src/
├── api/
│   └── base44Client.js        ← PHASE 1 STUB (replace in Phase 3)
├── components/
│   ├── dashboard/             ← MetricCard, RevenueChart, PipelineSummary, etc.
│   ├── layout/
│   │   ├── AppLayout.jsx
│   │   ├── Sidebar.jsx        ← calls base44.auth.logout() (Phase 2 fix)
│   │   └── AiSearchBar.jsx    ← calls InvokeLLM (Phase 5 fix)
│   ├── lead/
│   │   └── ClientNoteFeed.jsx
│   ├── pipeline/
│   │   └── StageManager.jsx
│   ├── ui/                    ← shadcn/Radix components (no changes needed)
│   ├── OrgContext.jsx         ← entity + auth calls (Phase 2-3 fix)
│   ├── OrgInitializer.jsx     ← entity + auth calls (Phase 2-3 fix)
│   └── UserNotRegisteredError.jsx  ← Base44-specific, repurpose in Phase 7
├── lib/
│   ├── AuthContext.jsx        ← PHASE 1 STUB (Phase 2 will add real auth)
│   ├── app-params.js          ← PHASE 1 STUB (empty)
│   ├── PageNotFound.jsx
│   ├── query-client.js
│   └── utils.js
├── pages/                     ← 19 pages, all entity calls via base44Client stub
├── hooks/
│   └── use-mobile.jsx
├── utils/
│   └── index.ts
├── App.jsx                    ← routing + auth guard
├── main.jsx
└── index.css
```

## RBAC Roles
| Role | Access |
|------|--------|
| `user` / `staff` | Standard CRM within their org |
| `admin` | Full org management + settings |
| `support` | SupportConsole + SupportLogs + OrgManagement (read) |
| `superadmin` | Full access across all orgs |

> **Note:** `OrgContext.jsx` defaults role to `'staff'` but docs define base role as `'user'`. Normalize in Phase 2.
