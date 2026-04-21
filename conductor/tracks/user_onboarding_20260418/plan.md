# Implementation Plan: New User Onboarding Process

## Phase 1: Onboarding State Management and UI Shell [checkpoint: e94f639]
- [x] Task: Write Tests for Onboarding State Management (46176a7)
    - [x] Write tests to verify the onboarding state (e.g., `hasCompletedOnboarding` flag) is correctly retrieved for a user.
    - [x] Write tests to ensure the onboarding state can be updated (skipped or completed).
- [x] Task: Implement Onboarding State Logic (46176a7)
    - [x] Add `hasCompletedOnboarding` (boolean) to the user profile schema/database.
    - [x] Create API route or Server Action to fetch the onboarding state.
    - [x] Create API route or Server Action to update the onboarding state.
- [x] Task: Write Tests for Onboarding Modal Overlay (7aa0156)
    - [x] Write component tests for `OnboardingModal` to render correctly over the dashboard.
    - [x] Write tests to ensure it only renders if `hasCompletedOnboarding` is false.
    - [x] Write tests for the "Skip Guide" button functionality, triggering state update and redirection.
- [x] Task: Implement Onboarding Modal Overlay (7aa0156)
    - [x] Build the `OnboardingModal` component.
    - [x] Integrate the state check to conditionally render the modal on the main dashboard.
    - [x] Implement the "Skip Guide" button to update state and redirect to `/dashboard/settings`.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Onboarding State Management and UI Shell' (Protocol in workflow.md) (e94f639)

## Phase 2: Step 2 - App Description, Profile Customization & Live Card [checkpoint: 9d919fa]
- [x] Task: Write Tests for Step 2 UI and Live Card (06affbd)
    - [x] Write tests to ensure the app description and "Configure appearance/image" inputs are displayed.
    - [x] Write tests to verify input-by-input guidance updates the state correctly.
    - [x] Write tests for the `LiveCard` component to reflect input changes in real-time.
- [x] Task: Implement Step 2 UI and Guidance Logic (06affbd)
    - [x] Build the Step 2 UI within the `OnboardingModal`.
    - [x] Implement state management for the temporary profile customization inputs (e.g., color, logo URL).
    - [x] Add the input-by-input guidance tooltips/descriptions (e.g., "Step 1/X").
- [x] Task: Implement Live Card Preview (06affbd)
    - [x] Build the interactive `LiveCard` component.
    - [x] Bind the temporary profile customization state to the `LiveCard` for real-time updates.
    - [x] Implement the confirmation/agreement button to proceed to Step 3.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Step 2 - App Description, Profile Customization & Live Card' (Protocol in workflow.md) (9d919fa)

## Phase 3: Step 3 - First Event Type Creation & Completion [checkpoint: 80abe9b]
- [x] Task: Write Tests for Step 3 Event Creation (b415426)
    - [x] Write tests to ensure the Step 3 UI renders the event creation inputs (name, duration).
    - [x] Write tests to verify the form submission successfully creates an event type.
    - [x] Write tests to ensure the onboarding state is marked as complete upon success.
- [x] Task: Implement Step 3 UI and Event Creation (80abe9b)
    - [x] Build the Step 3 UI within the `OnboardingModal`.
    - [x] Implement the form state and validation for the new event type.
    - [x] Integrate with the existing event creation API/Action.
- [x] Task: Implement Onboarding Completion Logic (80abe9b)
    - [x] Upon successful event creation, trigger the update to set `hasCompletedOnboarding` to true.
    - [x] Close the modal and redirect the user to their newly created event type or the main dashboard.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Step 3 - First Event Type Creation & Completion' (Protocol in workflow.md) (80abe9b)