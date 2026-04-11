# Rollback Log — distinction-portal

All destructive or irreversible operations are logged here in chronological order with exact rollback instructions.

---

## Session: 2026-04-10

### CHECKPOINT: e5b3cb4 (before this session's work)
State: Phase 4c + 4d complete and pushed. Pipeline, activity logs live.

**To revert to this checkpoint:**
```bash
git revert --no-commit e5b3cb4..HEAD
git commit -m "revert: rollback to phase 4c+4d checkpoint"
git push origin main
```
Or hard reset (destructive — loses all commits after e5b3cb4):
```bash
git reset --hard e5b3cb4
git push --force origin main
```

---

## Operations Log

_Each entry added as work is done._

---

### [2026-04-10] Phase 4e + 4f: Appointments + ClientNotes

**Commit:** (see git log)
**Files added:**
- `src/api/appointments.js` — Supabase CRUD wrapper for appointments table
- `src/api/clientNotes.js` — Supabase CRUD wrapper for client_notes table
- `supabase/migrations/20260410000001_create_appointments.sql`
- `supabase/migrations/20260410000002_create_client_notes.sql`

**Files modified:**
- `src/pages/CalendarPage.jsx` — replaced all base44.entities.Appointment.* calls with appointmentsApi.*; added logActivity to create/update/cancel
- `src/components/lead/ClientNoteFeed.jsx` — replaced all base44.entities.ClientNote.* calls with clientNotesApi.*
- `src/pages/LeadDetail.jsx` — wired appointments tab to appointmentsApi.listForLead

**Supabase tables created (IRREVERSIBLE without migration):**
- `appointments` with RLS policy on organization_id
- `client_notes` with RLS policy on organization_id

**To roll back this commit:**
```bash
git revert HEAD
git push origin main
```
**To also drop the Supabase tables (destructive — loses all data):**
```sql
drop table if exists appointments;
drop table if exists client_notes;
```
Run via Supabase SQL editor if needed.

