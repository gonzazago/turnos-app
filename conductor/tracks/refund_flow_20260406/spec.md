# Overview
This feature implements a comprehensive cancellation and refund flow for Turnos App. It allows clients to cancel their own appointments via specialized links in emails and calendar invites, while enabling providers to set custom refund rules based on how far in advance the cancellation occurs. Refunds via Mercado Pago will be processed automatically when applicable.

# Functional Requirements
- **Cancellation Rules (Provider Settings):**
    - Providers can define a list of rules (e.g., "Less than 24 hours: 0% refund", "More than 48 hours: 100% refund").
    - Rules consist of "Hours before appointment" and "Percentage of refund".
- **Cancellation Links:**
    - Confirmation emails must include a unique, secure cancellation link.
    - Google Calendar events (ICS/API) must include this link in the description.
- **Client Cancellation Page:**
    - A public route `/cancel/[bookingId]?token=[secureToken]`.
    - Displays booking details and calculated refund amount based on provider rules.
    - Requires a final confirmation click from the client.
- **Refund Execution:**
    - **Provider-initiated:** Always 100% refund (from Dashboard or Calendar Sync).
    - **Client-initiated:** Automatically calculated percentage refund via Mercado Pago API.
- **Notifications:**
    - Cancellation confirmation email sent to the client in all cases.
    - WhatsApp notification sent to the provider via Twilio (for compatible plans).
- **Calendar Sync:**
    - If an event is deleted in Google Calendar by the owner, trigger the 100% refund and cancellation flow in Turnos App.

# Acceptance Criteria
- [ ] Providers can save and edit dynamic refund rules in their dashboard settings.
- [ ] Clients receive an email with a working cancellation link upon booking.
- [ ] Clicking the cancellation link shows the correct estimated refund.
- [ ] Confirming cancellation triggers the Mercado Pago refund and updates the booking status to `cancelled`.
- [ ] Deleting a synced event in Google Calendar cancels the booking in Turnos App and refunds the client 100%.
- [ ] Providers receive a WhatsApp message when a client cancels.

# Out of Scope
- Partial refunds for manual provider-initiated cancellations (always 100% for this phase).
- Re-scheduling flow (clients must cancel and re-book).
- Support for other payment providers beyond Mercado Pago.
