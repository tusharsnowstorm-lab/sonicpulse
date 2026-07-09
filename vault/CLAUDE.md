# Second Brain — Vault Conventions

This directory is an Obsidian vault organized as a **pipeline, not a filing cabinet**.
Knowledge flows through stages; it is never sorted into topic folders.

```
inbox/  →  projects/  →  output/  →  wiki/
capture     work         ship        distill
```

## The stages

| Stage | What lives here | Rules |
|---|---|---|
| `inbox/` | Raw captures: thoughts, links, quotes, half-ideas | Zero friction. No organizing, no naming standards, no tags. Just get it down. |
| `projects/` | Active work-in-progress | **One file per project.** Everything about a project — research, drafts, decisions, TODOs — stays in that one file. |
| `output/` | Shipped artifacts | Final posts, published code links, delivered docs. Plus the archived project file once it's harvested. |
| `wiki/` | Distilled, evergreen knowledge | See THE RULE below. |

## THE RULE

> **Wiki articles are harvested from finished projects, never written directly.**

Nothing enters `wiki/` by hand. A wiki article exists only because a project
shipped and its durable lessons were extracted with `/harvest`. If an idea
feels wiki-worthy but hasn't been through a project, it goes to `inbox/` or
into a project file — not to `wiki/`. This keeps the wiki 100% earned
knowledge: things actually learned by doing, not things merely collected.

## How knowledge moves

- **inbox → projects**: when a capture becomes actionable, fold it into the
  relevant project file (or start a new one) and delete the inbox note.
  Inbox items are disposable; the inbox should trend toward empty.
- **projects → output**: when the artifact ships, the artifact (or a pointer
  to it) goes in `output/`.
- **projects → wiki**: run `/harvest <project>` after shipping. It extracts
  evergreen lessons into wiki articles and archives the project file to
  `output/`.
- **Nothing moves backward.** A wiki article that turns out to be wrong gets
  edited during the next harvest that touches it, or deleted.

## Conventions

- **Plain markdown only.** No Obsidian plugins, no Dataview, no templater
  syntax. `[[wikilinks]]` are fine (plain Obsidian) — use them between wiki
  articles and from project files to wiki articles.
- Every stage folder has an `_index.md` that maps its contents. **Keep these
  current** — whenever a file is added, moved, or removed, update the
  `_index.md` of every affected stage.
- Project files: `projects/<kebab-case-name>.md`, starting with a one-line
  goal and a `Status:` line (`active`, `stalled`, `shipped`).
- Wiki articles: `wiki/<kebab-case-topic>.md`, titled by topic, written to be
  true in five years. Each ends with a `Harvested from:` line naming the
  source project(s).
- Inbox files: any name at all. Timestamps like `2026-07-09-whatever.md` are
  handy but not required — friction is the enemy.

## What Claude Code should do here

- When given a loose thought to save: write it to `inbox/`, nothing more.
- When asked to work on a project: work inside its single project file.
- When asked to add something to the wiki directly: **refuse and cite THE
  RULE**; offer to capture it to `inbox/` or a project file instead.
- After any file operation, update the affected `_index.md` files.
