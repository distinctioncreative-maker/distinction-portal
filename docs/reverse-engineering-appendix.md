# Reverse-Engineering Appendix

## 1. Entity CRUD Matrix

| Entity | Create | Read | Update | Delete | Search/Filter | Summarize |
|---|---|---|---|---|---|---|
| **User** | OrgManagement (invite), Base44 Auth (registration) | AuthContext, OrgContext, LeadDetail, TaskDetail, OrgManagement (list) | Profile (self), OrgManagement (role/orgId), OrgContext (auto-assign organizationId) | OrgManagement | OrgManagement (list/search users) | N/A |
| **Organization** | OrgManagement | OrgContext, OrgSettings, SupportConsole, OrgManagement | OrgSettings, OrgManagement | OrgManagement | OrgManagement (list/search orgs), SupportConsole (list/search orgs) | Dashboard (current org context) |
| **Lead** | Leads, Dashboard (quick action), InitDemo | Leads, LeadDetail, Dashboard, Pipeline (via PipelineItem) | LeadDetail, Leads (status quick-edit), Pipeline (via PipelineItem status change), Archive (update status) | LeadDetail (archive status), Leads (archive status) | Leads (filters by source/status/assignedTo) | Dashboard (count), Metrics (count) |
| **ClientNote** | LeadDetail | LeadDetail | LeadDetail | LeadDetail | N/A | N/A |
| **PipelineStage** | Pipeline (StageManager) | Pipeline, LeadDetail (for lead status update) | Pipeline (StageManager - name, order, color) | Pipeline (StageManager) | N/A | Pipeline (values per stage), Dashboard (count) |
| **PipelineItem** | Pipeline | Pipeline, Dashboard | Pipeline (drag-drop stage, details), Dashboard (quick update status) | Pipeline (mark as "lost" status) | N/A | Dashboard (summary by stage), Pipeline (aggregate values) |
| **Task** | Tasks, Dashboard (quick action), LeadDetail, InitDemo | Tasks, TaskDetail, Dashboard, LeadDetail | Tasks (quick status change), TaskDetail, Dashboard (quick status change) | Tasks, TaskDetail | Tasks (filters by status/priority/assignedTo), Dashboard (due tasks) | Dashboard (count of pending tasks) |
| **Appointment** | CalendarPage, Dashboard (quick action), LeadDetail, InitDemo | CalendarPage, LeadDetail | CalendarPage, LeadDetail | CalendarPage, LeadDetail | CalendarPage (by date range) | N/A |
| **DailyMetric** | System/Automation (implicitly) | Dashboard, Financials, Metrics | System/Automation (implicitly) | System/Automation (implicitly) | Financials, Metrics (by date range) | Dashboard (all KPIs), Financials (YTD, MTD), Metrics (YTD, MTD) |
| **ActivityLog** | System/Automation (implicitly) | Activity, Dashboard, LeadDetail | N/A | System/Automation (implicitly) | Activity (filters by entityType/action), Dashboard (recent activity) | N/A |
| **SupportSession** | SupportConsole | OrgContext, SupportConsole, SupportLogs | OrgContext (on exit), SupportConsole | SupportConsole | N/A | N/A |
| **SupportActionLog** | System/Automation (implicitly, via support actions) | SupportLogs | N/A | N/A | N/A | N/A |
| **WidgetSetting** | WidgetPreferences, Dashboard (implicitly, if user customizes) | WidgetPreferences, Dashboard | WidgetPreferences | WidgetPreferences | N/A | N/A |
| **Notification** | System/Automation (implicitly) | Notifications, Dashboard (counter) | Notifications (mark read/archive) | Notifications (archive status) | Notifications (filters by status/type) | Dashboard (unread count) |
| **OrgSetting** | OrgSettings (implicitly on org create) | OrgSettings, OrgContext, Dashboard (feature flags for quick actions) | OrgSettings | OrgSettings | N/A | N/A |
| **BillingPackage** | System/Automation (implicitly) | Billing | System/Automation (implicitly, via Stripe webhooks/admin changes) | N/A | N/A | N/A |
| **IntegrationStatus** | System/Automation (implicitly) | OrgSettings (inferred) | OrgSettings (toggle isEnabled), System/Automation (on integration setup/error) | N/A | N/A | N/A |

---

## 2. Page-to-Entity Map

### App.jsx (Routes/Root)
- **User:** Reads AuthContext user for authentication status and roles.
- **Organization:** Reads OrgContext organization to ensure tenant is loaded.

### InitDemo (/InitDemo)
- **Organization:** Reads (to check if org exists), Writes (creates initial org).
- **Lead:** Writes (creates demo leads).
- **Task:** Writes (creates demo tasks).
- **PipelineStage:** Writes (creates demo stages).
- **DailyMetric:** Writes (creates demo metrics).

### Dashboard (/Dashboard)
- **User:** Reads (current user, organizationId).
- **Organization:** Reads (current organization context).
- **DailyMetric:** Reads (for all KPIs: revenue, leads, calls, conversion).
- **Task:** Reads (for TasksDueWidget).
- **PipelineItem:** Reads (for PipelineSummary).
- **ActivityLog:** Reads (for RecentActivity).
- **Notification:** Reads (for unread count).
- **OrgSetting:** Reads (for feature flags, e.g., AI insights enable).
- **WidgetSetting:** Reads, Writes (user preferences for widget visibility/position/size).
- **Lead:** Writes (via quick actions).
- **Appointment:** Writes (via quick actions).

### Leads (/Leads)
- **User:** Reads (for assignedTo filter, current user role).
- **Organization:** Reads (current organization context).
- **Lead:** Reads (list of leads), Writes (create new lead, update existing).
- **PipelineStage:** Reads (for filtering leads by stage).

### LeadDetail (/LeadDetail/:id)
- **User:** Reads (for assignedToUserId, createdByUserId, ClientNote.userId).
- **Organization:** Reads (current organization context).
- **Lead:** Reads (specific lead by ID), Writes (update lead details, status, notes).
- **ClientNote:** Reads (feed of notes), Writes (create new notes), Deletes (delete notes).
- **Task:** Reads (related tasks), Writes (create/update related tasks), Deletes (delete related tasks).
- **Appointment:** Reads (related appointments), Writes (create/update related appointments), Deletes (delete related appointments).
- **ActivityLog:** Reads (related activity).
- **PipelineStage:** Reads (for displaying lead's pipeline stage).

### Pipeline (/Pipeline)
- **User:** Reads (for ownerUserId filter, current user role).
- **Organization:** Reads (current organization context).
- **PipelineStage:** Reads (list of stages), Writes (create, update, delete, reorder).
- **PipelineItem:** Reads (list of items per stage), Writes (create, update, move stage).
- **Lead:** Reads (to display associated lead info for PipelineItem).

### Tasks (/Tasks)
- **User:** Reads (for assignedToUserId filter, current user role).
- **Organization:** Reads (current organization context).
- **Task:** Reads (list of tasks), Writes (create, update, delete).
- **Lead:** Reads (to show relatedLeadId context).

### CalendarPage (/CalendarPage / /Calendar)
- **User:** Reads (for assignedToUserId filter).
- **Organization:** Reads (current organization context).
- **Appointment:** Reads (list of appointments for date range), Writes (create, update, delete).
- **Lead:** Reads (to show leadId context for appointments).
- **OrgSetting:** Reads (calendarEnabled feature flag).

### Financials (/Financials)
- **User:** Reads (current user, organizationId).
- **Organization:** Reads (current organization context).
- **DailyMetric:** Reads (for revenue, profit data).
- **OrgSetting:** Reads (revenueTrackingEnabled feature flag).

### Metrics (/Metrics)
- **User:** Reads (current user, organizationId).
- **Organization:** Reads (current organization context).
- **DailyMetric:** Reads (for leads, booked calls, conversion rate data).

### TaskDetail (/TaskDetail/:id)
- **User:** Reads (for assignedToUserId, createdByUserId).
- **Organization:** Reads (current organization context).
- **Task:** Reads (specific task by ID), Writes (update task details, status, priority).
- **Lead:** Reads (to show relatedLeadId context).

### Activity (/Activity)
- **User:** Reads (current user, organizationId).
- **Organization:** Reads (current organization context).
- **ActivityLog:** Reads (list of activities).

### Notifications (/Notifications)
- **User:** Reads (current user ID).
- **Organization:** Reads (current organization context).
- **Notification:** Reads (list for user), Writes (mark as read/archive).

### Profile (/Profile)
- **User:** Reads (current user data), Writes (updates self data via `base44.auth.updateMe`).

### OrgSettings (/OrgSettings)
- **User:** Reads (current user role for access check).
- **Organization:** Reads (current organization data), Writes (update name, logo, color, etc.).
- **OrganizationSetting:** Reads (feature flags), Writes (update feature flags, branding JSON).

### Billing (/Billing)
- **User:** Reads (current user role for access check).
- **Organization:** Reads (current organization context).
- **BillingPackage:** Reads (display billing details).

### SupportConsole (/SupportConsole)
- **User:** Reads (current user role for access check).
- **Organization:** Reads (list of all organizations).
- **SupportSession:** Reads (list active sessions), Writes (create/update sessions).

### SupportLogs (/SupportLogs)
- **User:** Reads (current user role for access check).
- **Organization:** Reads (current organization context, via supportSessionId for logs).
- **SupportActionLog:** Reads (list of actions).
- **SupportSession:** Reads (to get session context).

### OrgManagement (/OrgManagement)
- **User:** Reads (current user role for access check, list users), Writes (invite user, update user roles).
- **Organization:** Reads (list of all organizations), Writes (create, update, delete).

### WidgetPreferences (/WidgetPreferences)
- **User:** Reads (current user ID).
- **Organization:** Reads (current organization context).
- **WidgetSetting:** Reads (list of widget settings), Writes (create, update, delete).

### PageNotFound (*)
- None.

---

## 3. Role/Permission Matrix

| Role | Dashboard | Leads | LeadDetail | Pipeline | Tasks | Calendar | Financials | Metrics | Activity | Notifications | Profile | OrgSettings | Billing | SupportConsole | SupportLogs | OrgManagement | Entity-Level Write/Delete |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **user** | R | R/C/U/D | R/C/U | R/U | R/C/U/D | R/C/U/D | R | R | R | R/U | R/U | R (view) | R (view) | — | — | — | Limited C/U/D on self-owned/assigned (Task, Appt) |
| **admin** | R | R/C/U/D | R/C/U/D | R/C/U/D | R/C/U/D | R/C/U/D | R | R | R | R/U | R/U | R/U/D | R (view) | — | — | — | Full C/U/D within org, User.role to user/admin |
| **support** | R | R/C/U/D | R/C/U/D | R/C/U/D | R/C/U/D | R/C/U/D | R | R | R | R/U | R/U | R/U/D | R (view) | R/C/U/D | R | R/C/U/D | Full C/U/D on any org in support mode |
| **superadmin** | R | R/C/U | R/C/U/D | R/C/U/D | R/C/U/D | R/C/U/D | R | R | R | R/U | R/U | R/U/D | R (view) | R/C/U/D | R | R/C/U/D | Full C/U/D on all entities across all orgs |

**Legend:** R = Read, C = Create, U = Update, D = Delete, — = No access

---

## 4. Integration Implementation Status

| Integration | Status | Description |
|---|---|---|
| Base44 SDK (Core) | ✅ Fully Implemented | Fundamental for all app operations (entities, auth, functions, analytics). Provided by Base44. |
| Core.UploadFile | ✅ Fully Implemented | Base44 integration for public file uploads. |
| Core.UploadPrivateFile | ✅ Fully Implemented | Base44 integration for private file uploads. |
| Core.CreateFileSignedUrl | ✅ Fully Implemented | Generates temporary access URLs for private files. |
| Core.InvokeLLM | ✅ Fully Implemented | API callable; specific AI features are mostly conceptual in the UI. |
| Core.SendEmail | ✅ Fully Implemented | Used in backend functions for notifications/reminders. |
| External Calendar Sync | ⚠️ Partial | Schema and UI ready; actual sync logic via App Connectors needs backend functions. |
| Stripe Billing | ⚠️ Partial/Placeholder | Entity schema exists with Stripe fields. Billing UI is static. Payment processing not coded. |
| WhatsApp Assistant | 🖥️ UI Only | Toggle exists in OrganizationSetting. Integration and AI agent logic are conceptual. |
| Analytics (Base44) | ✅ Fully Implemented | Event tracking via `base44.analytics.track()`. |
| OpenClaw | 🔲 Placeholder | Referenced as a communication framework. Implementation relies on other integrations and backend functions. |

---

## 5. Base44 Dependency Hotspots

These areas represent the most significant dependencies on Base44's platform and would require substantial effort to rebuild outside the ecosystem.

### 1. Authentication & Authorization (User Management and RLS)
**Why Hard:** Base44 provides a complete, managed authentication system (user registration, login, session management). It natively enforces Row-Level Security (RLS) based on `organizationId` for almost all entities. Rebuilding requires not only setting up an auth service but meticulously implementing RLS in a relational database or a custom access control layer. Complex to get right for both security and performance.

### 2. Database & Entity Management
**Why Hard:** Base44's `base44.entities` SDK abstracts away all database interactions. It provides a flexible, schema-driven database (`entities/*.json`) that handles storage, indexing, and validation. Migrating requires designing a complete database schema from scratch (SQL or NoSQL), writing all CRUD APIs, and implementing validation logic.

### 3. Serverless Functions & Automations
**Why Hard:** Base44 provides a fully managed serverless environment (Deno Deploy) for backend functions, including built-in scheduling, entity-event triggers, and connector webhooks. Rebuilding involves setting up a serverless platform (AWS Lambda, Google Cloud Functions), configuring event sources, managing deployments, and orchestrating function calls.

### 4. Integrations Framework (e.g., InvokeLLM, App Connectors)
**Why Hard:** Base44 provides pre-built, managed integrations like InvokeLLM and a framework for OAuth App Connectors (e.g., Google Calendar). Rebuilding means directly integrating with external APIs — managing API keys, OAuth flows, rate limits, error handling — and maintaining those integrations independently.

### 5. Real-time Subscriptions
**Why Hard:** Base44 offers real-time entity change subscriptions (`base44.entities.subscribe()`) via WebSockets. Recreating this means building and maintaining a WebSocket server, integrating it with the database, and implementing client-side logic for real-time updates. Adds significant architectural complexity.

### 6. File Storage
**Why Hard:** Base44 provides managed, secure object storage for files (`UploadFile`, `UploadPrivateFile`, `CreateFileSignedUrl`). Rebuilding involves setting up cloud object storage (e.g., S3), implementing secure upload APIs, and generating signed URLs for private access.
