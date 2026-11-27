# Memory Index (project)

Lessons about this project, one per file, written at the end of a step or a session debrief. Ranked by the same two-strength score as the agent's memory index: `(access_count + 1) * exp(-days_since_last_access / stability) + 0.6 * importance`. **Do not hand-edit or hand-merge this file.** It is regenerated from the files' `summary:` frontmatter by `rerank_memory_index.py --memory-dir <this folder>`; after a branch merge, regenerate it instead of resolving conflicts. Overflow rolls to `MEMORY-archive.md`, and no file is ever deleted.

## Hot (auto-loaded)

| Topic File | Summary |
|------------|---------|

## Critical (importance ≥ 8 — never rolls off, regardless of score)

These did not make Hot on score but are too important to drop out of view. Open the one that matches what you are about to do.

| Topic File | Summary |
|------------|---------|
| _(none — every critical memory is already Hot)_ | |

## New (born within 14 days — visible on birth, rank not yet earned)

**0 of 0 born in the window are shown.** Newest first. These have not been read enough to compete on score; they are here so they *can* be. Reading one reinforces it, and it graduates to Hot/Cold on merit when its grace window closes.

| Topic File | Summary |
|------------|---------|
| _(none — nothing written in the last 14 days)_ | |

## Cold (one Read away — reading re-warms; overflow rolls to `MEMORY-archive.md`)

| Topic File | Summary |
|------------|---------|

## How to Use

1. Scan **Hot** and **New** for lessons relevant to what you are about to change; open only those.
2. To add a lesson, write one new file `feedback_*.md`, `reference_*.md` or `project_*.md` in this folder with `summary:` and `created:` frontmatter and a `**Why:**` line. The next rerank indexes it.
3. A lesson that holds across projects, or is about how work is done, belongs in the agent's memory instead. Promoting a lesson into the project lens or the shared core is proposed, never done here.
