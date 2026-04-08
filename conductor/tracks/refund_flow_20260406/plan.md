# Implementation Plan: Refund and Cancellation Flow

### Phase 1: Data Modeling and Calculation Logic [checkpoint: 710410b]
- [x] Task: Update Database Schema (72fdc24)
    - [x] Add `refund_rules` (JSONB) to `profiles` table.
    - [x] Add `cancel_token` (text) and `refund_data` (JSONB) to `bookings` table.
- [x] Task: Implement Refund Calculation Utility (6919a70)
    - [x] Write unit tests for `calculateRefund(rules, appointmentTime, cancelTime)`.
    - [x] Implement logic to return percentage and amount based on dynamic rules.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Data Modeling and Calculation Logic' (Protocol in workflow.md) (710410b)

### Phase 2: Cancellation Infrastructure [checkpoint: 82a446c]
- [x] Task: Secure Cancellation Tokens (a215a6c)
    - [x] Implement utility to generate and verify secure, time-limited cancellation tokens.
- [x] Task: Update Booking Flow (b33c34e)
    - [x] Modify booking creation action to generate a token and store it.
    - [x] Update confirmation email template to include the `/cancel/[id]?t=[token]` link.
- [x] Task: Google Calendar Invite Enrichment (b33c34e)
    - [x] Update `CalendarService` to append the cancellation link to the event description.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Cancellation Infrastructure' (Protocol in workflow.md) (82a446c)

### Phase 3: Public Cancellation Experience
- [x] Task: Create Public Cancellation Page (214ae56)
    - [x] Build the `/cancel/[bookingId]` page (Client Component).
    - [x] Implement data fetching to show booking summary and calculated refund.
- [x] Task: Implement Cancellation Server Action (214ae56)
    - [x] Write integration tests for the cancellation action (Token validation, MP API mock, DB update).
    - [x] Implement logic to:
        - Validate token.
        - Calculate final refund percentage.
        - Call Mercado Pago Refund API (`POST /v1/payments/:id/refunds`).
        - Update booking status to `cancelled`.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Public Cancellation Experience' (Protocol in workflow.md) (214ae56)

### Phase 4: Provider Tools and Sync
- [~] Task: Dashboard Cancellation
    - [ ] Add "Cancel & Refund 100%" button to the Provider Booking details modal.
- [ ] Task: Google Calendar Deletion Sync
    - [ ] Update Google Webhook handler to detect `cancelled` event status.
    - [ ] Trigger the Turnos App cancellation flow with automatic 100% refund.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Provider Tools and Sync' (Protocol in workflow.md)

### Phase 5: Settings and Notifications
- [ ] Task: Refund Rules UI
    - [ ] Implement the "Refund Rules" section in Dashboard Settings (Dynamic input pairs).
- [ ] Task: WhatsApp and Email Notifications
    - [ ] Implement `TwilioService` for WhatsApp messaging.
    - [ ] Trigger Email to client and WhatsApp to provider upon successful cancellation.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Settings and Notifications' (Protocol in workflow.md)
