# PLAN-mobile-auth — Google sign-in via Supabase in the Expo app (Phase 03)

**Rank: 1 of 5. Do this first.** Every Partial feature in the app (registration approval, payments, cliques, influencer segment) is blocked on real user identity. This plan gives the app the same Supabase auth the website already uses — same project, same accounts.

## Repo conventions (read before touching anything)
- Work on branch `claude/dhaka-festival-ticket-app-guhiwm`. Never push elsewhere.
- The Expo app lives in `mobile/` with its own `package.json` and `tsconfig.json`. Path alias `@/*` → `mobile/*`. The root (website) tsconfig excludes `mobile/` — do not change that.
- All text uses `<AppText weight="...">` from `mobile/components/AppText.tsx` (Montserrat). All colors come from `mobile/theme.ts` tokens. Screens wrap in `<Screen>` from `mobile/components/Screen.tsx`.
- Verification ritual after any change: `cd mobile && npx tsc --noEmit` (must be clean), then `CI=1 npx expo export --platform web` (must succeed). `CI=1` because plain `expo` prompts interactively.

## Goal
A user opening the app signs in with Google (same Supabase project as sonicpulsefestival.com), the session persists across restarts, and `app/index.tsx` routes: no session → sign-in screen; session but incomplete profile → onboarding; otherwise → tabs. When env vars are absent, the app still boots in the current local demo mode so CI and the web export keep working.

## Environment contract
- `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` — same values as the website's `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Read via `process.env.EXPO_PUBLIC_*` (Expo inlines these at build time).
- Google Cloud console: the existing OAuth client (already used by the website) must gain the app redirect. Supabase dashboard → Auth → URL Configuration → add `poshh://auth/callback` to Redirect URLs. (`scheme: "poshh"` already exists in `mobile/app.json`.)

## Exact files
Create:
- `mobile/lib/supabase.ts` — client factory + `isSupabaseConfigured` flag
- `mobile/lib/sessionStorage.ts` — chunked SecureStore adapter (see edge cases)
- `mobile/app/sign-in.tsx` — sign-in screen (POSHH wordmark, one "Continue with Google" button, `variant="dark"` Button with the Google G as inline SVG via react-native-svg)
- `mobile/store/AuthContext.tsx` — session state provider

Modify:
- `mobile/app/_layout.tsx` — wrap `AppStoreProvider` with `AuthProvider`; register `sign-in` in the Stack
- `mobile/app/index.tsx` — 3-way redirect described in Goal
- `mobile/app/onboarding/index.tsx` — on completion, ALSO upsert `user_profiles` via supabase when configured (fields exactly as `src/app/api/profile/route.ts` writes them: `full_name, phone, nid_number, instagram_handle, other_social_handle, gender, id_type`), keeping the existing local `completeOnboarding(draft)` call
- `mobile/package.json` — add deps

## Steps in order
1. `cd mobile && npx expo install expo-secure-store expo-web-browser expo-crypto @supabase/supabase-js react-native-url-polyfill` (use `expo install`, not `npm install`, so versions match SDK 57).
2. Write `mobile/lib/sessionStorage.ts`: a storage object `{getItem, setItem, removeItem}` that splits values into ≤1900-byte chunks stored as `key.0`, `key.1`, … with a `key.meta` count entry, reassembling on read. All async, string-only.
3. Write `mobile/lib/supabase.ts`:
   ```ts
   import 'react-native-url-polyfill/auto';
   import { createClient } from '@supabase/supabase-js';
   import { Platform } from 'react-native';
   import { chunkedSecureStore } from '@/lib/sessionStorage';
   const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
   const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
   export const isSupabaseConfigured = !!url && !!key;
   export const supabase = isSupabaseConfigured
     ? createClient(url!, key!, { auth: {
         storage: Platform.OS === 'web' ? undefined : chunkedSecureStore,
         autoRefreshToken: true, persistSession: true, detectSessionInUrl: Platform.OS === 'web',
         flowType: 'pkce',
       }})
     : null;
   ```
4. Write `AuthContext.tsx`: holds `session | null | 'loading'`; on mount `supabase.auth.getSession()` then `onAuthStateChange`; expose `signInWithGoogle()` and `signOut()`. Native Google flow:
   ```ts
   const redirectTo = 'poshh://auth/callback';
   const { data } = await supabase.auth.signInWithOAuth({ provider: 'google',
     options: { redirectTo, skipBrowserRedirect: true }});
   const res = await WebBrowser.openAuthSessionAsync(data.url!, redirectTo);
   if (res.type === 'success') {
     const code = new URL(res.url).searchParams.get('code');
     if (code) await supabase.auth.exchangeCodeForSession(code);
   }
   ```
   On web (`Platform.OS === 'web'`): plain `signInWithOAuth` without `skipBrowserRedirect` (full-page redirect, `detectSessionInUrl` completes it).
5. AppState-driven token refresh in `AuthContext` (documented Supabase RN requirement — sessions silently die without it):
   ```ts
   AppState.addEventListener('change', (s) =>
     s === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh());
   ```
6. Build `sign-in.tsx` (void background, centered wordmark, Google button, small muted footer "Same account as sonicpulsefestival.com"). When `!isSupabaseConfigured`, show instead a single "Continue in demo mode" Button that routes to `/onboarding` — preserving today's behavior.
7. Rewire `app/index.tsx`:
   - `!isSupabaseConfigured` → keep exact current behavior (`hasOnboarded ? tabs : onboarding`).
   - configured: `session === 'loading'` → return `null`; no session → `<Redirect href="/sign-in" />`; session + `!hasOnboarded` → onboarding; else tabs.
   - On first session, fetch `user_profiles` row; if it has `full_name` and `nid_number`, hydrate the store profile and treat as onboarded (returning users skip the wizard).
8. Onboarding completion: after `completeOnboarding(draft)`, if configured, upsert to `user_profiles` with `onConflict: 'user_id'`. Photo/ID files: upload to the `profile-pictures` bucket at `${user.id}/avatar.{ext}` and `nid-documents` at `profiles/${user.id}/nid.{ext}` — the same paths `src/app/api/profile/route.ts` uses, so website and app see one profile.
9. Typecheck + export + Playwright pass (see acceptance).

## Edge cases a weaker model would miss
- **SecureStore has a ~2048-byte value limit on Android; a Supabase session JSON is ~3–5KB.** Writing it directly truncates silently and the session never restores. The chunked adapter in step 2 exists precisely for this. Do not "simplify" it away or swap in AsyncStorage (tokens would sit unencrypted).
- **`react-native-url-polyfill/auto` must be imported before `createClient`** — supabase-js uses `URL` APIs Hermes doesn't fully implement. Omitting it fails only at runtime on device, not in typecheck.
- **`exchangeCodeForSession` requires `flowType: 'pkce'`** set at client creation. Default implicit flow returns tokens in the URL fragment, which `openAuthSessionAsync` result parsing won't see the same way.
- **Do not gate the root layout on auth.** Fonts/splash logic in `app/_layout.tsx` must stay untouched above the providers; auth-based redirects live only in `app/index.tsx`, otherwise the splash screen deadlocks.
- **Web export must not import expo-secure-store code paths** — it throws on web. The `Platform.OS === 'web' ? undefined : chunkedSecureStore` branch handles this; keep it.
- **Gate staff stay out of the app's Google flow.** Do NOT reimplement the `GATE_STAFF_EMAILS` allowlist client-side; the gate screen keeps using the website's server-checked flow later (Phase 04). Nothing in this plan touches `mobile/app/gate/`.
- **Never commit env values.** No `.env` files in git; document names only (README comment in `lib/supabase.ts`).

## Acceptance criteria
Without secrets (CI / this sandbox):
1. `cd mobile && npx tsc --noEmit` → exit 0.
2. `CI=1 npx expo export --platform web` → succeeds, `/sign-in` appears in route list.
3. Playwright against the export (serve `dist/` with the SPA-fallback server pattern in `/tmp/spa_server.py` from repo history, port ≠ 8791 if occupied): app boots to onboarding demo mode exactly as today; full onboarding→events flow still passes.
With secrets (manual, on a device or `npx expo start`):
4. Google sign-in round-trips and `supabase.auth.getSession()` is non-null after app restart (kill and reopen).
5. Completing onboarding creates/updates the `user_profiles` row visible in the website dashboard for the same Google account.
6. Airplane-mode relaunch still shows the session (persisted), and returning online refreshes tokens without sign-out.
