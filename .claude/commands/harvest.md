---
description: Harvest a shipped project in vault/ — distill its lessons into wiki articles and archive it
argument-hint: [project-name]
---

Harvest a finished project from the second-brain vault at `vault/`
(pipeline: inbox → projects → output → wiki). Project to harvest: $ARGUMENTS

Follow these steps exactly:

1. **Locate the project.** Find `vault/projects/$ARGUMENTS.md` (fuzzy-match
   the name if needed). If no argument was given, list the project files in
   `vault/projects/` with their `Status:` lines and ask which one to harvest.

2. **Verify it actually shipped.** Harvesting is only allowed for finished
   work — that's what keeps the wiki trustworthy. Check that the project's
   `Status:` is `shipped` and/or that a corresponding artifact exists in
   `vault/output/`. If it hasn't shipped, STOP and say so; do not write any
   wiki content for an unshipped project.

3. **Read the project file end-to-end** and extract the durable lessons:
   things learned by doing that will still be true and useful in five years.
   Skip logistics, dead ends with no lesson, and anything project-specific
   with no transferable value. Expect a shipped project to yield roughly 1–3
   articles; zero is a legitimate answer — never pad.

4. **Write or update wiki articles** in `vault/wiki/`:
   - One topic per file, `kebab-case-topic.md`, written timelessly (no "we",
     no project narrative — state the knowledge directly).
   - If an article on the topic already exists, merge the new lesson into it
     rather than creating a near-duplicate; correct anything the new
     experience proved wrong.
   - Cross-link related articles with `[[wikilinks]]`.
   - End each touched article with (or append to) a `Harvested from:` line
     naming this project.

5. **Archive the project.** Move the project file from `vault/projects/` to
   `vault/output/`, keeping its name. Ensure the shipped artifact (or a
   pointer/link to it) is present in `vault/output/`.

6. **Update the maps.** Refresh the `## Contents` listings in
   `vault/projects/_index.md`, `vault/output/_index.md`, and
   `vault/wiki/_index.md` to reflect every file added, moved, or removed.

7. **Report.** Summarize which wiki articles were created or updated and
   what was archived, so the harvest is auditable.

Remember THE RULE from `vault/CLAUDE.md`: wiki articles are harvested from
finished projects, never written directly. This command is the only path
into `vault/wiki/`.
