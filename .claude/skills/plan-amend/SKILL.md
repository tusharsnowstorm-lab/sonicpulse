---
name: plan-amend
description: The Sonic Pulse two-model workflow — a planner model (Fable 5) turns the owner's requests into executor-grade amendments to REDESIGN_PLAN.md, and an executor model (Sonnet 5) later builds exactly what the plan says. Use this skill whenever the owner says "plan amend", "plan-amend", "amend the plan", or describes a site change they want planned rather than built immediately — even for small changes, planning and execution are deliberately separated in this repo. Also use it when asked to "execute Phase N", "execute §8.x", or "execute the plan" from REDESIGN_PLAN.md.
---

# Plan-amend — the planner/executor split

This repo runs on a deliberate division of labour: one model plans, another executes.
The owner says "plan amend" to the planner (Fable 5), reviews nothing mid-flight, then
hands the plan to the executor (Sonnet 5) with a one-line prompt like "execute §8.x of
REDESIGN_PLAN.md". The system works only if the plan absorbs **all** the judgment:
if the executor ever has to choose a word, a colour, a fallback or a file name, output
quality becomes executor-dependent — which is exactly what this workflow exists to
prevent. A complete plan makes the executor's quality ceiling equal to the planner's.

## Which role are you in?

- The owner said **"plan amend"** (any casing/hyphenation) or asked for a change to be
  planned → you are the **planner**. Do not implement the change. Your deliverable is
  the amended plan, committed and pushed.
- The owner said **"execute Phase N / §N.x"** → you are the **executor**. Build exactly
  what the cited section says and nothing it doesn't.
- If the owner says "plan amend" but clearly also wants it live now ("…and ship it"),
  plan first — write the full amendment — then execute your own plan. The amendment
  still gets written; it is the record the next session relies on.

## The plan document

`REDESIGN_PLAN.md` at the repo root is the single source of truth. Conventions:

- Small/medium increments: append a `### 8.x <title> (added DD Mon YYYY, owner-requested)`
  subsection, continuing the numbering. A large multi-page effort gets a new
  `## N. Phase N — <title>` top-level section with its own sub-structure (see Phase 8).
- When an amendment contradicts an earlier section, say so explicitly — "§0.7 is
  superseded on this one point" — so the executor never has to arbitrate between
  sections.
- Foundations already live in the plan; reference them instead of re-deciding:
  §1 design system (Gallery Minimal tokens), §4 testing protocol, §5 copy voice,
  §7.2 contrast floor, §8.0 event facts (25 Sep 2026, 4 PM → 9:30 AM, 17.5 h,
  2 stages, 800 capacity).

## Planner role

Work in this order:

1. **Understand before deciding.** Read the current code the change touches, check the
   live site (sonicpulsefestival.com) if the request references it, pull any assets the
   owner mentions (Google Drive share link works via
   `https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t`).
   A plan written against a stale mental model produces executor-stopping surprises.

2. **Make every call now.** Anything you leave open becomes the executor's decision —
   treat each open question as a bug in your plan. In particular:
   - **All user-facing copy, verbatim.** Names, hooks, descriptions, lore, empty-state
     messages, error text, email copy. The executor types words; it never writes them.
   - **Hide vs delete.** When the owner says "for now" or "they'll come back", gate
     behind one flag in `src/data/` (pattern: `TICKETS_LIVE`, §8.9) so restoration is a
     one-line flip — and say in the plan what the flag gates, surface by surface,
     including server-side API gating. Only delete when the owner's intent is clearly
     permanent, and then also delete newly-orphaned assets and components (grep first).
   - **Failure modes.** What renders when a table doesn't exist yet, an env var is
     missing, an asset hasn't been supplied. Placeholders are designed by you (styled,
     on-system), never improvised by the executor.
   - **Execution order and scope fences** — what to build first, and what NOT to touch
     (e.g. "First Pulse, admin, and existing tickets are unaffected").

3. **Pre-stage what the executor can't fetch.** The executor may have no Drive access,
   no owner to ask, no design taste to lean on:
   - Images: download, optimize (WebP, sized for web — posters ~1200w, panels ~1600w),
     commit under `public/images/<area>/<slug>.webp`, and reference those exact paths.
   - Database: write the SQL to `supabase-<feature>.sql` at the repo root, give it to
     the owner to run, and spec the code to degrade gracefully if the table is missing.
   - New fonts, icons, fixtures: same principle — in the repo before the plan ships.

4. **Write the amendment self-contained.** The test: an executor with zero conversation
   context, reading only REDESIGN_PLAN.md, must be able to build it. Exact file paths
   for every create/edit/delete. Copy in quotes. Data shapes sketched. Verification
   gates listed (§4 protocol plus any change-specific greps).

5. **Ship the plan.** Commit on the designated `claude/*` working branch with a message
   describing the plan (not the future feature as if built), push, and reply to the
   owner with: the judgment calls you made, anything only they can do (run SQL, supply
   missing art — flag these loudly), and the exact executor invocation to use.

### Executor-grade checklist (run before shipping the plan)

- Every word of user-facing copy is written out.
- Every touched file is named; every referenced asset exists in the repo at that path.
- No sentence contains "choose", "something like", "as appropriate", or an unresolved
  "or". If two options survived your thinking, pick one and record it.
- Failure/empty/missing states are specified.
- Reversibility is stated: what flag restores it, or that it is a permanent delete.
- Verification gates and regression greps are listed with pass criteria.

## Executor role

- Read the cited section fully, plus §1, §4, §5 and §7.2 before writing code. Follow
  the plan verbatim — copy is typed exactly, paths are used exactly. Deviating "to
  improve" defeats the workflow: improvements belong in the next amendment.
- If the plan is ambiguous or contradicts the codebase, that is a planner bug — flag it
  to the owner rather than silently deciding, unless the resolution is mechanical
  (typo-level). Record what you flagged.
- Verify like Phase 8 did: `npx tsc --noEmit`; `npm run lint` (only pre-existing
  failures allowed — baseline with `git stash -u` if unsure which are yours);
  `npm run build`; dev-server smoke test with `curl` content checks for the new/changed
  copy; Playwright at 1280×800 and 375×812 with `scrollWidth - clientWidth === 0` on
  every touched page; the plan's regression greps.
- Git: commit on the designated `claude/*` branch and push. Merging to `main`
  deploys via Vercel — do it when the owner has asked to ship (this owner's standing
  pattern), then poll the live site until the change is verifiably visible. Never leave
  a "deployed" claim unverified.

## House rules (both roles)

- Gallery Minimal system: black canvas, magenta `#FF3FC2` as the **only** accent,
  Montserrat, 24px card radius, pill buttons, `touchAction: 'manipulation'` on every
  interactive element, `100svh`, §7.2 contrast floor on all text.
- Copy voice (§5): sentence case, no exclamation marks, no "amazing/epic/insane",
  never "please". Locked names (the Nine Echoes, the activities, First Pulse) are never
  renamed, translated or paraphrased — the full lockup is `NAME · Tail`.
- The plan is append-only history: never rewrite old sections to match new reality;
  supersede them explicitly in the new amendment.
