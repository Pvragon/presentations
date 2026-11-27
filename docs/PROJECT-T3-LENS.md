---
template: project-t3-lens
version: 0.1.0
summary: >-
  The T3 lens for presentations: operating rules that apply in this repo and nowhere else, loaded on top of
  the shared workspace core. Hand-written; the one file in the rules chain a person edits.
created: 2026-11-27
last_updated: 2026-11-27
maintainer: rowan-anicca
status: active
---

> The shared core (`~/ai-workspace/team-lib/context/global/OPERATING-CORE.md`) loads through
> `projects/CLAUDE.md`. The repo-root `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` are **generated** from this
> file. Edit this file, then rebuild:
> `python3 ~/ai-workspace/team-lib/executions/build_operating_core.py --project . --apply`

# Project rules — presentations

What this project is → `README.md`.

This project has no rules of its own yet; the shared core governs. Add a rule here as `## B1. <rule>`
when a real failure pays for it, with one line on why. What the project is and how it works belong in
`README.md` or `context/`, not here. Lessons go in `memory/`; decisions with their reasons in `decisions/`.
