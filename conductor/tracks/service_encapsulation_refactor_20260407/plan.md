# Implementation Plan: Service Encapsulation Refactor

### Phase 1: Audit and Target Identification [checkpoint: 6adf1f2]
- [x] Task: Review Codebase for Direct Queries
    - [x] Identify all direct Supabase queries in `src/app/api/...` route handlers.
    - [x] Identify all direct Supabase queries in `src/app/.../actions.ts` server actions.
    - [x] Identify all direct Supabase queries in `src/app/.../page.tsx` server components.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Audit and Target Identification' (Protocol in workflow.md) (6adf1f2)

### Phase 2: Refactoring Booking Logic
- [x] Task: Refactor Cron Reminders (4854839)
    - [x] Move the `bookings` query with `profiles!inner` join from `src/app/api/cron/reminders/route.ts` to a new method in `BookingService` (e.g., `getUpcomingBookingsForReminders()`).
- [x] Task: Refactor Cross-Service Booking Queries (83f251c)
    - [x] Move `bookings` queries from `CalendarService` (and others if applicable) to dedicated methods in `BookingService` (e.g., `getConfirmedBookingsWithGoogleId(userId)`).
- [x] Task: Refactor Internal Booking Service Methods (ff1d425)
    - [x] Extract inline database queries within `BookingService` (and `CancellationService`) into dedicated, reusable repository-style methods to centralize Supabase client interactions.
- [x] Task: Refactor other Booking queries (969e2b5)
    - [x] Update any identified `bookings` queries in route handlers, server actions, and server components to use `BookingService` repository-style methods.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Refactoring Booking Logic' (Protocol in workflow.md)

### Phase 3: Refactoring Calendar Logic
- [ ] Task: Refactor Webhook Handlers
    - [ ] Move the `google_calendar_tokens` query from `src/app/api/webhooks/google-calendar/route.ts` to a new method in `CalendarService` (e.g., `getUserIdByWebhookId()`).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Refactoring Calendar Logic' (Protocol in workflow.md)

### Phase 4: Refactoring Other Domains (Optional/As Discovered)
- [ ] Task: Refactor Profiles/Event Types Logic
    - [ ] If significant scattered logic is found for `profiles` or `event_types`, move them to a `ProfileService` or `EventTypeService`.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Refactoring Other Domains' (Protocol in workflow.md)

### Phase 5: Final Review and Testing
- [ ] Task: Run Test Suite
    - [ ] Ensure all existing unit and integration tests continue to pass after the refactoring.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Final Review and Testing' (Protocol in workflow.md)