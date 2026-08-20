/**
 * Sign-in feature flags — see REDESIGN_PLAN.md §8.13–§8.15.
 *
 * SIGNIN_LIVE: master switch for PUBLIC sign-in (owner request, 30 Jul
 * 2026 — §8.15). false = the attendee sign-in card, and every "Sign in"
 * link in nav/menu/footer, are hidden. Gate-staff login and existing
 * signed-in sessions are unaffected. Flip to true to restore.
 *
 * APPLE_SIGNIN_LIVE: flip to true ONLY after the Apple provider is
 * configured and verified in the Supabase dashboard (Authentication →
 * Providers → Apple) — see §8.14 for the short path via the existing
 * Afterhours Services ID.
 *
 * AFTERHOURS_SHARED_ACCOUNT_LIVE: the website and the Afterhours app
 * currently run SEPARATE Supabase projects (confirmed 30 Jul 2026 —
 * REDESIGN_PLAN.md §8.14). Flip to true only after a future amendment
 * unifies both products onto one auth backend. Until then the
 * one-account copy line stays hidden.
 */
export const SIGNIN_LIVE = false
export const APPLE_SIGNIN_LIVE = false
export const AFTERHOURS_SHARED_ACCOUNT_LIVE = false

/**
 * §8.40 (20 Aug 2026): guest accounts and gate ops moved to
 * Afterhours. GUEST_ACCOUNTS_LIVE gates /dashboard;
 * GATE_LIVE gates /gate, /verify and /api/gate/scan. Both flip
 * back to true to restore. /login remains for staff/admin ops.
 * SIGNIN_LIVE above stays false permanently (supersedes §8.15).
 */
export const GUEST_ACCOUNTS_LIVE = false
export const GATE_LIVE = false
