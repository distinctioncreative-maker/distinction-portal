# Complete Technical Handoff — Distinction OS

---

## 1. Product Overview

**Distinction OS** is a premium fintech CRM platform designed for agencies and consulting businesses (Distinction Creative LLC) to manage clients, sales pipelines, tasks, appointments, and financial metrics. It provides a centralized hub for operational visibility, automation, and business control.

### What This App Is For
- Managing leads and client relationships (CRM)
- Tracking sales pipelines and deal progression
- Organizing tasks and appointments related to clients and sales
- Monitoring key financial and business metrics (revenue, profit, leads, conversions)
- Providing an audit trail of user and system activities
- Supporting internal operations for support/admin staff

### Primary User Types
- **User/Staff:** Typical employees managing leads, tasks, appointments, and CRM features.
- **Admin:** Elevated privileges for organization-wide settings, user management, billing, and oversight.
- **Support:** Internal support staff who can enter "support mode" to view and assist client organizations.
- **Superadmin:** Platform-level global access role, distinct from the app's `admin` role.

### Main Workflows
1. Onboarding and organization setup (initial)
2. Creating, updating, and managing leads
3. Moving leads through a sales pipeline
4. Creating, assigning, and tracking tasks
5. Scheduling and managing appointments
6. Viewing dashboards for business metrics (financial, marketing, sales)
7. Reviewing activity logs and notifications
8. Managing organization settings and branding
9. Monitoring billing and subscription details
10. Internal support sessions for external client organizations

### Key Business Outcomes
- Improved operational clarity and real-time insights
- Enhanced efficiency in lead and client management
- Accelerated sales cycles and increased conversion rates
- Better accountability through detailed activity tracking
- Streamlined internal workflows for teams
- Data-driven decision making based on comprehensive analytics

---

## 2. Full Route / Page Map

| Route | Page | Purpose |
|---|---|---|
| `/` | N/A (Redirect) | Redirects to `/Dashboard` |
| `/InitDemo` | InitDemo | Initial data seeding / demo setup |
| `/Dashboard` | Dashboard | Central KPI hub, pipeline summary, tasks, activity feed |
| `/Leads` | Leads | Lead list with filtering and search |
| `/LeadDetail/:id` | LeadDetail | Detailed lead view, notes, tasks, appointments |
| `/Pipeline` | Pipeline | Kanban board for deal/pipeline management |
| `/Tasks` | Tasks | Task list with filtering and management |
| `/CalendarPage` | CalendarPage | Appointment scheduling and calendar view |
| `/Financials` | Financials | Revenue/profit metrics and charts |
| `/Metrics` | Metrics | Lead/call/conversion KPI dashboard |
| `/TaskDetail/:id` | TaskDetail | Detailed task view and editing |
| `/Activity` | Activity | Full organization activity log |
| `/Notifications` | Notifications | User-specific notification center |
| `/Profile` | Profile | User profile management |
| `/OrgSettings` | OrgSettings | Organization settings, feature flags, branding |
| `/Billing` | Billing | Billing package and subscription info |
| `/SupportConsole` | SupportConsole | Internal tool to manage client support sessions |
| `/SupportLogs` | SupportLogs | Log of support actions taken by internal staff |
| `/OrgManagement` | OrgManagement | Platform-level org and user management |
| `/WidgetPreferences` | WidgetPreferences | Dashboard widget customization |
| `*` | PageNotFound | 404 catch-all |

---

## 3. Data Model / Entities

### User *(Built-in Base44 entity)*
- **Purpose:** Represents authenticated users.
- **Fields:** `id`, `created_date`, `updated_date`, `full_name`, `email`, `role`, `organizationId`
- **Role enum:** `admin`, `user`, `superadmin`, `support`
- **Relationships:** `organizationId` → Organization
- **CRUD:** Created via platform invite only. Users read/update own profile; admins manage org users; support/superadmin manage all.

### ClientNote
- **Purpose:** Notes related to client interactions or leads.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `organizationId`, `leadId`, `userId`, `content`, `noteType`
- **noteType enum:** `general`, `call_log`, `email_note`, `meeting_notes`
- **Relationships:** `organizationId` → Organization, `leadId` → Lead, `userId` → User

### Organization
- **Purpose:** Defines a client organization/tenant.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `name`, `slug`, `businessType`, `status`, `timezone`, `logo`, `primaryColor`, `planType`, `isActive`
- **businessType enum:** `agency`, `consulting`, `coaching`, `saas`, `services`, `other`
- **status enum:** `active`, `inactive`, `suspended`, `trial`
- **planType enum:** `starter`, `growth`, `scale`, `enterprise`
- **Defaults:** `status: "trial"`, `timezone: "America/New_York"`, `primaryColor: "#D4A853"`, `planType: "starter"`, `isActive: true`

### Lead
- **Purpose:** Represents potential clients or sales opportunities.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `organizationId`, `firstName`, `lastName`, `fullName`, `email`, `phone`, `source`, `status`, `pipelineStageId`, `assignedToUserId`, `valueEstimate`, `notes`, `lastContactedAt`, `nextFollowUpAt`, `tags`
- **source enum:** `website`, `referral`, `social_media`, `cold_outreach`, `paid_ads`, `organic`, `partner`, `event`, `other`
- **status enum:** `new`, `contacted`, `qualified`, `proposal`, `negotiation`, `won`, `lost`, `archived`
- **Defaults:** `source: "website"`, `status: "new"`, `valueEstimate: 0`

### PipelineStage
- **Purpose:** Defines stages of a sales pipeline.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `organizationId`, `name`, `order`, `color`, `isDefault`
- **Defaults:** `order: 0`, `color: "#6366f1"`, `isDefault: false`

### PipelineItem
- **Purpose:** Represents a deal or opportunity in the pipeline.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `organizationId`, `leadId`, `stageId`, `title`, `value`, `probability`, `ownerUserId`, `nextAction`, `nextActionAt`, `status`
- **status enum:** `active`, `won`, `lost`, `stalled`
- **Defaults:** `value: 0`, `probability: 50`, `status: "active"`

### Task
- **Purpose:** Individual tasks to be completed.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `organizationId`, `title`, `description`, `assignedToUserId`, `relatedLeadId`, `priority`, `status`, `dueAt`, `createdByUserId`, `completedAt`
- **priority enum:** `low`, `medium`, `high`, `urgent`
- **status enum:** `todo`, `in_progress`, `completed`, `cancelled`
- **Defaults:** `priority: "medium"`, `status: "todo"`

### Appointment
- **Purpose:** Manages scheduled meetings, calls, or demos.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `organizationId`, `title`, `description`, `leadId`, `assignedToUserId`, `startAt`, `endAt`, `location`, `type`, `status`, `externalCalendarId`
- **type enum:** `call`, `meeting`, `demo`, `followup`, `onboarding`, `other`
- **status enum:** `scheduled`, `completed`, `cancelled`, `no_show`, `rescheduled`
- **Defaults:** `type: "call"`, `status: "scheduled"`
- **Rule:** `startAt` must be before `endAt`.

### DailyMetric
- **Purpose:** Daily aggregated business metrics for reporting.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `organizationId`, `date`, `revenueDaily`, `revenueMTD`, `revenueYTD`, `profitDaily`, `profitMTD`, `profitYTD`, `leadsDaily`, `leadsMTD`, `leadsYTD`, `bookedCallsDaily`, `bookedCallsMTD`, `bookedCallsYTD`, `websiteVisitorsDaily`, `conversionRateDaily`
- **CRUD:** System/automation only for Create/Update/Delete. All org users can Read.

### ActivityLog
- **Purpose:** Audit trail of user and system actions.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `organizationId`, `userId`, `entityType`, `entityId`, `action`, `description`, `metadata`
- **action enum:** `created`, `updated`, `deleted`, `status_changed`, `assigned`, `completed`, `login`, `logout`, `password_reset`, `settings_changed`, `support_entry`, `support_exit`, `support_edit`, `viewed`
- **CRUD:** System/automation creates; logs are immutable (no Update/Delete by users).

### SupportSession
- **Purpose:** Tracks internal support sessions accessing a client org.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `organizationId`, `supportUserId`, `enteredAt`, `exitedAt`, `accessReason`, `mode`, `status`, `notes`
- **mode enum:** `standard`, `elevated`, `break_glass`
- **status enum:** `active`, `ended`, `expired`

### SupportActionLog
- **Purpose:** Logs specific actions taken during a support session.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `supportSessionId`, `organizationId`, `supportUserId`, `actionType`, `entityType`, `entityId`, `description`, `metadata`
- **actionType enum:** `view`, `edit`, `create`, `delete`, `export`, `escalate`, `note`

### WidgetSetting
- **Purpose:** User-specific dashboard widget preferences.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `organizationId`, `userId`, `widgetKey`, `isVisible`, `position`, `size`, `configurationJson`
- **size enum:** `small`, `medium`, `large`
- **Defaults:** `isVisible: true`, `position: 0`, `size: "medium"`

### Notification
- **Purpose:** User-specific in-app notifications.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `organizationId`, `userId`, `type`, `title`, `message`, `status`, `priority`, `readAt`
- **type enum:** `info`, `success`, `warning`, `error`, `task`, `lead`, `appointment`, `system`
- **status enum:** `unread`, `read`, `archived`
- **priority enum:** `low`, `normal`, `high`, `urgent`
- **Defaults:** `status: "unread"`, `priority: "normal"`

### OrganizationSetting
- **Purpose:** Organization-level feature flags and branding.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `organizationId`, `chatbotEnabled`, `pipelineEnabled`, `calendarEnabled`, `crmEnabled`, `revenueTrackingEnabled`, `whatsappAssistantEnabled`, `aiInsightsEnabled`, `brandingSettingsJson`
- **Defaults:** All flags `false` except `pipelineEnabled`, `calendarEnabled`, `crmEnabled`, `revenueTrackingEnabled` which default to `true`.

### BillingPackage
- **Purpose:** Organization billing plan and subscription details.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `organizationId`, `packageName`, `billingType`, `setupFee`, `monthlyRecurringFee`, `premiumSupportFee`, `addOnsJson`, `billingNotes`, `packageNotes`, `billingStatus`, `subscriptionStatus`, `estimatedBackendCost`, `estimatedMonthlyClientValue`, `startDate`, `renewalDate`, `cancellationDate`, `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`
- **billingType enum:** `flat`, `hybrid`, `custom`, `revenue_linked`, `manual`
- **billingStatus enum:** `active`, `inactive`, `pending`, `past_due`, `cancelled`
- **subscriptionStatus enum:** `trial`, `active`, `paused`, `cancelled`

### IntegrationStatus
- **Purpose:** Tracks status and configuration of external integrations.
- **Fields:** `id`, `created_date`, `updated_date`, `created_by`, `organizationId`, `integrationType`, `status`, `configurationJson`, `lastSyncedAt`, `errorMessage`, `isEnabled`
- **integrationType enum:** `stripe`, `openclaw`, `whatsapp`, `website_chatbot`, `external_calendar`, `zapier`, `webhook`, `email_provider`, `sms_provider`, `analytics`
- **status enum:** `active`, `inactive`, `pending`, `error`, `not_configured`
- **Defaults:** `status: "not_configured"`, `isEnabled: false`

---

## 4. Authentication / User Model

### How Users Sign In
- Users are redirected to a Base44-managed login page (not implemented by the app itself).
- Upon successful authentication, Base44 provides user tokens/session information.
- `AuthContext` fetches current user details via `base44.auth.me()`.
- If `authError.type === 'auth_required'`, `navigateToLogin()` redirects to the Base44 login flow.

### Session Management
- Sessions are managed by Base44. `AuthContext` uses `base44.auth.isAuthenticated()` to check session status.
- `isLoadingAuth` is shown while the session is being verified.

### User Object Shape
```json
{
  "id": "string",
  "created_date": "datetime",
  "full_name": "string",
  "email": "string",
  "role": "user | admin | superadmin | support",
  "organizationId": "string"
}
```

### Role Breakdown
- **user:** Standard CRM access within their assigned organization.
- **admin:** Elevated org-level privileges. Can manage org settings, billing, pipeline stages, and invite/manage users.
- **support:** Internal Base44 role. Can access SupportConsole, SupportLogs, OrgManagement. Can enter support mode for any org.
- **superadmin:** Global admin. Full access across all features and all organizations.

### Permission Enforcement
- **Implicit RLS (Base44):** Automatically scopes all entity operations to the user's `organizationId`.
- **User entity RLS:** Admins can list/update/delete users in their org; regular users only access their own record.
- **Frontend guards:** Components like Sidebar conditionally render based on `userRole` and `isInternal` flags.
- **Route guards:** `App.jsx` checks `authError` via `AuthenticatedApp`. `OrgContext` ensures an org is loaded before rendering core content.

### Org/Tenant Membership Logic
- Every user has an `organizationId` associated with their `User` record.
- `OrgProvider` reads `user.organizationId`. If missing, it attempts to assign the user to the first available Organization and updates via `base44.auth.updateMe()`.
- `activeOrgId` (from `organization?.id` or `supportMode?.orgId`) ensures all data queries are scoped to the correct organization.

---

## 5. Business Logic / Workflows

### Lead Creation
- **Trigger:** "Create New Lead" on Leads page or Dashboard quick actions.
- **Entities:** Lead (create), ActivityLog (create: "created").
- **Rules:** `firstName` required; `organizationId` auto-set; `status` defaults to `"new"`.
- **Side Effects:** Appears in Leads list, dashboard summaries update, ActivityLog records creation.

### Lead Updates
- **Trigger:** User edits a lead on LeadDetail page.
- **Entities:** Lead (update), ClientNote (create), ActivityLog (create: "updated" or "status_changed").
- **Rules:** `firstName` cannot be empty. Status changes may trigger further automation.
- **Side Effects:** Lead data updated; may trigger PipelineItem update if `pipelineStageId` changes.

### Pipeline Movement
- **Trigger:** User drags a PipelineItem to a new PipelineStage.
- **Entities:** PipelineItem (update `stageId`), ActivityLog (create: "updated").
- **Side Effects:** Visual movement on Kanban board, ActivityLog entry, possible notification and DailyMetric update.

### Task Creation
- **Trigger:** "Create New Task" on Tasks page, Dashboard, or LeadDetail.
- **Entities:** Task (create), ActivityLog (create: "created").
- **Rules:** `title` required, `organizationId` auto-set, `status` defaults to `"todo"`.
- **Side Effects:** Task appears in list, assigned user notified.

### Task Update
- **Trigger:** User edits task status (e.g., marks complete).
- **Entities:** Task (update), ActivityLog (create: "updated" or "completed").
- **Rules:** Status change to `"completed"` sets `completedAt`.

### Appointment Creation
- **Trigger:** "Schedule Appointment" on CalendarPage, Dashboard, or LeadDetail.
- **Entities:** Appointment (create), ActivityLog (create: "created").
- **Rules:** `title`, `startAt` required; `startAt` must be before `endAt`; `status` defaults to `"scheduled"`.

### Organization Management
- **Trigger:** Admin accesses OrgSettings; Superadmin/Support accesses OrgManagement.
- **Entities:** Organization, OrganizationSetting (User, BillingPackage, IntegrationStatus for OrgManagement).
- **Rules:** Only admins can modify their org settings. Only superadmin/support can manage other organizations.

### Support Workflows
- **Trigger:** Internal support/superadmin user navigates to SupportConsole.
- **Entities:** SupportSession (create, update), SupportActionLog (create), Organization (read/update).
- **Rules:** `accessReason` required for SupportSession. Every significant action logged in SupportActionLog.
- **Side Effects:** Client org data accessible/modifiable; full audit trail created.

### Billing
- **Trigger:** Admin user accesses Billing page.
- **Entities:** BillingPackage (read).
- **Logic:** Backend automations (Stripe webhooks) update BillingPackage on subscription changes. Frontend is display-only.

### Notifications
- **Trigger:** Various system events (task assigned, lead status changed, support session entry).
- **Entities:** Notification (create).
- **Rules:** Created for relevant `userId` and `organizationId`; `status` is `"unread"`.
- **Side Effects:** Notification appears in user's list and dashboard counter.

### Onboarding (InitDemo)
- **Trigger:** New user logs in with no organization assigned.
- **Entities:** User (update `organizationId`), Organization (read), Lead/Task/PipelineStage (create demo data).
- **Logic:** `OrgInitializer` handles auto-assignment. `InitDemo` page pre-populates demo records.

---

## 6. Backend / Server Logic

All backend behavior is provided or abstracted by Base44's BaaS model.

| Concern | How It's Handled |
|---|---|
| CRUD | `base44.entities.EntityName.create/list/filter/update/delete()` — translated to DB ops by Base44 |
| Filters | `query` parameter with operators (`$gte`, `$lte`, `contains`, etc.) — executed at data layer |
| Sorting | Sort string passed to `.list()` — prefixed with `-` for descending |
| Mutations | `create`, `update`, `delete` — Base44 handles consistency, concurrency, schema validation |
| Hooks/Triggers | Base44 entity automations on `create`, `update`, `delete` events with `trigger_conditions` |
| Scheduled Jobs | Base44 scheduled automations (cron/interval) invoking backend functions |
| Real-time | `base44.entities.subscribe()` via managed WebSocket infrastructure |
| External API Calls | Performed inside Base44 backend functions (Deno) using `fetch` or NPM packages |
| Background Tasks | Serverless functions run asynchronously via Base44 automations |

**Implicitly managed by Base44:** Auth, session, RLS, database management, serverless hosting, integrations (API key/OAuth), file storage, analytics event tracking.

---

## 7. Integrations

| Integration | Purpose | Status | Notes |
|---|---|---|---|
| Base44 SDK | Core API for entities, auth, functions, analytics | ✅ Fully Implemented | Foundation for all app operations |
| Core.UploadFile | Public file uploads | ✅ Fully Implemented | Returns `file_url` |
| Core.UploadPrivateFile | Private file uploads | ✅ Fully Implemented | Returns `file_uri` |
| Core.CreateFileSignedUrl | Temporary access to private files | ✅ Fully Implemented | Inputs: `file_uri`, optional `expires_in` |
| Core.InvokeLLM | LLM access | ✅ API Ready | Inputs: `prompt`, `response_json_schema`, `file_urls`, `model`. UI usage is inferred. |
| Core.SendEmail | Transactional email | ✅ Fully Implemented | Used in backend automations |
| External Calendar | Google Calendar sync | ⚠️ Partial | Schema and UI ready; OAuth/sync logic not implemented |
| Stripe | Billing and subscriptions | ⚠️ Placeholder | Entity schema fully defined; payment processing not coded |
| WhatsApp | AI assistant via WhatsApp | 🖥️ UI Toggle Only | `whatsappAssistantEnabled` flag exists; backend not implemented |
| Analytics (Base44) | Event tracking | ✅ Fully Implemented | `base44.analytics.track()` |
| OpenClaw | Multi-channel communication framework | 🔲 Conceptual | Relies on backend functions and other integrations |

---

## 8. AI / LLM Features

### AI Insights
- **Enablement:** `OrganizationSetting.aiInsightsEnabled` flag.
- **Integration:** `Integrations.Core.InvokeLLM`
- **Inputs:** `prompt` (with dynamic context data), optional `add_context_from_internet`, `response_json_schema`, `file_urls`
- **Output:** JSON object or string depending on `response_json_schema`
- **Guard:** Restricted by `aiInsightsEnabled` flag and Base44 integration credits.

### WhatsApp Assistant
- **Enablement:** `OrganizationSetting.whatsappAssistantEnabled` flag.
- **Flow:** WhatsApp message received → InvokeLLM processes → response sent back via WhatsApp.
- **Guard:** Requires configured WhatsApp Business API + `whatsappAssistantEnabled`.

### AI Agents (e.g., task_manager.json)
- **Flow:** User sends natural language → Base44 agent runtime orchestrates LLM calls and tool use (entity CRUD).
- **Integration:** `base44.agents` SDK.
- **Output:** Natural language response + tool_calls showing actions taken.

---

## 9. File Storage / Uploads

- **What can be uploaded:** Any file type (images, documents, PDFs).
- **Public files:** `Core.UploadFile` → returns `file_url` (direct public URL stored in entity fields, e.g., `Organization.logo`).
- **Private files:** `Core.UploadPrivateFile` → returns `file_uri`. Access requires generating a signed URL via `Core.CreateFileSignedUrl`.
- **Metadata:** Base44 stores standard metadata (size, type) automatically. Application saves `file_url` or `file_uri` into entity fields.
- **Permissions:** Public files accessible to anyone with the URL. Private files require authenticated signed URL generation. Entity-level RLS governs access to the URL field itself.

---

## 10. Billing / Payments

- **What's real:** `BillingPackage` entity fully defined. Billing page displays stored data.
- **What's placeholder:** Payment processing, subscription management, Stripe webhook logic — none implemented in app code.
- **Stripe fields:** `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId` indicate intended Stripe integration via backend functions and webhooks.
- **Subscription lifecycle:** `subscriptionStatus` enum supports `trial`, `active`, `paused`, `cancelled`.
- **Missing:** "Pay Now" / "Upgrade" buttons, automated invoice generation, Stripe webhook handlers updating `BillingPackage`.

---

## 11. Role-Based Access Control

| Role | Can See | Can Edit |
|---|---|---|
| **user** | All data within their `organizationId` (leads, tasks, appointments, metrics, notifications, profile, org settings read-only, billing read-only) | Own profile, entities they own or are assigned to, create Lead/ClientNote/PipelineItem |
| **admin** | Same as user + all User records in org, BillingPackage, IntegrationStatus | All user capabilities + Organization, OrganizationSetting, PipelineStage, User roles within org, delete most org entities |
| **support** | All data across all orgs in support mode, SupportConsole, SupportLogs, OrgManagement | All data in any org entered via support mode, create/update SupportSession, full CRUD via OrgManagement |
| **superadmin** | Everything globally | Full CRUD across all entities and organizations |

**Restricted pages:**
- `OrgSettings`, `Billing`: Admin + isInternal only (edit).
- `SupportConsole`, `SupportLogs`, `OrgManagement`: isInternal only (`support`, `superadmin`).

**Tenant boundaries:** Enforced via `organizationId` on all entities + Base44 RLS. `OrgContext` sets `activeOrgId` to scope all SDK calls correctly.

---

## 12. UI State / Conditional Logic

- **Redirects:** `/` → `/Dashboard`. `auth_required` → Base44 login. `user_not_registered` → `UserNotRegisteredError` component.
- **Empty states:** Components include conditional rendering for no-data scenarios (e.g., "All Clear", "No leads found").
- **Conditional rendering by role:** Sidebar navigation rendered based on `userRole` and `isInternal`. Pages like OrgSettings, Billing, SupportConsole have internal role checks.
- **Feature flags:** `OrganizationSetting` boolean flags control UI element visibility dynamically per organization.
- **Loading flows:** Global spinner while `isLoadingAuth` or `isLoadingPublicSettings`. Individual pages use TanStack Query loading states.
- **Onboarding:** `OrgInitializer` (inside `OrgContext`) auto-assigns org if `user.organizationId` is null.
- **Hidden dependencies:** `OrgContext` and `AuthContext` are global dependencies for all data-driven components. `LeadDetail` aggregates from Lead, Task, Appointment, ClientNote, ActivityLog.

---

## 13. Environment / Config

| Variable | Source | Purpose |
|---|---|---|
| `BASE44_APP_ID` | Auto-populated by Base44 | Identifies the current application |
| `OPENAI_API_KEY` | Base44 secrets dashboard | LLM access via InvokeLLM |
| `STRIPE_API_KEY` | Base44 secrets dashboard | Stripe billing integration |
| `STRIPE_WEBHOOK_SECRET` | Base44 secrets dashboard | Verify Stripe webhook payloads |
| Other integration API keys | Base44 secrets dashboard | WhatsApp, external calendar, etc. |

**Platform-level config (Base44 dashboard):**
- Public Settings → app-wide public-facing settings
- Secrets → secure credential storage (never in codebase)
- Automations → scheduled, entity, and connector automation configuration
- App Connectors → OAuth connections to external services
- Database Schema → defined by `entities/*.json` files
- Function Endpoints → defined by `functions/` directory

---

## 14. Real vs. Scaffolded Features

### ✅ Fully Working
- User authentication and authorization (via Base44)
- Multi-tenancy based on `organizationId`
- Dashboard display of aggregated DailyMetric data
- CRUD for Lead, Task, Appointment, PipelineItem, ClientNote
- Navigation and routing
- User profile management
- Organization settings (feature toggles, branding)
- Support session tracking and logging
- Real-time entity subscriptions
- File upload capabilities
- In-app notification system
- Basic analytics tracking

### ⚠️ Partially Working
- **Billing:** UI for BillingPackage exists; payment processing and Stripe webhooks not coded.
- **AI/LLM Features:** `InvokeLLM` functional; complex AI workflows, interactive assistants, dynamic content generation are nascent/inferred.
- **External Calendar:** Schema and UI present; OAuth flow and sync logic not implemented.
- **OpenClaw / External Comms:** Backend-driven concept; frontend only has IntegrationStatus toggle.

### 🔲 UI-Only Placeholders
- Some dashboard cards show simplified or mock data.
- QuickActionsEnhanced preview cards use basic/static lists.
- Billing page is display-only with no live Stripe data.

### 🪄 Dependent on Base44 Platform Magic
- Authentication & User Management (entire login/signup/session flow)
- Database CRUD (`base44.entities` SDK)
- Backend Functions & Automations (serverless execution, scheduling, event triggering)
- File Storage (actual bytes stored/retrieved)
- Real-time Subscriptions (WebSocket infrastructure)
- All core integrations (InvokeLLM, SendEmail, UploadFile, App Connectors)

---

## 15. Rebuild Guidance

### Essential Backend Services to Build
- **Database:** Multi-tenant DB (e.g., PostgreSQL with RLS or MongoDB). Implement all schemas from `entities/*.json`.
- **Auth Service:** Registration, login (email/password + OAuth), session management, JWT/refresh tokens, role management.
- **API Gateway:** REST or GraphQL endpoint exposing all CRUD operations and custom logic.
- **File Storage:** Cloud object storage (e.g., AWS S3) with public URL and signed URL mechanisms.
- **Serverless Compute:** For custom backend logic and external API calls (e.g., AWS Lambda).
- **Scheduler:** Cron/interval job service for recurring automations.
- **Real-time Service:** WebSocket server for live dashboard data and notifications.
- **Email Service:** Transactional email provider (e.g., SendGrid, Mailgun).
- **Analytics Service:** Event tracking infrastructure.

### Required Entities/Tables
All 17 entities defined in Section 3, each requiring:
- `id` (primary key / UUID)
- `created_date`, `updated_date` (auto-managed timestamps)
- `created_by` (user ID/email from auth token)
- `organizationId` (foreign key / partition key for multi-tenancy)

### Auth/Role System
- Implement full login/signup/session flow.
- Define `user`, `admin`, `support`, `superadmin` roles.
- Implement RLS at the database level — **critical for data isolation**.
- Implement API endpoint authorization per role.
- Implement explicit permission checks for internal roles (`support`, `superadmin`) for global data access and "support mode."

### Integrations to Rebuild
- **LLM:** API client for chosen provider (OpenAI, Anthropic) with API key management.
- **Stripe:** Backend webhook handlers for subscription events; frontend Stripe Checkout/Portal redirect.
- **Email:** API client for email provider.
- **External Calendar:** OAuth 2.0 flow + Google Calendar API client.
- **WhatsApp:** WhatsApp Business API integration.
- All secrets managed via environment variables or a secrets manager.

### Automations to Recreate
- Entity automations → database triggers or event-driven serverless functions (e.g., trigger Lambda on Lead create).
- Scheduled automations → cron jobs or a dedicated scheduler service.
- Connector automations → webhook handlers and custom integration logic.

### Highest-Risk Areas
1. **RLS Implementation** — correctly enforcing multi-tenant data isolation is paramount.
2. **Authentication & Authorization** — complex and critical to get right.
3. **Scalability** — backend services and DB must handle many orgs and users.
4. **Real-time Features** — rebuilding efficient WebSocket-based data push.
5. **Automations Logic** — re-implementing all implicit Base44 entity/scheduled automation behavior.

### Non-Obvious Missing Pieces
- Full backend API endpoint definitions (Base44 abstracts all REST/GraphQL).
- Detailed business logic for lead status changes, metric aggregation, and support mode actions.
- Security hardening: rate limiting, input validation, DDoS protection, secure credential storage.
- Monitoring and logging infrastructure for backend services.
- CI/CD pipelines for frontend and backend.
- Admin dashboard for platform-level management (currently handled by SupportConsole / OrgManagement pages).
- Error handling and retry logic for all external API calls.
- `DailyMetric` aggregation logic (MTD, YTD calculation and population).
