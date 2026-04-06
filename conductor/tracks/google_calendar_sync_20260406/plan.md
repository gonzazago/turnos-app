# Implementation Plan: Google Calendar Integration

### Phase 1: Authentication and Data Modeling
- [x] Task: Update Database Schema (2290d57)
    - [x] Add `google_calendar_tokens` table to Supabase to securely store OAuth tokens.
    - [x] Update `providers` table to include a flag `google_calendar_connected`.
- [x] Task: Create Setup Tests for OAuth2 (a3036ef)
    - [x] Write failing test for NextAuth/OAuth2 flow integration with Google.
- [x] Task: Implement NextAuth Google Provider (a3036ef)
    - [x] Add Google provider to NextAuth configuration (Implemented as custom OAuth2).
    - [x] Implement callback to store `access_token` and `refresh_token` securely.
- [x] Task: Provider Settings UI (a7cfa40)
    - [x] Write failing UI tests for the "Connect Google Calendar" button in profile settings.
    - [x] Implement the "Connect/Disconnect Google Calendar" button on the Settings view.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Authentication and Data Modeling' (Protocol in workflow.md) (a7cfa40)

### Phase 2: Event Synchronization (Turnos to Google)
- [x] Task: Create Setup Tests for Google Calendar API Services (2a50b10)
    - [x] Write unit tests for Google Calendar service methods (`createEvent`, `deleteEvent`, `generateMeetLink`).
- [x] Task: Implement Google Calendar API Client (2a50b10)
    - [x] Build the utility functions to interact with the Google Calendar API.
- [ ] Task: Synchronize Booking Creation
    - [ ] Write failing integration tests for booking creation that triggers Google Event creation.
    - [ ] Update the core Booking service to push the new event to the provider's connected Google Calendar.
    - [ ] Support generating Google Meet link if the event type is virtual.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Event Synchronization (Turnos to Google)' (Protocol in workflow.md)

### Phase 3: Bidirectional Sync (Google Webhooks)
- [ ] Task: Setup Webhook Endpoint Tests
    - [ ] Write failing tests for the new Google Webhook API endpoint (`/api/webhooks/google-calendar`).
- [ ] Task: Implement Webhook Endpoint
    - [ ] Create the API route `/api/webhooks/google-calendar` to receive push notifications.
    - [ ] Implement signature validation and event parsing.
- [ ] Task: Webhook Subscription Management
    - [ ] Implement the logic to subscribe to a user's Google Calendar upon successful OAuth connection.
    - [ ] Implement the logic to unsubscribe when the user disconnects their account.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Bidirectional Sync (Google Webhooks)' (Protocol in workflow.md)

### Phase 4: Conflict Resolution and Deletion Handling
- [ ] Task: Test Calendar Conflict Resolution
    - [ ] Write tests ensuring that blocks created via the webhook prevent conflicting Turnos App bookings.
- [ ] Task: Implement Conflict Block
    - [ ] Update the `availability` logic: if a busy block exists from Google Calendar, mark the time slots as unavailable.
- [ ] Task: Test Remote Event Deletion
    - [ ] Write tests verifying that a deleted Google Calendar event correctly cancels the Turnos booking.
- [ ] Task: Implement Event Deletion Logic
    - [ ] Update the webhook processor: if an event `status` is `cancelled` in Google Calendar, cancel the booking and notify the client.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Conflict Resolution and Deletion Handling' (Protocol in workflow.md)