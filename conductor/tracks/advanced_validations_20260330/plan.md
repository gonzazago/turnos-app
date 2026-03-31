# Implementation Plan: Advanced Validations, Config, and Payment Prep

## Phase 1: Payment Preparation & Schema Updates [checkpoint: 40369f3]
- [x] Task: Update database schemas for payment prep (563dad3)
    - [ ] Update `schema.sql` to add `requires_deposit` (boolean), `price` (numeric), and `deposit_amount` (numeric) to `event_types`.
    - [ ] Update `schema.sql` to add a `billing_info` (JSONB) column to `bookings`.
    - [ ] Write tests verifying the new schema structure and default values.
- [x] Task: Conductor - User Manual Verification 'Payment Preparation & Schema Updates' (Protocol in workflow.md) (66173ef)

## Phase 2: Booking Rate Limiting Validation [checkpoint: 9a21872]
- [x] Task: Implement server-side rate limiting logic (7ae3a50)
    - [ ] Write failing tests for booking action (e.g., attempt to book twice on same day with same email).
    - [ ] Update `src/app/[slug]/[eventId]/actions.ts` to query `bookings` and reject if the provided email address has already booked that specific day.
    - [ ] Update UI to handle the rate-limit error gracefully.
- [x] Task: Conductor - User Manual Verification 'Booking Rate Limiting Validation' (Protocol in workflow.md) (d200533)

## Phase 3: Owner Configuration UI [checkpoint: be91527]
- [x] Task: Dashboard UI for Availability Configuration (12dba73)
    - [ ] Write failing tests for availability management UI components.
    - [ ] Create/Update the dashboard settings page to allow owners to set global and per-day working hours.
    - [ ] Implement server actions to save these settings to the `availability` table.
- [x] Task: Conductor - User Manual Verification 'Owner Configuration UI' (Protocol in workflow.md) (12dba73)

## Phase 4: Booking Details Modal [checkpoint: 631fbc2]
- [x] Task: Implement Booking Details Modal (8b67208)
    - [ ] Write tests for the modal component rendering correctly with booking data.
    - [ ] Create a modal component in the dashboard calendar view.
    - [ ] Wire the modal to open on appointment click, displaying booker details, time, and billing info (if applicable).
- [x] Task: Conductor - User Manual Verification 'Booking Details Modal' (Protocol in workflow.md) (8b67208)
