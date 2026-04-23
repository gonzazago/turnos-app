# Plan: Fix Local Login Cookie Issue

## Objective
Fix the local login flow by stopping the encryption of Supabase authentication cookies (`sb-...`). This custom encryption was causing the Next.js Edge middleware to fail at reading the session, resulting in infinite login redirects.

## Background & Motivation
Currently, `src/utils/supabase/server.ts` encrypts all cookies starting with `sb-` (Supabase auth cookies) using Node's `crypto` module. However, `src/utils/supabase/middleware.ts` runs in the Edge runtime, where Node's `crypto` is not available. As a result, the middleware reads the encrypted cookie, fails to process it, considers the user unauthenticated, and repeatedly redirects to `/login`. Supabase JWTs are already signed and secure by default, so custom encryption is unnecessary.

## Key Files & Context
- `src/utils/supabase/server.ts`

## Implementation Steps
1. **Modify `getAll()` in `server.ts`**:
   - Stop decrypting cookie values. Return the cookie value as-is without applying `decryptToken` for cookies starting with `sb-`.
2. **Modify `setAll()` in `server.ts`**:
   - Stop encrypting cookie values. Save the cookie value as-is without applying `encryptToken` for cookies starting with `sb-`.

## Verification & Testing
- Attempt to log in locally.
- Verify that the login successfully redirects to `/dashboard` instead of getting stuck on the login screen.
- Verify that the session persists correctly across page reloads.