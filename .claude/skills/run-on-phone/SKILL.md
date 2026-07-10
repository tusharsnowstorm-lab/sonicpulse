---
name: run-on-phone
description: Give the user exact copy-paste instructions to run the Connect app on their phone via Expo Go, or diagnose why their attempt failed. Use whenever the user asks how to test/run/preview the app on a device or simulator, or shows an error from trying (npm/expo/git errors in their terminal).
---

# Get the Connect app running on the user's phone

The user runs commands on THEIR OWN laptop (historically Windows, Command
Prompt, a username containing spaces). You cannot run anything for them —
your job is to emit instructions so precise that zero correction turns are
needed. Every rule below exists because its absence cost real back-and-forth.

## Step 0 — establish context BEFORE writing any instructions

Past failures came from answering without knowing the machine's state. If
the user's message doesn't already say, ask ONE question (AskUserQuestion)
covering: **(a)** is this a machine that already has the repo cloned, or a
fresh one? **(b)** roughly where are they stuck, if mid-attempt? Do not ask
more than once; do not ask what you can infer from a pasted screenshot.

Also register these facts before answering:

- Repo: `https://github.com/tusharsnowstorm-lab/sonicpulse.git`
- Branch: `claude/dhaka-festival-ticket-app-guhiwm` (the app is NOT on main)
- The app lives in the `mobile/` subfolder — every npm/expo command runs
  from there, never the repo root (the root is the Next.js website).
- With no `EXPO_PUBLIC_*` env vars set, the app boots in demo mode: no
  login, seeded data, every flow works. That is the intended first test.

## Rules for the instructions you emit

1. **Copy-paste ready, no placeholders** the user must mentally edit. If a
   path is needed, derive it from what they told you; quote every Windows
   path (`cd "C:\Users\Name With Spaces\..."`) — the user's real username
   contains spaces and an unquoted path breaks.
2. **One command per fenced block** in the exact order to run them, numbered.
3. **Every fresh terminal starts in the home folder.** Any instruction set
   that spans "open a new terminal" must repeat the `cd` — the ENOENT
   `package.json` error the user hit was exactly this.
4. **Include a checkpoint before the expensive step**: have them run `dir`
   (Windows) / `ls` and confirm `package.json` and `app.json` are visible
   before `npm install`.
5. **State the same-Wi-Fi requirement** with the phone explicitly, and give
   the `--tunnel` fallback for isolating networks — but as a fallback only
   (slower), triggered by the specific symptom "stuck on Connecting…".
6. Phone connection differs by OS: Android scans the QR from inside Expo Go;
   iPhone scans with the Camera app and taps the banner. Say both.
7. Never suggest running `expo start` (tunnel or not) from a Claude remote
   sandbox — its network policy blocks `api.expo.dev` (verified: the proxy
   logs show connect_rejected). It only works on the user's own machine.

## Canonical fresh-machine sequence (adapt, don't dump blindly)

Prereqs: Node LTS from nodejs.org, Git from git-scm.com, Expo Go on phone.

```
git clone https://github.com/tusharsnowstorm-lab/sonicpulse.git
cd sonicpulse
git checkout claude/dhaka-festival-ticket-app-guhiwm
cd mobile
dir                # checkpoint: package.json + app.json must be listed
npm install
npx expo start
```

Then scan the QR (per-OS as above). If "Connecting…" hangs: Ctrl+C, then
`npx expo start --tunnel` (accept the one-time package install prompt).

## Known error playbook (match the user's screenshot/paste against these first)

- `npm error ENOENT ... package.json` with a home-directory path → they ran
  npm outside `mobile/`. Fix: `cd` to the clone's `mobile` folder; if unsure
  where the clone is, have them run `dir` in their home folder and look for
  `sonicpulse`.
- `'git' is not recognized` / `'node' is not recognized` → prerequisite not
  installed or terminal opened before install finished; reinstall/reopen.
- Repo not on the machine at all (new laptop) → full fresh-machine sequence;
  nothing transfers between laptops except via the git repo.
- QR scans but bundle fails with red error screen → have them paste the
  error; don't guess.
- They ask for real login instead of demo mode → that needs
  `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and
  `EXPO_PUBLIC_SITE_URL` set before `npx expo start`, plus the Supabase
  redirect URL `connect://auth/callback` configured — a separate setup
  conversation; offer it, don't bundle it into first-run instructions.

## Report format

Numbered steps, per-OS phone instructions, the same-Wi-Fi note, the tunnel
fallback, and one line on what they'll see when it works (demo mode boots
straight into onboarding — no account needed).
