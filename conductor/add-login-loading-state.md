# Plan: Add Loading State to Login Form

## Objective
Enhance the user experience on the login page by adding a visual loading indicator (spinner) and disabling the submit button while the login authentication request is being processed.

## Background & Motivation
Currently, when a user submits the login form, there is no visual feedback indicating that the request is in progress. This can lead to users clicking the button multiple times or thinking the application is unresponsive. Since we are using Next.js Server Actions, we can utilize `useFormStatus` to handle the pending state.

## Key Files & Context
- `src/app/login/page.tsx`: The server component rendering the login form.
- `src/app/login/SubmitButton.tsx`: A new client component to handle the form's pending state.

## Implementation Steps
1. **Create `SubmitButton.tsx` (Client Component)**:
   - Create `src/app/login/SubmitButton.tsx` with the `'use client'` directive.
   - Use the `useFormStatus` hook from `react-dom` to read the `pending` state of the form.
   - Render a submit button that preserves the exact styling of the current login button.
   - If `pending` is `true`, disable the button, reduce its opacity, and show a loading spinner alongside text like "Ingresando...".

2. **Update `src/app/login/page.tsx`**:
   - Import the new `SubmitButton` component.
   - Replace the existing raw HTML `<button formAction={login}>` with the new `<SubmitButton>` component.
   - Pass the `login` server action down to the component via the `formAction` prop.

## Verification & Testing
- Navigate to the `/login` page.
- Enter credentials and submit the form.
- Observe that the button immediately shows a loading spinner and becomes disabled while the request processes.
- Ensure the login flow still successfully redirects to `/dashboard` upon correct credentials.