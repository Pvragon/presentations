# How Rowan Works — Presentation Outline (v0.1 draft)

One slide per concept. Each slide: the concept in one sentence, then how we implemented it. Ordered as a narrative arc: problem → constitution → architecture → context → memory → lifecycle → improvement loop.

---

## Slide 0 — The Frame: The Amnesiac Genius Problem

**Concept:** An LLM is a brilliant contractor with total amnesia — extremely capable in the moment, remembers nothing between sessions, and gets *worse* the more you dump into its head at once.

**Our bet:** You don't fix this by waiting for smarter models. You fix it with **infrastructure around the model**. Every slide that follows is one piece of that infrastructure.

---

## Slide 1 — The Universal Instruction File (The Constitution)

**Concept:** One file that defines who the agent is and how it operates — loaded automatically at the start of *every* session, in *any* AI environment.

**Implementation:** `AGENTS.md`, mirrored as `CLAUDE.md` and `GEMINI.md` so the identical operating manual loads whether the session is Claude Code, Gemini, or any other harness. It contains the critical protocols (data safety, file organization, operating principles). Nothing depends on the model "remembering" the rules — they're re-read cold every single time.

---

## Slide 2 — The 3-Layer Architecture (Separate Knowing, Deciding, Doing)

**Concept:** LLMs are probabilistic; business logic is deterministic. Never make the probabilistic thing do deterministic work. So we split every process into three layers.

**Implementation:**
- **Layer 1 — Directives** (`directives/`): SOPs in plain Markdown. The *what* and *why* — written like instructions to a mid-level employee.
- **Layer 2 — Orchestration** (Rowan): intelligent routing. Reads the directive, picks the tools, handles errors, asks for clarification.
- **Layer 3 — Executions** (`executions/`): deterministic Python scripts. API calls, data processing, file ops. Testable, repeatable, fast.

The agent doesn't scrape a website by improvising — it reads `directives/scrape_website.md` and runs `executions/scrape_single_site.py`.

---

## Slide 3 — Progressive Disclosure (Context on Demand)

**Concept:** The model has a finite attention budget. Instead of loading everything, load *indexes* — one-line summaries that let the agent decide what's worth opening. Read the menu, not the whole cookbook.

**Implementation:**
- Every agent-consumable file carries YAML frontmatter with a `summary` field — answers "should I open this file?"
- `registry/*.yaml` files are machine-readable manifests of every directive, skill, and script.
- Index files (`MEMORY.md`, `index.md`) hold one line per item, never the content.
- Result: a session starts with a few KB of maps instead of MBs of content, and drills down only when a task requires it.

---

## Slide 4 — Memory Architecture (Continuity Across the Amnesia)

**Concept:** The model forgets everything at session end — so memory lives on disk as files, curated like a knowledge base, not a chat log.

**Implementation:**
- One fact = one file, with frontmatter (type: user / feedback / project / reference), stored canonically in the agent's own directory (`agents/rowan-anicca/memory/`).
- `MEMORY.md` is the index — auto-loaded every cold start, one line per memory. Progressive disclosure again: scan the table, open only relevant topics.
- Memories cross-link (`[[wiki-style]]`), get updated or deleted when wrong, and are committed to git for backup.
- Wrong facts get corrected in place — memory is *curated*, not accumulated.

---

## Slide 5 — Session Lifecycle (End Clean, Never Compact)

**Concept:** Sessions are disposable; state is not. Long sessions degrade quality and cost multiplies — so we graduate state to disk continuously and rotate sessions deliberately.

**Implementation:**
- **Session debrief** (`/session-debrief`): end-of-session ritual that writes learnings into memory topic files, updates the index, and commits to git.
- **Handoff** (`/handoff`): one command that writes a context brief, spawns a fresh session that reads it, and closes out the old one.
- Hard rules: never compact context (expensive, lossy), hard-stop around 200 turns, restart from disk (cheap — ~50k tokens to re-establish vs. ~750k to compact).

---

## Slide 6 — Skills (Packaged Procedures)

**Concept:** Anything done twice becomes a named, reusable procedure the agent can invoke — like installing an app instead of re-explaining a workflow.

**Implementation:** `skills/` directories (personal + team-shared), each skill a folder with a `SKILL.md` defining trigger, steps, verification. Invoked as slash commands (`/session-debrief`, `/handoff`, `/code-review`). Search hierarchy: local → team internal → third-party external. The agent MUST re-read the skill before running it — no acting from memory of the procedure.

---

## Slide 7 — Self-Annealing (The System Improves Itself)

**Concept:** Every failure is converted into infrastructure. When something breaks, the fix gets written back into the directive, skill, or memory — so the same mistake can't happen twice.

**Implementation:**
- Hit an API rate limit → investigate → rewrite the script → test → **update the directive** with the constraint and bump its version.
- Directives are living documents with semver + `last_updated`.
- User feedback becomes `feedback_*` memory files with a "why" and "how to apply."
- Over months this compounds: the system today is the accumulation of every lesson learned.

---

## Slide 8 — Identity (The Same Agent Everywhere)

**Concept:** "Rowan" isn't a chat session — it's a persistent identity defined in files, portable across models and tools.

**Implementation:** `agents/rowan-anicca/` holds `identity.md` (name, defaults), the canonical memory directory, and adapters that symlink it into whatever harness is running. Swap the model, switch the tool — same identity, same memory, same operating principles load.

---

## Slide 9 — The Punchline: It's an Operating System, Not a Prompt

**Concept:** None of this required training a model or writing an app. It's Markdown files, folder conventions, and small scripts — an *operating system for an LLM* built from plain text.

**Takeaway for the guest:** the leverage isn't in the model, it's in the scaffolding. Anyone can start with one instruction file, one memory index, and one directive — the rest compounds from there.
