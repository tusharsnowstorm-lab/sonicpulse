---
name: verify-mobile
description: Run the full mobile verification ritual for the Connect app — typecheck, expo web export, SPA-fallback server, Playwright demo-mode flows, and screenshot inspection. Use after any change under mobile/ before committing, or when asked to verify/regression-check the app.
---

# Verify the Connect mobile app (demo mode, headless)

The bar every mobile change must clear, in order. Stop at the first failure,
fix, and restart from that step. Never trust an exit code for a visual claim —
read the screenshots.

## 1. Typecheck

```bash
cd mobile && npx tsc --noEmit
```

Must produce zero output. Do not run the repo-root `npm run lint` against
`mobile/` — ESLint is deliberately scoped to exclude it (see eslint.config.mjs).

## 2. Static web export

```bash
cd mobile && CI=1 npx expo export --platform web
```

`CI=1` is required — plain `expo` prompts interactively and hangs. Confirm any
route you added appears in the printed route list. Output lands in `mobile/dist/`.

## 3. Serve the export

Use the SPA-fallback server in this skill's directory (NOT `python3 -m
http.server` — it 404s client-side routes, and naive fallback servers serve
the wrong HTML for flat routes like `/sign-in`, which Expo exports as
`sign-in.html` not `sign-in/index.html`, causing false-positive React
hydration errors #418 that look like app bugs):

```bash
python3 .claude/skills/verify-mobile/spa-server.py mobile/dist 8791
```

Run it as a background task. If port 8791 is stuck in TIME_WAIT from a
previous run, use another port (8792/8793) — killed servers hold the port
briefly even with SO_REUSEADDR. Verify with
`curl -s -o /dev/null -w "%{http_code}" http://localhost:8791/` → 200.

## 4. Playwright behavioral flows

Playwright is installed globally; Chromium is pre-provisioned:

```js
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
```

Always collect errors and fail on any:

```js
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
```

### Onboarding preamble (needed before any tab is reachable)

Demo mode always boots to `/onboarding`. Complete all 6 steps:

```js
await page.goto('http://localhost:8791/', { waitUntil: 'networkidle' });
await page.getByPlaceholder('Mohammad Rahman').fill('Demo User');
await page.getByText('Continue', { exact: true }).click();
await page.getByText('Male', { exact: true }).click();     // exact: true — "Male" is a substring of "Female"
await page.getByText('Continue', { exact: true }).click();
await page.getByPlaceholder('+8801XXXXXXXXX').fill('+8801712345678');
await page.getByText('Continue', { exact: true }).click();
await page.getByPlaceholder('10 or 17 digit number').fill('1234567890123');
const [c1] = await Promise.all([page.waitForEvent('filechooser'), page.getByText('Upload NID document').click()]);
await c1.setFiles('mobile/assets/images/logo-badge.webp');  // ID upload is mandatory
await page.getByText('Continue', { exact: true }).click();
await page.getByPlaceholder('yourhandle').fill('demo.user');
await page.getByText('Continue', { exact: true }).click();
const [c2] = await Promise.all([page.waitForEvent('filechooser'), page.getByText('Choose a photo').click()]);
await c2.setFiles('mobile/assets/images/logo-badge.webp');
await page.getByText("Let's go").click();
```

### Flow-specific gotchas (all hit for real in this repo's history)

- Navigate tabs with `page.getByRole('tab', { name: 'Tickets' })` — text
  selectors collide with page content.
- Registration and reservation auto-approve after a **3.5 s demo timer**
  (`APPROVAL_DELAY_MS` in `mobile/store/AppStore.tsx`) — `waitForTimeout(3700)`
  before asserting APPROVED/payment states. Same timer approves influencer
  promotion applications.
- Member names appear twice (radar legend + facepile): disambiguate with the
  handle (`getByText('@rafi.k')`) or `.first()`.
- The wya? button appears once per clique card — `getByText('wya?').first()`.
- "Need Accommodation?" resolves to 2 elements; the tappable one is
  `.nth(count - 1)`.

### Established full-regression flows

`/tmp/flow4.js` (onboarding → register → timer → shuttle → pay → accommodation)
and `/tmp/flow7.js` (profile) exist only in the original session's container.
If absent, rebuild from the preamble above plus the gotchas — the flow4
sequence is: event card → Register → Confirm Registration → Done → wait 3.8s →
Tickets tab → toggle shuttle → Pay with bKash → Events tab → Need
Accommodation? → Reserve → wait 3.7s → Pay → Tickets tab.

## 5. Read the screenshots

Take screenshots at every asserted state and **actually Read each image**.
Exit code 0 with an empty `errors` array does not prove the UI is right —
artifact drift and layout regressions were only ever caught by looking.
Reference states: CONFIRMED ticket shows the QR + `SP-` reference code;
demo-mode reference fallback is `SP-4F82A1C9`; wya? radar shows Rafi FOUND
at 6 m with Meem/Adib/Nusrat at 64/98/140 m.

## 6. Clean up

```bash
pkill -f spa-server.py; rm -rf mobile/dist
```

`mobile/dist` must never be committed. Note `pkill` exits 144 here — that's
the signal reaching the backgrounded server, not a failure.
