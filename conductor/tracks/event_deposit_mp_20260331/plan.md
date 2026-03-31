# Implementation Plan: Event Deposit and Mercado Pago Integration

## Phase 1: Database & Event Configuration
- [x] Task: Update `profiles` schema for user credentials (423263c)
    - [ ] Update `schema.sql` to include `mp_access_token` (text) and `mp_public_key` (text) in `profiles`.
- [x] Task: Update `event_types` schema for deposit settings (87d1e42)
    - [ ] Update `schema.sql` to include `requires_deposit` (bool), `total_price` (numeric), and `deposit_percentage` (numeric).
- [ ] Task: Update User Settings UI
    - [ ] Add fields for `MP_ACCESS_TOKEN` and `MP_PUBLIC_KEY` in the Settings page.
    - [ ] Update `updateProfile` server action to handle these new fields.
- [ ] Task: Update Event Creation/Edit UI
    - [ ] Add "Require Deposit" toggle to `NewEventForm.tsx`.
    - [ ] Implement conditional fields for Price and Percentage.
- [ ] Task: Conductor - User Manual Verification 'Database & Event Configuration' (Protocol in workflow.md)

## Phase 2: Booking Flow Updates
- [ ] Task: Update `bookings` schema for payment tracking
    - [ ] Add `payment_status` (enum: pending, paid, failed) and `mercado_pago_preference_id` (text).
- [ ] Task: Display deposit info during booking
    - [ ] Update `BookingClient.tsx` to show the "Requires Deposit" badge in slot selection.
    - [ ] Update the confirmation form to display the payment breakdown (Total vs Deposit).
- [ ] Task: Update `createBooking` action
    - [ ] Create booking with `status: pending_payment`.
    - [ ] Return deposit requirement flag and the **owner's public key** to the client.
- [ ] Task: Conductor - User Manual Verification 'Booking Flow Updates' (Protocol in workflow.md)

## Phase 3: Mercado Pago Integration
- [ ] Task: Set up Mercado Pago SDK Utility
    - [ ] Create a utility that initializes Mercado Pago using a dynamic Access Token (fetched from the profile).
- [ ] Task: Implement Preference Creation
    - [ ] Create a server action to generate a Mercado Pago Preference for a booking, using the owner's token.
- [ ] Task: Integrate Checkout in Frontend
    - [ ] Use Mercado Pago Brick or Redirect to initiate payment after booking creation, using the owner's public key.
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
