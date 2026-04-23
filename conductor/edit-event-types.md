# Implementation Plan: Edit Event Types

## Objective
Implement the ability to edit existing Event Types from the dashboard, reusing the existing form UI to maintain consistency and DRY code.

## Key Files & Context
- `src/app/dashboard/event-types/actions.ts`: Needs a new `updateEventType` server action.
- `src/app/dashboard/event-types/NewEventForm.tsx`: Needs to be renamed to `EventFormModal.tsx` and refactored to handle both creation and editing.
- `src/app/dashboard/event-types/page.tsx`: Needs to use the refactored `EventFormModal` for both the "New Event" button and the "Edit" button on each event card.

## Implementation Steps

### 1. Server Actions
- Add `updateEventType(id: string, formData: FormData, availability: AvailabilityDay[])` to `actions.ts`.
- The action will verify user ownership, update the `event_types` table, delete the old `availability` rows, and insert the new `availability` rows for the given `event_type_id`.
- Revalidate the path `/dashboard/event-types`.

### 2. Refactor Form Component
- Rename `NewEventForm.tsx` to `EventFormModal.tsx`.
- Update the component to accept an optional `eventToEdit` prop.
- If `eventToEdit` is provided, pre-fill the form state (`title`, `duration_mins`, `description`, `requires_deposit`, `total_price`, `deposit_percentage`) and the `schedule` state.
- Update the `useActionState` to conditionally call `updateEventType` if `eventToEdit` exists, otherwise `createEventType`.
- Make the trigger button dynamic: if `eventToEdit` exists, render an Edit button (using an icon like `Pencil`), otherwise render the "Nuevo Tipo de Evento" button.

### 3. Update Dashboard Page
- In `page.tsx`, import `EventFormModal`.
- Keep the `EventFormModal` at the top for creating new events.
- Inside the `eventTypes` map, render another instance of `EventFormModal` for each event, passing the `event` data as the `eventToEdit` prop. This will render the Edit button next to the Delete button.

## Verification & Testing
- Start the server and navigate to `/dashboard/event-types`.
- Verify the "Nuevo Tipo de Evento" flow still works correctly.
- Click the "Edit" button on an existing event, verify the modal opens with the correct data pre-filled.
- Modify some fields (e.g., change price or availability) and save.
- Verify the changes are reflected in the database and the UI updates without requiring a manual refresh.
