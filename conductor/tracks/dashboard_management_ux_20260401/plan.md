# Implementation Plan: Dashboard Management & Mobile UX

## Phase 1: Mobile Dashboard Layout [checkpoint: a467995]
- [x] Task: Update `layout.tsx` for mobile responsiveness (b491542)
    - [x] Create a client component `MobileSidebar` or `DashboardNav` to handle the state of the mobile menu (open/close).
    - [x] Add a hamburger menu icon to the mobile header.
    - [x] Render an off-canvas menu for mobile devices, hiding it on larger screens.
- [x] Task: Conductor - User Manual Verification 'Mobile Dashboard Layout' (Protocol in workflow.md) (a467995)

## Phase 2: Appointments Dashboard View [checkpoint: 83c9c2d]
- [x] Task: Fetch and list upcoming bookings (83c9c2d)
    - [x] Update `src/app/dashboard/page.tsx` to query the `bookings` table for upcoming appointments (where `end_time` > now).
    - [x] Display a list or grid of appointment cards, showing: Booker Name, Booker Email, Event Type, Date, Time, Status.
    - [x] Apply styling to differentiate `confirmed` vs `pending_payment` bookings.
- [x] Task: Conductor - User Manual Verification 'Appointments Dashboard View' (Protocol in workflow.md) (83c9c2d)

## Phase 3: Appointment Actions (Cancel/Reschedule) [checkpoint: f2e3272]
- [x] Task: Implement `cancelBooking` server action (f2e3272)
    - [x] Add an action to `src/app/dashboard/actions.ts` that deletes or marks a booking as cancelled, verifying the user owns the event type.
- [x] Task: Implement `rescheduleBooking` server action (f2e3272)
    - [x] Add an action to update `start_time` and `end_time` of a specific booking.
- [x] Task: Add UI for actions (f2e3272)
    - [x] Create a `BookingCard` client component with "Cancelar" and "Reprogramar" buttons.
    - [x] Add a modal for the reschedule action (to pick a new date/time).
- [x] Task: Conductor - User Manual Verification 'Appointment Actions' (Protocol in workflow.md) (f2e3272)