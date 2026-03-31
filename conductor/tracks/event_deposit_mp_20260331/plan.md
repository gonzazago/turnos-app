# Implementation Plan: Event Deposit and Mercado Pago Integration

## Phase 1: Database & Event Configuration
- [ ] Task: Update `event_types` schema for deposit settings
    - [ ] Update `schema.sql` to include `requires_deposit` (bool), `total_price` (numeric), and `deposit_percentage` (numeric).
    - [ ] Update existing event types if necessary.
- [ ] Task: Update Event Creation/Edit UI
    - [ ] Add "Require Deposit" toggle to `NewEventForm.tsx`.
    - [ ] Implement conditional fields for Price and Percentage.
    - [ ] Add real-time calculation of the deposit amount in the UI.
- [ ] Task: Update server action `createEventType` to handle new fields.
- [ ] Task: Conductor - User Manual Verification 'Database & Event Configuration' (Protocol in workflow.md)

## Phase 2: Booking Flow Updates
- [ ] Task: Update `bookings` schema for payment tracking
    - [ ] Add `payment_status` (enum: pending, paid, failed) and `mercado_pago_preference_id` (text).
- [ ] Task: Display deposit info during booking
    - [ ] Update `BookingClient.tsx` to show the "Requires Deposit" badge in slot selection.
    - [ ] Update the confirmation form to display the payment breakdown (Total vs Deposit).
- [ ] Task: Update `createBooking` action
    - [ ] Create booking with `status: pending_payment`.
    - [ ] Return deposit requirement flag to the client.
- [ ] Task: Conductor - User Manual Verification 'Booking Flow Updates' (Protocol in workflow.md)

## Phase 3: Mercado Pago Integration
- [ ] Task: Set up Mercado Pago SDK and Environment
    - [ ] Create a utility for Mercado Pago configuration.
    - [ ] Set up `.env` with `MP_ACCESS_TOKEN` and `MP_PUBLIC_KEY`.
- [ ] Task: Implement Preference Creation
    - [ ] Create a server action to generate a Mercado Pago Preference for a booking.
- [ ] Task: Integrate Checkout in Frontend
    - [ ] Use Mercado Pago Brick or Redirect to initiate payment after booking creation.
- [ ] Task: Conductor - User Manual Verification 'Mercado Pago Integration' (Protocol in workflow.md)

## Phase 4: Payment Confirmation & Webhooks
- [ ] Task: Implement Payment Redirect Handler
    - [ ] Create a route/action to handle the `back_urls` from Mercado Pago (success, failure, pending).
    - [ ] Update booking status based on the result.
- [ ] Task: (Optional but recommended) Implement Webhook
    - [ ] Create an API route to receive asynchronous notifications from Mercado Pago.
- [ ] Task: Final Success Screen UI
    - [ ] Update success screen to show payment confirmation.
- [ ] Task: Conductor - User Manual Verification 'Payment Confirmation & Webhooks' (Protocol in workflow.md)
