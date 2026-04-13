# Plan: Implement Booking Rescheduling (Cambio de Turno)

## Objective
Allow clients to reschedule their appointments up to a configurable amount of hours before the event. If a client attempts to book a new time and already has an active booking, prompt them to reschedule the existing one instead of creating a duplicate. This change must synchronize with Google Calendar and allow the owner to define the reschedule policy.

## Proposed Solution

### 1. Database Schema Update
- **`profiles` table**: Add a new column `reschedule_limit_hours` (integer) with a default of `24`. This allows the owner to set their "política de cambio de turno" (e.g., changes allowed up to 24 hours before the event). 
- A database migration or SQL command will be needed to add this column.

### 2. Backend Services Integration
- **`GoogleCalendarService` (`src/services/calendar/google.ts`)**:
  - Add `updateEvent(accessToken, eventId, eventData)` to send a `PATCH` request to the Google Calendar API with `?sendUpdates=all` to notify attendees of the time change.
- **`CalendarService` (`src/services/calendar/service.ts`)**:
  - Add `updateBookingEvent(userId, googleEventId, newStart, newEnd)` that invokes `google.ts` `updateEvent`.
- **`BookingService` (`src/services/booking/service.ts`)**:
  - Enhance the existing `reschedule` method to:
    - Receive `initiatedBy: 'client' | 'provider'` and validate against `reschedule_limit_hours` if initiated by the client.
    - Update `start_time` and `end_time` in the DB.
    - Call `CalendarService.updateBookingEvent` if `google_event_id` exists.
    - Call a new notification function `sendBookingRescheduledEmail` to notify both parties.
  - Add a method `getActiveBookingByEmail(profileId, email)` to find existing active bookings for a client during the booking flow.

### 3. Public Booking Flow Warning (Collision Detection)
- **Action (`src/app/[slug]/[eventId]/actions.ts`)**:
  - In `createBooking`, if `forceCreate` is false, check if the `email` already has an active booking for this profile.
  - If an active booking exists, return a special response: `{ requiresRescheduleConsent: true, existingBookingId: id, existingBookingDate: date }`.
- **UI (`src/app/[slug]/[eventId]/BookingClient.tsx`)**:
  - Intercept the `requiresRescheduleConsent` response.
  - Show a modal to the user: *"Ya tienes un turno agendado para el [Date]. ¿Deseas cambiar tu turno actual por este nuevo horario, o reservar un turno adicional?"*
  - **Option 1 (Cambiar turno)**: Calls a new server action `rescheduleClientBookingByEmail` that updates the existing booking to the new time and syncs it.
  - **Option 2 (Turno adicional)**: Calls `createBooking` again with `forceCreate=true`.

### 4. Direct Reschedule from Cancellation Link
- **Cancel Page (`src/app/cancel/[bookingId]/page.tsx`)**:
  - Verify if the current time is before the `reschedule_limit_hours` threshold.
  - If allowed, show a **"Cambiar fecha/hora"** button next to the Cancel button.
  - This button redirects to `/[slug]/[eventId]?rescheduleId=[bookingId]&t=[cancel_token]`.
- **UI (`BookingClient.tsx`)**:
  - If URL params `rescheduleId` and `t` are present, the UI adapts to "Modo Edición".
  - Submitting the form calls a specific action that safely verifies the token and reschedules the specific booking without creating a new one.

### 5. Provider Dashboard Settings
- **Settings Page (`src/app/dashboard/settings/SettingsClient.tsx`)**:
  - Add an input field for "Límite de tiempo para reprogramar (horas antes del turno)" tied to `reschedule_limit_hours`.

## Verification
- Create a booking.
- Try to create a second booking with the same email and verify the reschedule modal appears.
- Reschedule from the modal and verify the DB and Google Calendar are updated.
- Use the cancellation link, verify the "Cambiar fecha" button appears, use it, and confirm the reschedule via token works.
- Verify settings page successfully saves the `reschedule_limit_hours` value.