---
name: sync-guide
description: Update the Connect build-guide artifact with real screenshots and current phase statuses after new code is wired. Use whenever mobile screens change, a phase ships, or the user asks for the guide/artifact to be updated or linked. The user has a standing instruction that the guide gets REAL screenshots (never hand-drawn mockups) whenever new code lands.
---

# Sync the Connect build-guide artifact

You are executing a maintenance procedure, not redesigning the guide. Follow
it exactly; where it says verify, verify — every rule below exists because
skipping it produced a real defect in this repo's history.

## Ground truth

- **Source of truth**: `docs/build-guide/connect-app-guide.html` in this repo
  (~1 MB: base64 screenshots are embedded). Edit this file, republish it,
  commit it. Never edit a scratchpad copy — scratchpads die with the session.
- **Artifact URL** (always republish to this exact URL via the Artifact
  tool's `url` parameter, or you will mint a new link and break the user's
  bookmark): `https://claude.ai/code/artifact/a29cb148-f722-4da5-96a3-4f663633f60b`
- **Favicon**: pass the same emoji on every republish (a changed favicon
  reads as a different page). Use `🎫` unless you can see that a previous
  publish in your own session used something else — then keep that.

## Non-negotiable rules

1. **Never Read the whole HTML file.** Single base64 `<img>` lines exceed
   the Read tool's token cap. Locate landmarks with `grep -n`, inspect small
   ranges with `sed -n 'A,Bp'`, and splice bulk changes with Python
   line-slicing (read lines, replace a slice, write back).
2. **Screenshots come from the running app, never redrawn by hand.** The
   guide once drifted stale because its showcase was hand-illustrated while
   only the surrounding text got updated — the user caught it twice.
3. **Crop before embedding.** Raw 430x932 captures of short screens are
   mostly black void. Use `python3 .claude/skills/sync-guide/crop-screenshot.py
   in.png out.png` (it excludes the always-present tab bar from the content
   scan — a naive scan returns full height every time). Pass `--full` only
   when the tab bar itself is the point of the shot.
4. **Look at every image you embed** (Read the cropped PNG) before splicing
   it in. Exit codes do not prove a screenshot shows the right state.
5. Text updates (phase copy, status badges) and image updates are separate
   edits — doing one is not doing the other. Check both every time.

## Procedure

1. **Capture**: follow the `verify-mobile` skill's steps 1–4 to export the
   app, serve `mobile/dist/`, and drive it with Playwright at viewport
   430x932. Navigate to each changed screen (verify-mobile documents the
   onboarding preamble, the 3.5 s demo approval timer, and every selector
   trap) and screenshot each state the guide showcases.
2. **Crop** each capture with the helper, then Read each result to confirm
   content fills the frame with no dead black region.
3. **Embed**: the showcase lives in `<section class="showcase">` (find it
   with `grep -n 'class="showcase"'`; its closing `</section>` is the first
   one after it). Each phone is a `.shot-unit`:

   ```html
   <div class="shot-unit">
     <span class="shot-tag good">SHIPPED</span>   <!-- good | amber PARTIAL | muted PLANNED -->
     <div class="shot-frame">
       <div class="shot-island"></div>
       <div class="shot-screen"><img src="data:image/png;base64,..." alt="..."></div>
     </div>
     <p class="shot-caption"><strong>Title.</strong> One-line description.
       <span class="shot-fine">fine print</span></p>
   </div>
   ```

   Base64-encode with `base64 -w0 shot.png`. Replace existing units by line
   range; add new ones before the section's `</section>`.
4. **Update statuses**: phase badges use `.phase-status` classes with the
   Shipped / Partial / Planned convention (Shipped = real click-tested code,
   Partial = real screen backed by a mock, Planned = mockup only). When a
   phase's backing changed (e.g. a mock became real), update BOTH its badge
   and its body text, and the showcase `.shot-tag` for any related shot.
5. **Verify locally before publishing**: load the file in headless Chromium
   (`file://` URL is fine) and assert zero console errors and every
   `<img>`'s `naturalWidth > 0`. A truncated base64 splice fails exactly
   here and nowhere else.
6. **Publish**: Artifact tool, `file_path` = the repo file, `url` = the URL
   above, stable favicon, a short version `label` naming what changed.
7. **Commit** the changed HTML (message: what screens/statuses changed) and
   push. Then give the user the artifact link.

## Report format

End with: which shots were replaced/added, which phase badges changed, the
artifact link, and the commit hash. If any screen could not be captured
(e.g. a state needs live Supabase), say so explicitly instead of
substituting a drawing.
