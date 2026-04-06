# Overview
This feature implements a bidirectional synchronization between Turnos App and Google Calendar. It allows service providers to connect their Google Calendar accounts, automatically creating events in both calendars when a booking is made. Additionally, it ensures that times blocked in Google Calendar by the provider are properly reflected as unavailable in Turnos App, preventing double bookings.

# Functional Requirements
- **Authentication:** Implement OAuth2 flow to securely authenticate and store Google Calendar refresh tokens in Supabase.
- **Event Creation (Turnos -> Google):** When a booking is created in Turnos App, a corresponding event must be created in the provider's connected Google Calendar.
- **Google Meet Integration:** For virtual meetings, automatically generate a unique Google Meet link via the Google Calendar API for each event and share it with both provider and client.
- **Bidirectional Sync (Google -> Turnos):** Implement Google Calendar Webhooks to receive real-time push notifications of changes made directly in the provider's Google Calendar.
- **Availability Block:** If a provider schedules a meeting directly in Google Calendar (e.g., 9:30 to 10:30), these time slots must become unavailable for clients in Turnos App.
- **Event Deletion Sync:** If a synchronized event is deleted directly in Google Calendar by the provider, the corresponding booking in Turnos App must be automatically canceled and the client notified.

# Acceptance Criteria
- [ ] Provider can successfully connect and disconnect their Google Calendar account from their profile settings.
- [ ] Booking an appointment in Turnos App creates an event in the provider's Google Calendar with the correct time, description, and an auto-generated Google Meet link (if virtual).
- [ ] Events created directly in the connected Google Calendar instantly block the corresponding time slots in Turnos App via webhooks.
- [ ] Deleting an event in Google Calendar cancels the booking in Turnos App and triggers a notification.
- [ ] Disconnecting the calendar stops all synchronization and revokes the webhook subscription.

# Out of Scope
- Support for other calendar providers (e.g., Outlook, Apple Calendar) in this track.
- Syncing historical events (only new events/changes from the moment of connection will be synced).