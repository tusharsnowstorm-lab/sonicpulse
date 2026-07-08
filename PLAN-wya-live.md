# PLAN-wya-live — Real GPS + compass + Realtime Presence behind the wya? radar (Phase 07)

**Rank: 5 of 5 — but it is deliberately last only because nothing else depends on it.** It is the app's signature feature and the one phase with genuine engineering risk. It can be built in parallel with PLAN-payments/PLAN-influencer-segment by a second executor since it touches disjoint files. Requires PLAN-mobile-auth (identity for presence keys); degrades gracefully without it.

## Repo conventions
Branch `claude/dhaka-festival-ticket-app-guhiwm`; `mobile/` conventions as in PLAN-mobile-auth. The radar UI already exists and stays: `mobile/components/Radar.tsx` (SVG, `radiusForDistance`, pulsing FOUND state), `mobile/app/(tabs)/cliques/wya/index.tsx` (radar + search + legend), `mobile/app/(tabs)/cliques/wya/[slug].tsx` (precision finder with `SeekingArrow` rotated by `bearingDeg`). Today they read hardcoded `distanceMeters`/`bearingDeg` from `mobile/data/clique.ts` seeds. This plan replaces the *numbers*, not the screens.

## Goal
While a wya? screen is open, the user shares foreground-only GPS over a Supabase Realtime Presence channel scoped to the clique; every member's live distance and bearing (relative to the viewer's compass heading) drive the existing radar/finder. Sharing is opt-in per session, auto-expires at event end (09:00), and stops the moment the user leaves the screen. Demo mode (no Supabase env / permission denied) keeps today's seed values so the screens always render.

## Exact files
Create:
- `mobile/lib/geo.ts` — pure math, no imports from React/Expo:
  - `haversineMeters(a: LatLng, b: LatLng): number`
  - `bearingDeg(from: LatLng, to: LatLng): number` (0–360, clockwise from true north)
  - `relativeBearing(absolute: number, heading: number): number` (normalized 0–360)
  - `circularMeanDeg(samples: number[]): number` (vector mean — see edge cases)
  - `smoothBearing(prev: number | null, next: number, alpha?: number): number` (EMA on the unit circle)
- `mobile/hooks/useLiveClique.ts` — the whole runtime: permissions → `watchPositionAsync` + `watchHeadingAsync` → presence channel → returns `{ members: CliqueMember[], sharing: boolean, stopSharing(), status: 'live'|'demo'|'denied'|'connecting' }` where `members` has live `distanceMeters`/`bearingDeg` (or the seeds in demo)
- `scripts/geo.test.ts` — assertions on the pure math, run with `npx tsx scripts/geo.test.ts`
Modify:
- `mobile/app/(tabs)/cliques/wya/index.tsx` and `[slug].tsx` — swap `clique.members` for `useLiveClique(clique).members`; the "Sharing until 09:00" pill becomes real (shows `status`, tap = `stopSharing()`); a `denied` state renders a short explainer + "Open Settings" (`Linking.openSettings()`)
- `mobile/data/clique.ts` — export `EVENT_END_HOUR = 9`; seeds untouched
- `mobile/app.json` — `expo-location` plugin entry with `locationWhenInUsePermission: "Poshh shows your clique roughly where you are, only while wya? is open, only tonight."`
- `mobile/package.json` — `npx expo install expo-location`; add `tsx` to devDependencies

## Steps in order
1. `geo.ts` + `scripts/geo.test.ts` first — pure functions, verifiable with zero device access. Test vectors to assert:
   - haversine: Dhaka(23.8103, 90.4125) → Chittagong(22.3569, 91.7832) ≈ 216 km (±2 km); identical points → 0; ~111,195 m per degree latitude at the equator (±100 m).
   - bearing: due north → 0 (±0.5°), due east → 90 (±0.5°).
   - `circularMeanDeg([350, 10])` → 0 (±0.01), **not 180**.
   - `smoothBearing(359, 1)` moves toward 0/360, never through 180.
2. `useLiveClique.ts` skeleton returning demo mode (`status:'demo'`, seed members). Wire both screens to it. Typecheck + export + Playwright — behavior must be pixel-identical to today. Commit this checkpoint.
3. Location: `Location.requestForegroundPermissionsAsync()`; on grant, `watchPositionAsync({ accuracy: Location.Accuracy.Balanced, timeInterval: 2500, distanceInterval: 2 }, cb)` and `watchHeadingAsync(cb)` (use `trueHeading` when `>= 0`, else `magHeading`). Store latest fix + heading in refs, not state (re-render only when derived member values change meaningfully — see step 5).
4. Presence: `supabase.channel(\`clique:\${clique.id}\`, { config: { presence: { key: session.user.id } } })`; on `subscribe` status `SUBSCRIBED`, `channel.track({ lat, lng, acc, ts: Date.now() })`; re-`track` when moved >2 m or >5 s elapsed (whichever first). Listen to `presence` `sync` events; `presenceState()` → peers map.
5. Derivation loop (a 1 s `setInterval`, cleaned up on unmount): for each peer, `distanceMeters = haversineMeters(me, peer)`, `bearingDeg = smoothBearing(prev, relativeBearing(bearingDeg(me, peer), heading))`; peers with `ts` older than 15 s get `stale: true` → render dimmed via the existing `dimmedSlugs` prop on `Radar`. Map peer user ids onto the clique's member list (`slug` === user id after PLAN-backend-wiring); members not in presence keep seed values and dim.
6. Lifecycle: everything inside `useFocusEffect` (import from `expo-router`) — cleanup must `channel.untrack()`, `supabase.removeChannel(channel)`, and call both watcher `remove()`s. Auto-stop when local time ≥ `EVENT_END_HOUR` (check inside the interval).
7. FOUND hysteresis (edge cases below) inside the hook: expose per-member `found: boolean`; adjust the two screens' `found` checks (`distanceMeters <= FOUND_DISTANCE_METERS` today) to use it; `Radar.tsx`'s internal check gets the boolean passed via the member object (add optional `found?: boolean` to `CliqueMember`, default to the old distance check when absent so demo mode is untouched).
8. Full verification (below). Two-phone field test is the real gate — write results into the PR.

## Edge cases a weaker model would miss
- **Averaging bearings arithmetically is wrong at the wraparound.** `(350° + 10°) / 2 = 180°` — the arrow would point *backwards* exactly when a friend is due north. Convert to unit vectors, average, `atan2` back (`circularMeanDeg`), and do EMA the same way. This is the #1 way the feature dies in the field while passing every naive test.
- **FOUND needs hysteresis, not a threshold.** GPS noise at 8 m oscillates the flag several times a second (haptic spam + strobing UI). Enter FOUND at ≤ 8 m, exit only above 12 m.
- **Gate on `accuracy`.** Fixes with `acc > 30` m must not update positions (indoors/urban canyon jumps); keep the last good fix and let staleness dimming handle prolonged loss. Without this the radar teleports people across the venue.
- **`watchHeadingAsync` `trueHeading` is `-1` when unavailable** (no magnetometer calibration) — fall back to `magHeading`; never feed `-1` into the math.
- **Presence `key` must be the user id**, or every reconnect creates a phantom duplicate member. And your own key must be filtered out of the peers map — the radar plots *others* only (the center dot is you).
- **`removeChannel` on cleanup, not just `unsubscribe`** — leaked channels keep tracking presence and other members see a ghost. Test by navigating in/out of wya? five times and asserting `supabase.getChannels().length` stays 0.
- **Web export**: `watchHeadingAsync` doesn't exist on web. Guard with `Platform.OS !== 'web'`; heading defaults to 0 there (radar valid, rotation-relative arrow approximate) — the export must still build and the Playwright demo run must still pass.
- **Battery/privacy**: foreground-only is a product decision, not an oversight — no `expo-task-manager`, no background permission strings. Adding them would also trigger App Store review questions Phase 13 isn't ready for.
- **`tsx` is a devDependency of `mobile/`**, run from `mobile/` (`npx tsx scripts/geo.test.ts`); don't add jest — the project has no test runner and this plan shouldn't introduce one.

## Acceptance criteria
1. `npx tsx scripts/geo.test.ts` exits 0 printing each assertion (script throws on failure).
2. `npx tsc --noEmit` clean; `CI=1 npx expo export --platform web` succeeds; demo-mode Playwright: radar renders Night Owls exactly as the repo-history screenshots (Rafi FOUND at 6 m, others at seed distances).
3. Permission-denied path (simulator: deny when prompted): screens render the explainer + Settings link; no crash, no infinite spinner.
4. Channel-leak check: enter/leave wya? five times → `supabase.getChannels().length === 0` (assert via a temporary debug log).
5. Two-device field test (manual, must be written into the PR): both devices in one clique see each other within ~10 s; walking 20 m visibly moves the dot in the right direction; rotating in place rotates the precision-finder arrow smoothly (no 180° snaps); FOUND fires once with a single haptic when closing under 8 m; backgrounding one app dims it on the other within ~20 s.
