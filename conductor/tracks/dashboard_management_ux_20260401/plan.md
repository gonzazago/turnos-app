# Implementation Plan: Dashboard Management & Mobile UX

## Phase 1: Mobile Dashboard Layout
- [x] Task: Update `layout.tsx` for mobile responsiveness (b491542)
    - [ ] Create a client component `MobileSidebar` or `DashboardNav` to handle the state of the mobile menu (open/close).
    - [ ] Add a hamburger menu icon to the mobile header.
    - [ ] Render an off-canvas menu for mobile devices, hiding it on larger screens.
- [ ] Task: Conductor - User Manual Verification 'Mobile Dashboard Layout' (Protocol in workflow.md)

## Phase 2: Appointments Dashboard View
- [ ] Task: Fetch and list upcoming bookings
    - [ ] Update `src/app/dashboard/page.tsx` to query the `bookings` table for upcoming appointments (where `end_time` > now).
    - [ ] Display a list or grid of appointment cards, showing: Booker Name, Booker Email, Event Type, Date, Time, Status.
    - [ ] Apply styling to differentiate `confirmed` vs `pending_payment` bookings.
- [ ] Task: Conductor - User Manual Verification 'Appointments Dashboard View' (Protocol in workflow.md)

## Phase 3: Appointment Actions (Cancel/Reschedule)
- [ ] Task: Implement `cancelBooking` server action
    - [ ] Add an action to `src/app/dashboard/actions.ts` that deletes or marks a booking as cancelled, verifying the user owns the event type.
- [ ] Task: Implement `rescheduleBooking` server action
    - [ ] Add an action to update `start_time` and `end_time` of a specific booking.
- [ ] Task: Add UI for actions
    - [ ] Create a `BookingCard` client component with "Cancelar" and "Reprogramar" buttons.
    - [ ] Add a modal for the reschedule action (to pick a new date/time).
- [ ] Task: Conductor - User Manual Verification 'Appointment Actions' (Protocol in workflow.md)