# Dhaka Music Festival — mobile app

Expo (React Native) app, kept separate from the website in `src/` and `public/`
at the repo root. Sonic Pulse is the first event inside it; see the build
guide for the full phased plan.

## Structure

- `app/(tabs)/` — the five tabs: Events, Cliques, Tickets, Updates, Profile
- `app/(tabs)/events/` — Events list + the Sonic Pulse event page (own stack, so the tab bar stays visible)
- `app/(tabs)/cliques/` — the clique card + the wya? radar (own stack)
- `app/gate/`, `app/verify/[code]` — staff-only routes, outside the tab bar
- `theme.ts` — color tokens and clique palette, copied verbatim from the website's `globals.css`
- `data/` — placeholder event/clique data; real data wiring to Supabase comes in later build phases

## Run it

```bash
cd mobile
npm install
npm run web      # fastest way to preview without a simulator
npm run ios       # requires macOS + Xcode, or use Expo Go
npm run android   # requires Android Studio, or use Expo Go
```

## What's real vs. placeholder right now

Real: navigation structure, theme tokens, bundled Montserrat font, app
icon/splash generated from the website's actual logo, the wya? radar's
distance→radius / bearing→angle math and its pulsing "found" state.

Placeholder, pending their dedicated build-guide phases: ticket/event/clique
data (hardcoded, not yet from Supabase), the gate camera scanner (static UI,
not yet wired to `expo-camera`), and wya?'s GPS/compass input (fixed
sample distances/bearings, not yet live).
