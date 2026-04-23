# Plan: Redirect Authenticated Users from Root to Dashboard

## Objective
Automatically redirect users to the `/dashboard` if they visit the landing page (root `/`) while already authenticated.

## Background & Motivation
Currently, when a logged-in user navigates to the root URL (`/`), they see the public landing page instead of their dashboard. To improve the user experience, we want to detect if a valid session exists at the Edge Middleware level and seamlessly redirect authenticated users to their dashboard.

## Key Files & Context
- `src/utils/supabase/middleware.ts`: The central location where Next.js middleware interacts with Supabase to verify the user's session on every request.

## Implementation Steps
1. **Modify `updateSession` in `src/utils/supabase/middleware.ts`**:
   - Immediately after calling `supabase.auth.getUser()`, add a new condition.
   - Check if `user` exists AND if `request.nextUrl.pathname` is strictly equal to `'/'`.
   - If both conditions are met, clone the `request.nextUrl`, change its pathname to `'/dashboard'`, and return a `NextResponse.redirect` to that URL.

## Verification & Testing
- Log into the application locally.
- While logged in, attempt to navigate to `http://localhost:3000/`.
- Verify that the application automatically redirects to `http://localhost:3000/dashboard` without showing the landing page.
- Log out, navigate to `http://localhost:3000/`, and verify that the landing page renders correctly for unauthenticated users.