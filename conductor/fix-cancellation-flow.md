# Plan: Fix Cancellation Flow & Dashboard Status

## Objective
1. Ensure the Dashboard UI displays the correct badge ("Cancelado", "Confirmado", etc.) and doesn't display "Pendiente de pago" inappropriately.
2. Fix the Google Calendar synchronization issue where cancelled bookings are not removed from the Calendar.

## Proposed Solution
### 1. Dashboard UI Fix
- **File:** `src/app/dashboard/components/BookingList.tsx`
- **Changes:** Refactor the `StatusBadge` logic in `BookingCard`. Update it to explicitly handle the different states:
  - If `booking.status === 'cancelled'`, render an `error` badge with "Cancelado".
  - If `booking.status === 'confirmed'`, render a `success` badge with "Confirmado".
  - If `booking.status === 'pending'` and `booking.payment_status === 'pending'`, render a `warning` badge with "Pendiente Pago".
  - If `booking.status === 'pending_payment'`, render a `warning` badge with "Pendiente Pago".

### 2. Google Calendar Deletion Fix
- **File:** `src/services/calendar/google.ts`
- **Changes:** In the `deleteEvent` method, append `?sendUpdates=all` to the DELETE URL to ensure attendees are notified when the event is cancelled. Update the error handling to log the actual text or JSON response if it's not a JSON error.
- **File:** `src/services/calendar/service.ts`
- **Changes:** In `deleteBookingEvent`, ensure it passes the error back or logs it with context (`userId` and `googleEventId`) if the Google deletion fails.

## Verification
- Review the dashboard UI to confirm it properly matches the internal `status` and `payment_status`.
- Create a test booking, ensure it syncs to Google Calendar.
- Cancel the test booking, verify it is deleted from Google Calendar and the UI shows "Cancelado".
