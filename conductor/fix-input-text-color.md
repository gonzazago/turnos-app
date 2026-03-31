# Plan: Fix Input Text Color

## Objective
Fix the issue where text inside input and textarea elements appears white on a light background (or otherwise unreadable) when typing.

## Changes
- Add `text-slate-900` class to all light-themed `input` and `textarea` elements across the dashboard and booking flow:
  - `src/app/dashboard/event-types/NewEventForm.tsx`
  - `src/app/dashboard/settings/SettingsClient.tsx`
  - `src/app/dashboard/components/AvailabilitySettings.tsx`
  - `src/app/dashboard/settings/AvailabilityForm.tsx`
  - `src/app/[slug]/[eventId]/BookingClient.tsx`
- Add `text-slate-200` class to dark-themed `input` elements in the auth flow to ensure they are visible on dark backgrounds:
  - `src/app/login/page.tsx`
  - `src/app/register/page.tsx`

## Verification
- Run the development server and navigate to the auth pages, dashboard settings, event creation, and public booking page.
- Type into the text inputs and confirm that the text color is dark and readable on light backgrounds, and light and readable on dark backgrounds.
