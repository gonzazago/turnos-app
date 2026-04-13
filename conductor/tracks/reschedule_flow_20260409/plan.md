# Implementation Progress: Booking Rescheduling

- [x] Database: Added `reschedule_limit_hours` to `profiles` table.
- [x] Backend Services:
    - [x] `GoogleCalendarService.updateEvent` for API patching.
    - [x] `CalendarService.updateBookingEvent` for service-level orchestration.
    - [x] `BookingService.reschedule` enhanced with policy checks and Google sync.
    - [x] `BookingService.getActiveBookingByEmail` to detect existing bookings.
- [x] Booking Flow:
    - [x] Collision detection in `createBooking` action.
    - [x] Modal in `BookingClient.tsx` to offer rescheduling on collision.
    - [x] `rescheduleClientBooking` action for client-initiated updates.
- [x] Cancellation Flow:
    - [x] "Cambiar Fecha/Hora" button added to `CancellationClient.tsx` (conditionally based on policy).
- [x] Dashboard:
    - [x] Settings page now includes `reschedule_limit_hours` configuration.
- [x] Tests:
    - [x] Verified `BookingService.reschedule` logic with unit tests.
