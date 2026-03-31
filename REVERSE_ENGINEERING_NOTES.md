# REVERSE ENGINEERING NOTES — Distinction OS Portal

Cross-reference of 3 handoff docs against actual exported repo code.
Documents audited: `complete-technical-handoff.md`, `reverse-engineering-appendix.md`, `hidden-logic-for-external-rebuild.md`

---

## ✅ Claims Verified as Accurate

- **17 entities** defined in docs match what the frontend code actually uses (including IntegrationStatus)
- **19 routes** in docs match `App.jsx` exactly
- **RBAC sidebar filtering** is real frontend logic in `Sidebar.jsx` — `filteredGroups` filters by `requiresRole`
- **OrgContext support mode** is real — `enterSupportMode`/`exitSupportMode` create/update `SupportSession` records
- **Multi-tenancy via `activeOrgId`** is real — all data queries should use this, not `user.organizationId` directly
- **`OrgInitializer` auto-assign logic** is real — if user has no `organizationId`, it finds the first org and calls `base44.auth.updateMe`
- **Billing page is display-only** — confirmed, no Stripe API calls anywhere in frontend
- **External calendar sync is stubbed** — `Appointment.externalCalendarId` field exists but no OAuth or sync code
- **WhatsApp is UI-only** — toggle in OrgSettings, no backend integration code

---

## ❌ Doc Claims That Are WRONG or Misleading

### 1. `InitDemo.jsx` does NOT create demo data
- **Docs claim:** "Creates initial org, demo leads, tasks, pipeline stages, DailyMetrics"
- **Actual code:** Only calls `base44.auth.updateMe({organizationId: '69b2f6b90317a99f9510341c', role: 'owner', isActive: true})` then redirects to `/Dashboard`
- **Reality:** The demo data seeding was done by a Base44 backend automation, not by this file
- **Impact:** When rebuilding, you must write a separate seed script — this file cannot be adapted for that purpose without a full rewrite

### 2. Role enum mismatch between docs and code
- **Docs define roles as:** `user | admin | support | superadmin`
- **`OrgContext.jsx` defaults to:** `const userRole = user?.role || 'staff'`
- **Inconsistency:** The default fallback is `'staff'`, not `'user'`. No page checks for `'staff'` explicitly — it falls through to no-match behavior on role checks
- **Impact:** When implementing auth (Phase 2), pick one enum and use it everywhere. Recommendation: use `user | admin | support | superadmin` as docs specify; change the `'staff'` fallback to `'user'`

### 3. `base44.entities.subscribe()` (real-time) is NOT used in frontend
- **Docs claim:** "Real-time entity subscriptions via `base44.entities.subscribe()` via WebSockets — fully implemented"
- **Actual code:** Zero calls to `.subscribe()` found anywhere in the frontend
- **Reality:** Real-time was either used in backend functions only, or planned but not implemented
- **Impact:** You do NOT need to build a WebSocket server to match current frontend behavior. The frontend uses React Query polling. Skip real-time in early phases.

### 4. `base44.analytics.track()` is NOT in frontend code
- **Docs claim:** "Analytics (Base44) — ✅ Fully Implemented — `base44.analytics.track()`"
- **Actual code:** Zero calls to `base44.analytics.track()` found in any frontend file
- **Reality:** This was either a backend-only call or never implemented in the frontend export
- **Impact:** No analytics replacement needed in frontend. Skip.

### 5. ActivityLog, DailyMetric, Notification, SupportActionLog have NO frontend write path
- **Docs imply:** These entities are populated as part of normal app operation
- **Actual code:** The frontend never calls `.create()` on these entities anywhere
- **Reality (per hidden-logic doc, confirmed):** All writes to these entities were done by Base44 entity automations and scheduled jobs configured in the Base44 dashboard — invisible in the exported code
- **Impact (critical):** If you only replace the CRUD API layer, these 4 entities will always be empty:
  - `ActivityLog` → pages: Activity, LeadDetail activity tab, Dashboard recent activity
  - `DailyMetric` → pages: Dashboard KPIs, Financials, Metrics (all charts empty)
  - `Notification` → pages: Notifications, Dashboard unread count
  - `SupportActionLog` → pages: SupportLogs
  - **You must build explicit backend middleware/jobs to populate these (Phase 4)**

### 6. IntegrationStatus entity not referenced in any frontend page
- **Docs define:** `IntegrationStatus` entity with `integrationType` enum (stripe, openclaw, whatsapp, etc.)
- **Actual code:** No page file calls `base44.entities.IntegrationStatus.*`
- **Inference:** OrgSettings may display integration toggles using `OrganizationSetting` flags, not `IntegrationStatus` records
- **Impact:** Low priority. Add the table in Phase 3 schema but don't wire it up until integrations are built

---

## ⚠️ Non-Obvious Hidden Behaviors (from `hidden-logic-for-external-rebuild.md`, confirmed)

These are things the frontend assumes exist but that must be explicitly rebuilt:

| Behavior | Frontend assumption | What you must build |
|----------|-------------------|---------------------|
| `id` auto-generated on create | Frontend never sets `id` | Backend must generate UUID on every `POST` |
| `created_date` / `updated_date` auto-set | Frontend never sets these | Backend must set timestamps on create/update |
| `created_by` auto-set | Frontend never sets this | Backend must inject `user.id` from session on create |
| `organizationId` RLS | Frontend trusts the SDK to scope queries | Backend must enforce `WHERE organization_id = $session.org` on every query |
| `fullName` computed field on Lead | `lead.fullName` used in Leads, Dashboard | Either store it or compute it as `firstName + ' ' + lastName` in the API response |
| ActivityLog writes | No frontend create calls | Backend middleware must write these on every mutation |
| DailyMetric aggregation | Frontend reads and displays | Backend cron job must compute and write these daily |
| Notification creation | Frontend only reads | Backend service layer must create these on relevant events |
| Default sort `-created_date` | Some calls omit sort param | Backend must apply `ORDER BY created_date DESC` as default |

---

## Summary

The 3 docs are high-quality and accurate overall, with 5 material inaccuracies:
1. InitDemo.jsx capability is overstated
2. Role enum inconsistency (`staff` vs `user`)
3. Real-time subscriptions claimed but absent from frontend
4. Analytics claimed but absent from frontend
5. ActivityLog/DailyMetric/Notification/SupportActionLog write paths are entirely missing — this is the single most dangerous gap in the migration
