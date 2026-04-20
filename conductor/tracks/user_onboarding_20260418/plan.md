# Implementation Plan: New User Onboarding Process

## Phase 1: Onboarding State Management and UI Shell [checkpoint: e94f639]
- [x] Task: Write Tests for Onboarding State Management (46176a7)
    - [ ] Write tests to verify the onboarding state (e.g., `hasCompletedOnboarding` flag) is correctly retrieved for a user.
    - [ ] Write tests to ensure the onboarding state can be updated (skipped or completed).
- [x] Task: Implement Onboarding State Logic (46176a7)
    - [ ] Add `hasCompletedOnboarding` (boolean) to the user profile schema/database.
    - [ ] Create API route or Server Action to fetch the onboarding state.
    - [ ] Create API route or Server Action to update the onboarding state.
- [x] Task: Write Tests for Onboarding Modal Overlay (7aa0156)
    - [ ] Write component tests for `OnboardingModal` to render correctly over the dashboard.
    - [ ] Write tests to ensure it only renders if `hasCompletedOnboarding` is false.
    - [ ] Write tests for the "Skip Guide" button functionality, triggering state update and redirection.
- [x] Task: Implement Onboarding Modal Overlay (7aa0156)
    - [ ] Build the `OnboardingModal` component.
    - [ ] Integrate the state check to conditionally render the modal on the main dashboard.
    - [ ] Implement the "Skip Guide" button to update state and redirect to `/dashboard/settings`.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Onboarding State Management and UI Shell' (Protocol in workflow.md) (e94f639)

## Phase 2: Step 2 - App Description, Profile Customization & Live Card [checkpoint: 9d919fa]
- [x] Task: Write Tests for Step 2 UI and Live Card (06affbd)
    - [ ] Write tests to ensure the app description and "Configure appearance/image" inputs are displayed.
    - [ ] Write tests to verify input-by-input guidance updates the state correctly.
    - [ ] Write tests for the `LiveCard` component to reflect input changes in real-time.
- [x] Task: Implement Step 2 UI and Guidance Logic (06affbd)
    - [ ] Build the Step 2 UI within the `OnboardingModal`.
    - [ ] Implement state management for the temporary profile customization inputs (e.g., color, logo URL).
    - [ ] Add the input-by-input guidance tooltips/descriptions (e.g., "Step 1/X").
- [x] Task: Implement Live Card Preview (06affbd)
    - [ ] Build the interactive `LiveCard` component.
    - [ ] Bind the temporary profile customization state to the `LiveCard` for real-time updates.
    - [ ] Implement the confirmation/agreement button to proceed to Step 3.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Step 2 - App Description, Profile Customization & Live Card' (Protocol in workflow.md) (9d919fa)

## Phase 3: Step 3 - First Event Type Creation & Completion
- [ ] Task: Write Tests for Step 3 Event Creation
    - [ ] Write tests to ensure the Step 3 UI renders the event creation inputs (name, duration).
    - [ ] Write tests to verify the form submission successfully creates an event type.
    - [ ] Write tests to ensure the onboarding state is marked as complete upon success.
- [ ] Task: Implement Step 3 UI and Event Creation
    - [ ] Build the Step 3 UI within the `OnboardingModal`.
    - [ ] Implement the form state and validation for the new event type.
    - [ ] Integrate with the existing event creation API/Action.
- [ ] Task: Implement Onboarding Completion Logic
    - [ ] Upon successful event creation, trigger the update to set `hasCompletedOnboarding` to true.
    - [ ] Close the modal and redirect the user to their newly created event type or the main dashboard.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Step 3 - First Event Type Creation & Completion' (Protocol in workflow.md)