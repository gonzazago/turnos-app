# Overview
This track focuses on refactoring the codebase to encapsulate database logic into domain-specific services (`BookingService`, `CalendarService`, etc.). Currently, Supabase queries are scattered across route handlers (e.g., cron jobs, webhooks, server actions). Centralizing this logic will improve code reusability, maintainability, and separation of concerns.

# Functional Requirements
- **Service Encapsulation:**
    - Move all direct Supabase queries related to bookings out of route handlers and into `BookingService`.
    - Move all direct Supabase queries related to Google Calendar tokens and webhooks into `CalendarService` (or `GoogleCalendarService`).
- **Supabase Client Handling:**
    - Service methods will internally instantiate the appropriate Supabase client (`createClient()` for authenticated user context, or `getSupabaseAdmin()` for elevated privileges like cron jobs and webhooks) based on the operation's requirements.
- **Domain Services:**
    - Use domain-specific services only. Avoid introducing a generic `BaseRepository` pattern.
- **Specific Targets Identified:**
    - `api/cron/reminders/route.ts`: Move the `bookings` query with `profiles!inner` join to `BookingService`.
    - `api/webhooks/google-calendar/route.ts`: Move the `google_calendar_tokens` query to `CalendarService`.
    - Review other route handlers and server actions (`src/app/api/...`, `src/app/.../actions.ts`) to identify and extract remaining scattered database queries.

# Acceptance Criteria
- [ ] `api/cron/reminders/route.ts` uses `BookingService` for data fetching instead of direct Supabase queries.
- [ ] `api/webhooks/google-calendar/route.ts` uses `CalendarService` for token retrieval instead of direct Supabase queries.
- [ ] Relevant route handlers and server actions have been audited and their database logic relocated to the appropriate domain service.
- [ ] All existing tests continue to pass after the refactoring.
- [ ] The refactored services correctly handle the instantiation of the appropriate Supabase client internally.

# Out of Scope
- Adding new features or altering existing business logic.
- Migrating to a generic repository pattern.