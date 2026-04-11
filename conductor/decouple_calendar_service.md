# Plan: Decouple CalendarService dependencies

## Objective
Refactor the codebase to ensure that `BookingService` manages the synchronization logic with `CalendarService`, and `CalendarService` remains unaware of `BookingService` and `CancellationService`. This resolves the circular dependency and correctly aligns the responsibilities.

## Proposed Solution
1. **Remove Circular Imports**:
   - Remove `BookingService` and `CancellationService` dynamic imports from `src/services/calendar/service.ts`.

2. **Move Sync Logic**:
   - Move the `syncCalendarEvents` function from `CalendarService` to `BookingService` (rename to `syncWithGoogleCalendar` or similar).
   - In `BookingService`, the method will:
     - Fetch events from `CalendarService`.
     - Update busy slots in `CalendarService`.
     - Cross-reference with Turnos bookings and process any cancellations.

3. **Expose Core Calendar Methods**:
   - Create `getGoogleEvents(userId, timeMin, timeMax)` in `CalendarService` to just fetch raw event data from Google.
   - Create `updateBusySlots(userId, events)` in `CalendarService` to manage the `google_busy_slots` table based on the fetched events.

4. **Update Webhook**:
   - Update `src/app/api/webhooks/google-calendar/route.ts` to call `BookingService.syncWithGoogleCalendar` instead of `CalendarService.syncCalendarEvents`.

## Verification
- Ensure the circular dependency is removed by verifying no `BookingService` or `CancellationService` references exist in `CalendarService`.
- Run the full test suite (`npm run test` or similar) to ensure all tests pass.
- Manually trigger a calendar sync via the webhook or mock event to ensure synchronization works as expected.
