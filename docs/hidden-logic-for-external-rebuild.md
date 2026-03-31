# Hidden Logic for External Rebuild

For an engineer attempting to rebuild Distinction OS outside the Base44 platform, many critical functionalities appear deceptively simple or entirely absent from the exported code. These are often managed by Base44's backend-as-a-service (BaaS) and need explicit re-implementation.

---

## 1. Platform-Managed Auth/Session Behavior

**Invisible User Lifecycle:** The application's code does not contain any login, registration, or password recovery UI/logic. These are entirely handled by Base44. When `AuthContext` detects `authError.type === 'auth_required'`, it redirects to a Base44-hosted login page. The engineer would need to implement a full authentication service (e.g., OAuth provider, username/password system) from scratch.

**Session Management Abstraction:** Session creation, validation, token refresh, and invalidation are managed by Base44. The `base44.auth.isAuthenticated()` call simply queries the platform's session status. An external rebuild requires implementing secure session handling (e.g., JWTs, refresh tokens) and protecting all API endpoints.

**Redirect Handling:** After login/logout, Base44 handles redirects automatically. The application merely navigates to local routes post-authentication. An external system would need explicit redirect logic following successful authentication.

---

## 2. Automatic CRUD/Data Access Assumptions

**Invisible Database Layer:** The `base44.entities.EntityName` methods (`list`, `filter`, `create`, `update`, `delete`) directly interface with Base44's managed database. The application code never specifies database connection strings, ORM configurations, or SQL/NoSQL queries. An external rebuild mandates designing database schemas, creating migration scripts, and building a full API layer for all CRUD operations.

**Auto-Filled Entity Fields:** For every entity, `id`, `created_date`, `updated_date`, and `created_by` are automatically managed and populated by Base44 on creation and update. An external system must explicitly implement this logic (e.g., UUID generation, timestamping, extracting user info from auth token).

**Schema Enforcement:** The `.json` schema files are not just for documentation — Base44 uses them to enforce data types, required fields, and enum values at the database level. An external system would need to replicate this validation logic at the API layer.

---

## 3. Implicit Permission Checks (Row-Level Security — RLS)

**Multi-Tenancy RLS:** Almost every entity contains an `organizationId` field. This is the cornerstone of Base44's built-in multi-tenancy RLS. When `base44.entities` methods are called from an authenticated user context, Base44 automatically filters/scopes all data operations to only include records belonging to the user's `organizationId`. This is a critical security feature that an external rebuild would need to implement meticulously at the database or API gateway level for every entity.

**User Entity RLS Exceptions:** Base44 has special, built-in RLS for the `User` entity, allowing admins to manage other users in their organization while regular users can only access their own profile. This specific access control would need to be replicated.

**activeOrgId Management:** The `OrgContext` computes `activeOrgId` (either from the user's default organization or a `supportMode` override). All subsequent `base44.entities` calls implicitly use this `activeOrgId` for RLS, even if not explicitly passed as a filter in the code.

---

## 4. Hidden Backend Automations

**Invisible Event Triggers:** The concept of "automations" (scheduled, entity, connector) is purely a Base44 platform feature. The application code only contains backend function handlers. The triggers that invoke these functions (e.g., "on Lead create event," "every 5 minutes") are configured within Base44's dashboard, not written in the application's source code. An external rebuild requires a separate automation engine or event bus.

**ActivityLog Population:** The creation of `ActivityLog` entries for various events (e.g., lead update, task completion) is implicitly managed by entity automations configured on the Base44 platform — not by explicit `base44.entities.ActivityLog.create()` calls in the frontend or backend functions.

---

## 5. Default Queries/Filters/Sorts

**Implicit Sorting/Pagination:** When `base44.entities.list()` is called without explicit sort or limit parameters, Base44 applies platform-level defaults (e.g., by `created_date`, specific limits). An external engineer would need to define and enforce these defaults in their API.

**Performance Optimizations:** Base44 handles indexing and query optimization behind the scenes. While the application defines queries, the underlying performance is implicitly managed by the platform.

---

## 6. Generated Behavior Base44 Handles Behind the Scenes

**Real-time Subscriptions:** The `base44.entities.subscribe()` functionality relies on Base44's real-time WebSocket infrastructure. There is no explicit WebSocket client or server code in the application. An external rebuild requires building a dedicated WebSocket service.

**Secrets Management:** API keys for integrations (e.g., Stripe, OpenAI) are handled by Base44's secure secrets store and injected into backend functions as environment variables (`Deno.env.get("SECRET_KEY")`). The application code never directly stores or manages these secrets.

**Scalable Hosting:** Base44 manages the scalable hosting of both frontend (React) and backend (Deno functions). An external rebuild requires setting up and managing cloud infrastructure.

**File Storage:** The actual storage and serving of files uploaded via `Core.UploadFile` and `Core.UploadPrivateFile` is handled by Base44's object storage. An external solution requires configuring a cloud storage service and building endpoints for upload/download.

---

## 7. Misleading Self-Contained Aspects

**Billing (/Billing page):** The page displays billing data from `BillingPackage` entities. However, the critical logic for processing payments, managing subscriptions, or integrating with Stripe (webhooks, API calls) is entirely missing from the application's code. The frontend Billing page is a "UI only" component — Base44's backend was performing all the heavy lifting.

**External Calendar Sync:** The presence of `Appointment.externalCalendarId` and the `CalendarPage` UI suggests a working integration. However, the actual OAuth flow and synchronization of events with an external calendar service (e.g., Google Calendar) rely on Base44's App Connectors and dedicated backend functions, which are not visible in the core application code.

**AI/LLM Features:** While `Core.InvokeLLM` exists, the complete integration of AI (contextual prompting, prompt engineering, output parsing, dynamic AI agent behavior) heavily relies on Base44's underlying LLM orchestration, model management, and potentially AI agent runtime. The frontend code only initiates requests.

**OrgInitializer:** This component transparently assigns a `user.organizationId` if missing, by querying Base44 entities and updating the user via `base44.auth.updateMe()`. An external system would need an explicit onboarding or user provisioning flow for multi-tenancy.
