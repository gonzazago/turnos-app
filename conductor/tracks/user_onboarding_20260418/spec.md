# Track: New User Onboarding Process

## Overview
Implement an interactive, multi-step onboarding modal that guides newly registered users through the initial setup of their account, allowing them to personalize their booking page and create their first event type. The onboarding experience should be educational, highlighting the impact of each setting on their public profile. Users have the option to complete the guide or skip it entirely to proceed with manual configuration.

## Functional Requirements
- **Onboarding Modal Overlay:** Present the onboarding process as a pop-up modal overlay over the main dashboard.
- **Step 1: Welcome & Profile Slug (Completed context)**
  - Acknowledge that the user has completed their profile slug registration.
- **Step 2: App Description & Profile Customization**
  - Display a brief introductory description of the application.
  - Present a "Configure appearance/image" action for the user's booking page.
  - Guide the user input-by-input, indicating exactly where each setting impacts their public profile (e.g., "Step 1/X").
  - Provide a "Live Card" preview—an interactive, scaled-down live preview showing exactly how their booking page looks with the current settings.
  - Require the user's agreement/confirmation to proceed to the final step.
- **Step 3: First Event Type Creation**
  - Guide the user through the essential inputs to create their first event type (e.g., event name, duration).
- **Skip Functionality:** 
  - Provide a prominent "Skip Guide" button on every step.
  - If skipped, redirect the user immediately to the Settings Page to configure their profile manually.
- **State Persistence:** Ensure the onboarding modal only appears once per user, ideally triggered after the initial registration and slug setup.

## Non-Functional Requirements
- **User Experience (UX):** The interface must be intuitive, with clear visual cues and step indicators (e.g., progress bar or dots).
- **Responsive Design:** The modal and the Live Card preview must be fully responsive, maintaining a mobile-first approach as per the Product Guidelines.
- **Performance:** The Live Card preview should update without noticeable lag to provide a seamless "real-time" feel.

## Acceptance Criteria
- [ ] After initial registration and slug setup, the user is presented with the onboarding Modal Overlay.
- [ ] Step 2 displays the app description and allows the user to configure their appearance/image.
- [ ] Step 2 includes an interactive Live Card showing a scaled-down version of their public profile.
- [ ] The user receives input-by-input guidance with clear descriptions of where each setting impacts their page.
- [ ] Step 3 allows the user to successfully create their first event type.
- [ ] A "Skip Guide" option is available at all times, redirecting the user to the Settings Page.
- [ ] Once completed or skipped, the user is not prompted with the onboarding modal again on subsequent logins.

## Out of Scope
- Advanced event type settings (e.g., complex scheduling rules, multiple locations) during the onboarding phase.
- Custom branding beyond basic appearance/image settings in the onboarding flow.
- Re-triggering the onboarding guide manually from the dashboard.