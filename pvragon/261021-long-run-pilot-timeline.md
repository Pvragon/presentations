---
version: 0.1.0
last_updated: 2026-10-21
---

# Timeline of the deckwright-build pilot

<!-- generated-at: 2026-10-21T22:14:26Z -->

Source: run dir `261021-deckwright-long-run`, data cut off at 10-21 22:00Z / 15:00 PT. PT is America/Los_Angeles.
Pilot findings (P-NN) are in 261021-deckwright-pilot-findings.md.

## Summary numbers

- **Wall-clock span:** 10-21 07:20Z / 00:20 PT to 10-21 21:59Z / 14:59 PT, 14.7 h (run state when generated: RUNNING).
- **Shifts:** 7; endings: clean rotation 3, hand rotation 1, still running at cutoff 1, watchdog kill 2.
- **Features:** planned 126 at the first freeze, 155 at cutoff; 29 added: fitness walk 2 7, fitness walk 3 15, gate B r1 1, gate B r2 1, gate C r1 1, gate C r3 1, gate F r1 1, logged defects 2.
- **Passing at cutoff (latest verify log exit 0):** 152 of 155.
- **First-pass throughput:** 155 features first passed between 10-21 08:06Z / 01:06 PT and 10-21 21:23Z / 14:23 PT, 11.7 per hour over that span.
- **Gates:** A: r1 FAIL, r2 PASS-WITH-RESIDUALS; B: r1 FAIL, r2 FAIL, r3 PASS; C: r1 FAIL, r2 PASS, r3 PASS-WITH-RESIDUALS; D: r1 FAIL; E: r1 PASS; F: r1 FAIL, r2 PASS; PLAN: r1 PASS (13 rounds, 7 passed).
- **Fitness walks:** walk 1 (skeleton) FAIL at 10-21 09:21Z / 02:21 PT; walk 2 (about 60%) FAIL at 10-21 12:26Z / 05:26 PT; walk 3 (final) FAIL at 10-21 19:23Z / 12:23 PT.
- **Relaunches (STATE.relaunches):** 4; watchdog kills in the log: 3.
- **Verify runs:** 1077 logs; exit codes 0: 609, 1: 20, 124: 14, 2: 26, 4: 408.
- **Lanes:** 82; conflict 12, merged 53, open 3, removed 14. Product commits on the run branch since creation: 73 (22 merges).
- **Harness commits during the run:** 22.
- **Jaime's messages (interventions):** 25 (24 after the run was created); scheduled /loop wakes, not counted: 10.
- **Recap ticks:** 39 "※ recap" lines by the supervisor; 13 built-in away summaries; 1 alert line(s).
- **Regressions (passed, then failed):** 12 episodes across 11 features; median time-to-catch 53 min, median time-to-fix 13 min.

### Shifts

| shift | start | end | length | how it ended | report |
| --- | --- | --- | --- | --- | --- |
| 1 | 10-21 07:56Z / 00:56 PT | 10-21 11:31Z / 04:31 PT | 3.6 h | hand rotation (inferred: no shift-end record and no watchdog kill) | `shifts/01-report.md` |
| 2 | 10-21 11:31Z / 04:31 PT | 10-21 11:44Z / 04:44 PT | 13 min | watchdog kill at 11:44Z (idle session longrun-deckwright-build-s2, heartbeat 6m) | `shifts/02-report.md` |
| 3 | 10-21 11:44Z / 04:44 PT | 10-21 14:35Z / 07:35 PT | 2.9 h | clean rotation (harness shift end, context 540888) | `shifts/03-report.md` |
| 4 | 10-21 14:36Z / 07:36 PT | 10-21 17:33Z / 10:33 PT | 3.0 h | clean rotation (harness shift end, context 521385) | `shifts/04-report.md` |
| 5 | 10-21 17:33Z / 10:33 PT | 10-21 19:23Z / 12:23 PT | 110 min | clean rotation (harness shift end, context 384026) | `shifts/05-report.md` |
| 6 | 10-21 19:24Z / 12:24 PT | 10-21 20:45Z / 13:45 PT | 81 min | watchdog kill at 20:45Z (idle session longrun-deckwright-build-s6, heartbeat 5m (idle on two c…) | `shifts/06-report.md` |
| 7 | 10-21 20:45Z / 13:45 PT | not recorded | not recorded | still running at cutoff (no end recorded) | not recorded |

### First passes per hour

| hour (UTC / PT) | first passes |
| --- | --- |
| 10-21 08:00Z / 01:00 PT | 27 |
| 10-21 09:00Z / 02:00 PT | 6 |
| 10-21 10:00Z / 03:00 PT | 10 |
| 10-21 11:00Z / 04:00 PT | 29 |
| 10-21 12:00Z / 05:00 PT | 32 |
| 10-21 13:00Z / 06:00 PT | 19 |
| 10-21 14:00Z / 07:00 PT | 8 |
| 10-21 15:00Z / 08:00 PT | 1 |
| 10-21 16:00Z / 09:00 PT | 3 |
| 10-21 17:00Z / 10:00 PT | 2 |
| 10-21 18:00Z / 11:00 PT | 1 |
| 10-21 19:00Z / 12:00 PT | 7 |
| 10-21 20:00Z / 13:00 PT | 7 |
| 10-21 21:00Z / 14:00 PT | 3 |

### Features added after the plan froze

| feature | source | decision | from_finding |
| --- | --- | --- | --- |
| F-127 | fitness walk 2 | D-27 | not recorded |
| F-128 | fitness walk 2 | D-27 | Gate D r1 |
| F-129 | fitness walk 2 | D-27 | not recorded |
| F-130 | fitness walk 2 | D-27 | not recorded |
| F-131 | fitness walk 2 | D-27 | Gate D r1 |
| F-132 | fitness walk 2 | D-27 | not recorded |
| F-133 | fitness walk 2 | D-27 | not recorded |
| F-134 | logged defects | D-28 | not recorded |
| F-135 | logged defects | D-28 | not recorded |
| F-136 | gate C r1 | D-33 | not recorded |
| F-137 | gate F r1 | D-34 | not recorded |
| F-138 | gate B r1 | D-37 | not recorded |
| F-139 | gate B r2 | D-39 | not recorded |
| F-140 | fitness walk 3 | D-40 | FW3-01 |
| F-141 | fitness walk 3 | D-40 | FW3-02 |
| F-142 | fitness walk 3 | D-40 | FW3-03 |
| F-143 | fitness walk 3 | D-40 | FW3-04 |
| F-144 | fitness walk 3 | D-40 | FW3-05 |
| F-145 | fitness walk 3 | D-40 | FW3-06; Gate D r1 |
| F-146 | fitness walk 3 | D-40 | FW3-06 |
| F-147 | fitness walk 3 | D-40 | FW3-07 |
| F-148 | fitness walk 3 | D-40 | FW3-08 |
| F-149 | fitness walk 3 | D-40 | FW3-09 |
| F-150 | fitness walk 3 | D-40 | FW3-09 |
| F-151 | fitness walk 3 | D-40 | FW3-10; Gate D r1 |
| F-152 | fitness walk 3 | D-40 | FW3-11; Gate D r1 |
| F-153 | fitness walk 3 | D-41 | FW3-10 |
| F-154 | fitness walk 3 | D-42 | FW3-05 |
| F-155 | gate C r3 | D-45 | C-r3-01; E-r2-01; E-r2-02 |

## Timeline



- `10-21 07:17Z / 00:17 PT` **Jaime** "/long-run Okay, so this long run will be in the repo for Deckwright. You can find it. It should be there now.…"
- `10-21 07:20Z / 00:20 PT` **run** run `deckwright-build` created (mode flat, budget 48.0 h)
- `10-21 07:26Z / 00:26 PT` **watchdog** watchdog: launcher exit 0 launched: Claude session 'longrun-deckwright-build-s1'
- `10-21 07:26Z / 00:26 PT` **watchdog** watchdog: stale 6m, no session longrun-deckwright-build-s0
- `10-21 07:30Z / 00:30 PT` **harness** harness commit `28041b3` docs(long-run): record toy run r5 result
- `10-21 07:36Z / 00:36 PT` **watchdog** watchdog alert: hung (10m, pane permission), notify: run deckwright-build is waiting on a permission prompt ()
- `10-21 07:53Z / 00:53 PT` **gate** gate PLAN r1: **PASS** (`gates/coverage-r1.md`)
- `10-21 07:55Z / 00:55 PT` **harness** harness commit `0d0e043` fix(long-run): trust-worktree also approves the main repo of a linked git worktree (deckwright-buil…
- `10-21 07:56Z / 00:56 PT` **watchdog** watchdog: idle session longrun-deckwright-build-s1, heartbeat 30m; kill longrun-deckwright-build-s1
- `10-21 07:56Z / 00:56 PT` **watchdog** watchdog: launcher exit 0 launched: Claude session 'longrun-deckwright-build-s1'
- `10-21 07:56Z / 00:56 PT` **shift** shift 1 starts at `1e4fc4e`
- `10-21 07:59Z / 00:59 PT` **auto-recap** The goal is building Deckwright, a Claude Code skill that makes strong, legal Commander decks, and it's now building unattended with all 126 features…
- `10-21 08:02Z / 01:02 PT` **Jaime** "hey so it doesn't seem like it's running. where is it at?"
- `10-21 08:03Z / 01:03 PT` **Jaime** "but where is it running? I don't see it in this session as an agent"
- `10-21 08:03Z / 01:03 PT` **Jaime** "yes open it in a foot window. in general i actually expected you to be running it here as the orchestrator..."
- `10-21 08:15Z / 01:15 PT` **progress** 10 features have passed at least once (the 10th: F-010)
- `10-21 08:20Z / 01:20 PT` **Jaime** "ok so why 48 hour budget btw? The budget should pretty much always be as fast as possible. Also, for any watc…"
- `10-21 08:22Z / 01:22 PT` **Jaime** "yes please do a review in general for speed. Every build should move toward resolution as fast as possible. n…"
- `10-21 08:24Z / 01:24 PT` **harness** harness commit `b19fc14` fix(long-run): minute-scale cadence (cron 1 min, stale 2, hung 3, wakes 60 s), no shift during INTA…
- `10-21 08:34Z / 01:34 PT` **harness** harness commit `0700876` perf(long-run): speed review; parallel verify and check-plan, one-call wake (tick), no duplicate ve…
- `10-21 08:34Z / 01:34 PT` **harness** harness commit `247f0d5` docs(long-run): harness-cli contract matches b19fc14 timers, blocked resume, INTAKE skip, viewer de…
- `10-21 08:37Z / 01:37 PT` **progress** 20 features have passed at least once (the 20th: F-020)
- `10-21 08:39Z / 01:39 PT` **watchdog** watchdog alert: hung (4m, pane busy), notify: run deckwright-build looks hung (pane busy)
- `10-21 08:40Z / 01:40 PT` **harness** harness commit `71c7089` docs(long-run): record toy-speed run result (stale .pyc miss recurred)
- `10-21 08:41Z / 01:41 PT` **harness** harness commit `2188439` docs(long-run): toy-speed result (0.3 h, minute cadence)
- `10-21 08:42Z / 01:42 PT` **harness** harness commit `f3dbda1` feat(long-run): parallel implementer lanes (own git worktree each, merge with one-call landing, con…
- `10-21 08:45Z / 01:45 PT` **harness** harness commit `afdba43` feat(long-run): the launching pane supervises the run (supervise mode, supervise_stream.py change s…
- `10-21 08:45Z / 01:45 PT` **harness** harness commit `e42c1c1` Merge branch 'main' into worktree-agent-a86e9745546ed08dc
- `10-21 08:58Z / 01:58 PT` **harness** harness commit `0fbc690` fix(long-run): certify-ready names open DEFECT/JOB-FAILURE findings before a certifier is dispatche…
- `10-21 08:58Z / 01:58 PT` **harness** harness commit `4d0842c` docs(long-run): toy-lanes result (0.2 h, parallel lanes)
- `10-21 08:59Z / 01:59 PT` **Jaime** "hmmm, are you still building stuff or are you just down to the monitor now?"
- `10-21 09:00Z / 02:00 PT` **Jaime** "ok great. so as the monitor, what's the best way we can make sure that you're sending fairly frequent updates…"
- `10-21 09:00Z / 02:00 PT` **Jaime** "please push any changes you made btw"
- `10-21 09:01Z / 02:01 PT` **harness** harness commit `c15404f` test(long-run): toy-lanes harness-miss fixtures (7) and expected-failure regressions (5)
- `10-21 09:02Z / 02:02 PT` **harness** harness commit `8a17845` feat(long-run): supervise_stream --digest-min: alerts at once, progress rolled into one line per wi…
- `10-21 09:04Z / 02:04 PT` **progress** 30 features have passed at least once (the 30th: F-030)
- `10-21 09:06Z / 02:06 PT` **auto-recap** Deckwright's autonomous build is at 27 of 126 features, with milestone A's code done and the harness speed-up merged and pushed. Next, milestone A's…
- `10-21 09:18Z / 02:18 PT` **gate** gate A r1: **FAIL** (`gates/A-r1.md`)
- `10-21 09:21Z / 02:21 PT` **fitness walk** fitness walk 1 (skeleton): **FAIL** (`fitness/1.md`)
- `10-21 09:25Z / 02:25 PT` **auto-recap** Deckwright, the Commander deckbuilding skill, is being built unattended and is at 30 of 126 features; the first player test failed, mostly on feature…
- `10-21 09:35Z / 02:35 PT` **Jaime** "FYI it turns out that whatever this built in recap skill you have is fantastic. if every 5min or on request y…"
- `10-21 09:35Z / 02:35 PT` to `09:38Z / 02:38 PT` **recaps** ×2, quiet: still 30 of 126 features
- `10-21 09:40Z / 02:40 PT` **gate** gate A r2: **PASS-WITH-RESIDUALS** (`gates/A-r2.md`)
- `10-21 09:41Z / 02:41 PT` **features** freeze 2 (D-16): 6 verify(s) changed (F-007, F-009, F-012, F-018…)
- `10-21 09:41Z / 02:41 PT` to `09:46Z / 02:46 PT` **recaps** ×2, quiet: still 30 of 126 features
- `10-21 09:47Z / 02:47 PT` **Jaime** "intersting... historically how long are we taking for each feature?"
- `10-21 09:51Z / 02:51 PT` **recap** Deckwright is being built unattended and is at 30 of 126 features, starting milestone B. It's still using one serial builder, not parallel lanes. Nex…
- `10-21 09:53Z / 02:53 PT` **Jaime** "yeah let's go for that and we can reduce our monitor frequency to 10min. ultimately i think we have an opport…"
- `10-21 09:56Z / 02:56 PT` **Jaime** "overnight you can take it to 98%"
- `10-21 09:59Z / 02:59 PT` **auto-recap** Deckwright, the Commander deckbuilding skill, is being built unattended at 30 of 126 features, with a 98% usage ceiling overnight. Next, I raise para…
- `10-21 10:14Z / 03:14 PT` **recap** Deckwright is being built unattended and is at 33 of 126 features, three more in the last 10 minutes. It's still using one builder at a time, so the…
- `10-21 10:25Z / 03:25 PT` to `10:28Z / 03:28 PT` **recaps** ×2, quiet: still 39 of 126 features
- `10-21 10:31Z / 03:31 PT` **Jaime** "ok you're clear. system is yours till 9am. go ham on it lol"
- `10-21 10:32Z / 03:32 PT` **progress** 40 features have passed at least once (the 40th: F-040)
- `10-21 10:32Z / 03:32 PT` **Jaime** "great. thanks Rowan!"
- `10-21 10:46Z / 03:46 PT` **recap** Deckwright is being built unattended and is at 43 of 126 features, four more in the last 10 minutes. The four-feature batch landed, but the shift dis…
- `10-21 10:47Z / 03:47 PT` **harness** harness commit `896e052` chore(version): reconcile 32 file(s) versioned outside the push gate
- `10-21 11:03Z / 04:03 PT` **recap** Deckwright is being built unattended and is at 43 of 126 features. The current builder is 31 minutes into a slow, polite tournament-deck sync for F-0…
- `10-21 11:15Z / 04:15 PT` **recap** Deckwright is being built unattended and is at 44 of 126 features; F-042's tournament-deck sync landed. Next, the moment batch 15 reports, the rotati…
- `10-21 11:26Z / 04:26 PT` **recap** Deckwright is being built unattended and is at 47 of 126 features. Shift 1 has ignored both the rotate note and the lowered threshold, so I'll rotate…
- `10-21 11:31Z / 04:31 PT` **shift** shift 1 ends: hand rotation (inferred: no shift-end record and no watchdog kill) after 3.6 h
- `10-21 11:31Z / 04:31 PT` **shift** shift 2 starts at `1b6a08d`
- `10-21 11:40Z / 04:40 PT` **progress** 50 features have passed at least once (the 50th: F-070)
- `10-21 11:41Z / 04:41 PT` **lane conflict** lane L4 (F-058, F-059, F-060) merge conflict on deckwright/cli.py
- `10-21 11:42Z / 04:42 PT` **lane conflict** lane L5 (F-061, F-062, F-063) merge conflict on deckwright/cli.py
- `10-21 11:43Z / 04:43 PT` **recap** Deckwright is being built unattended. Shift 2 is now running all 6 lanes in parallel: 55 of 126 features pass, with 6 more in the last 10 minutes and…
- `10-21 11:44Z / 04:44 PT` **watchdog** watchdog: idle session longrun-deckwright-build-s2, heartbeat 6m; kill longrun-deckwright-build-s2
- `10-21 11:44Z / 04:44 PT` **watchdog** watchdog: launcher exit 0 launched: Claude session 'longrun-deckwright-build-s3'
- `10-21 11:44Z / 04:44 PT` **shift** shift 2 ends: watchdog kill at 11:44Z (idle session longrun-deckwright-build-s2, heartbeat 6m) after 13 min
- `10-21 11:44Z / 04:44 PT` **shift** shift 3 starts at `477b718`
- `10-21 11:45Z / 04:45 PT` **lane conflict** lane L3 (F-055, F-056, F-057) merge conflict on deckwright/cli.py
- `10-21 11:45Z / 04:45 PT` **lane conflict** lane L10 (F-061, F-062, F-063) merge conflict on deckwright/cli.py
- `10-21 11:47Z / 04:47 PT` **harness** harness commit `8a948e5` fix(long-run): watchdog kills an idle-looking shift only on two consecutive checks with no heartbea…
- `10-21 11:47Z / 04:47 PT` **recap** Deckwright is being built unattended and is at 58 of 126 features. Shift 3 recovered from the watchdog's mistaken kill, and the fix that stops it hap…
- `10-21 11:47Z / 04:47 PT` **progress** 60 features have passed at least once (the 60th: F-056)
- `10-21 11:48Z / 04:48 PT` **lane conflict** lane L13 (F-061, F-062, F-063) merge conflict on deckwright/cli.py
- `10-21 11:57Z / 04:57 PT` **progress** 70 features have passed at least once (the 70th: F-093)
- `10-21 11:58Z / 04:58 PT` **features** freeze 3 (D-25): 1 verify(s) changed (F-040)
- `10-21 11:59Z / 04:59 PT` **recap** Deckwright is being built unattended and is at 70 of 126 features. That's 12 in the last 10 minutes from 10 commits, the fastest stretch of the run s…
- `10-21 12:04Z / 05:04 PT` **lane conflict** lane L16 (F-094, F-095, F-096) merge conflict on deckwright/cli.py
- `10-21 12:10Z / 05:10 PT` **recap** Deckwright is being built unattended and is at 79 of 126 features, 7 more in the last 10 minutes. A player walk is now running alongside the builders…
- `10-21 12:13Z / 05:13 PT` **progress** 80 features have passed at least once (the 80th: F-074)
- `10-21 12:17Z / 05:17 PT` **regression** F-025 fails again (exit 1) at `0a5e9fd`; caught by targeted verify (this feature alone), run right after lane L24's merge
- `10-21 12:18Z / 05:18 PT` **alert** Alert: F-025 is failing again. That's the core rule that no illegal deck is ever shown, so it can't be shrugged off.
- `10-21 12:18Z / 05:18 PT` to `12:21Z / 05:21 PT` **recaps** ×2, quiet: still 87 of 126 features
- `10-21 12:25Z / 05:25 PT` **progress** 90 features have passed at least once (the 90th: F-067)
- `10-21 12:25Z / 05:25 PT` **regression** F-025 passes again after 8 min
- `10-21 12:25Z / 05:25 PT` **regression** F-026 fails again (exit 1) at `c51a231`; caught by targeted verify (2 features at one commit, inferred), run right after lane L26's merge
- `10-21 12:26Z / 05:26 PT` **fitness walk** fitness walk 2 (about 60%): **FAIL** (`fitness/2.md`)
- `10-21 12:26Z / 05:26 PT` **recap** Deckwright is being built unattended and is at 90 of 126 features. F-025 recovered. F-026 fails only because its test predates the HTML report file t…
- `10-21 12:28Z / 05:28 PT` **features** freeze 4 (D-27): +7 features (F-127, F-128, F-129, F-130…), total 133
- `10-21 12:29Z / 05:29 PT` **auto-recap** Deckwright, the Commander deckbuilding skill, is building unattended with six parallel lanes and is at 90 of 126 features. Next, the shift corrects o…
- `10-21 12:37Z / 05:37 PT` **regression** F-026 passes again after 12 min
- `10-21 12:48Z / 05:48 PT` **progress** 100 features have passed at least once (the 100th: F-077)
- `10-21 13:01Z / 06:01 PT` **lane conflict** lane L33 (F-130, F-132) merge conflict on deckwright/cli.py
- `10-21 13:06Z / 06:06 PT` **lane conflict** lane L36 (F-083) merge conflict on skills/deckwright/SKILL.md
- `10-21 13:10Z / 06:10 PT` **lane conflict** lane L1 (F-050, F-051) merge conflict on deckwright/build.py, deckwright/cli.py, tests/test_chat_check.py
- `10-21 13:15Z / 06:15 PT` **progress** 110 features have passed at least once (the 110th: F-112)
- `10-21 13:31Z / 06:31 PT` **features** freeze 5 (D-28): +2 features (F-134, F-135), total 135
- `10-21 13:40Z / 06:40 PT` **progress** 120 features have passed at least once (the 120th: F-135)
- `10-21 13:54Z / 06:54 PT` **lane conflict** lane L39 (F-133, F-069) merge conflict on scripts/chat_check.py
- `10-21 14:23Z / 07:23 PT` **lane conflict** lane L48 (F-133, F-069) merge conflict on scripts/chat_check.py
- `10-21 14:35Z / 07:35 PT` **shift** shift 3 ends: clean rotation (harness shift end, context 540888) after 2.9 h
- `10-21 14:36Z / 07:36 PT` **shift** shift 4 starts at `0d50ba2`
- `10-21 14:43Z / 07:43 PT` **progress** 130 features have passed at least once (the 130th: F-050)
- `10-21 14:46Z / 07:46 PT` **regression** F-109 fails again (exit 1) at `2403c55`; caught by broad verify (47 features at one commit, inferred --fast or --failing), run right after lane L50's merge
- `10-21 14:48Z / 07:48 PT` **regression** F-080 fails again (exit 1) at `2403c55`; caught by broad verify (47 features at one commit, inferred --fast or --failing), run right after lane L50's merge
- `10-21 14:52Z / 07:52 PT` **regression** F-125 fails again (exit 1) at `2403c55`; caught by broad verify (47 features at one commit, inferred --fast or --failing), run right after lane L50's merge
- `10-21 15:01Z / 08:01 PT` **regression** F-080 passes again after 13 min
- `10-21 15:07Z / 08:07 PT` **regression** F-125 passes again after 15 min
- `10-21 15:32Z / 08:32 PT` **gate** gate C r1: **FAIL** (`gates/C-r1.md`)
- `10-21 15:35Z / 08:35 PT` **regression** F-109 passes again after 49 min
- `10-21 15:36Z / 08:36 PT` **features** freeze 7 (D-33): +1 features (F-136), total 136
- `10-21 15:49Z / 08:49 PT` **gate** gate F r1: **FAIL** (`gates/F-r1.md`)
- `10-21 15:49Z / 08:49 PT` **features** freeze 8 (D-34): +1 features (F-137), total 137
- `10-21 16:00Z / 09:00 PT` **features** freeze 9 (D-35): 2 verify(s) changed (F-136, F-137)
- `10-21 16:04Z / 09:04 PT` **Jaime** "ok i'm back and starting work. Can you wind down resources so that we're moving a bit more slowly? Also, i ca…"
- `10-21 16:04Z / 09:04 PT` **Jaime** "i can tell the computer is still working pretty hard though so let's slow it down a bit"
- `10-21 16:05Z / 09:05 PT` **Jaime** "ah i see it now. why did you stop rearming your monitor?"
- `10-21 16:07Z / 09:07 PT` **regression** F-080 fails again (exit 124) at `4256bf7`; caught by lane merge verify (lane L54)
- `10-21 16:10Z / 09:10 PT` **Jaime** "thanks, i can tell the machine is still running a bit hard so please have the shift check in on each one to g…"
- `10-21 16:17Z / 09:17 PT` **gate** gate E r1: **PASS** (`gates/E-r1.md`)
- `10-21 16:18Z / 09:18 PT` **regression** F-080 passes again after 10 min
- `10-21 16:58Z / 09:58 PT` **gate** gate C r2: **PASS** (`gates/C-r2.md`)
- `10-21 17:33Z / 10:33 PT` **gate** gate B r1: **FAIL** (`gates/B-r1.md`)
- `10-21 17:33Z / 10:33 PT` **features** freeze 10 (D-37): +1 features (F-138), total 138
- `10-21 17:33Z / 10:33 PT` **shift** shift 4 ends: clean rotation (harness shift end, context 521385) after 3.0 h
- `10-21 17:33Z / 10:33 PT` **shift** shift 5 starts at `1d1ee52`
- `10-21 17:47Z / 10:47 PT` **regression** F-133 fails again (exit 2) at `0ec27b7`; caught by targeted verify (this feature alone), run right after lane L56's merge
- `10-21 17:49Z / 10:49 PT` **watchdog** watchdog: idle-looking pane longrun-deckwright-build-s5, heartbeat 4m; strike 1, checking again next minute
- `10-21 17:49Z / 10:49 PT` **features** freeze 11 (D-38): 1 verify(s) changed (F-133)
- `10-21 18:03Z / 11:03 PT` **regression** F-133 passes again after 15 min
- `10-21 18:04Z / 11:04 PT` **Jaime** "hey it looks like our monitor length silently increased from every 10min to something higher. can you restore…"
- `10-21 18:04Z / 11:04 PT` **harness** harness commit `c10c16b` docs(long-run): pilot findings from deckwright-build (supervision drift, forgotten re-arm, Monitor…
- `10-21 18:08Z / 11:08 PT` **auto-recap** Deckwright, the Commander deckbuilding skill, is building unattended at 136 of 138 features, with milestone B's and F's gate reviews running. Next, t…
- `10-21 18:15Z / 11:15 PT` to `18:18Z / 11:18 PT` **recaps** ×2, quiet: still 137 of 138 features
- `10-21 18:20Z / 11:20 PT` **gate** gate F r2: **PASS** (`gates/F-r2.md`)
- `10-21 18:24Z / 11:24 PT` **gate** gate B r2: **FAIL** (`gates/B-r2.md`)
- `10-21 18:24Z / 11:24 PT` **features** freeze 12 (D-39): +1 features (F-139), total 139
- `10-21 18:24Z / 11:24 PT` to `18:44Z / 11:44 PT` **recaps** ×4, quiet: still 137 of 139 features
- `10-21 18:46Z / 11:46 PT` **watchdog** watchdog: idle-looking pane longrun-deckwright-build-s5, heartbeat 7m; strike 1, checking again next minute
- `10-21 18:47Z / 11:47 PT` **auto-recap** ※ recap: Deckwright is being built unattended and is at 137 of 139 features, with the shift running a full verify. Next comes gate B's final review r…
- `10-21 18:51Z / 11:51 PT` **regression** F-067 fails again (exit 1) at `0ec27b7`; caught by verify --all (134 features verified at one commit, inferred), run right after lane L56's merge
- `10-21 18:54Z / 11:54 PT` **recap** Deckwright is being built unattended and is at 138 of 139 features. F-139 has landed. Next, the F-133 verify fix, then gate B round 3, the final play…
- `10-21 18:56Z / 11:56 PT` **gate** gate B r3: **PASS** (`gates/B-r3.md`)
- `10-21 19:04Z / 12:04 PT` to `19:14Z / 12:14 PT` **recaps** ×3, quiet: still 138 of 139 features
- `10-21 19:23Z / 12:23 PT` **fitness walk** fitness walk 3 (final): **FAIL** (`fitness/3.md`)
- `10-21 19:23Z / 12:23 PT` **shift** shift 5 ends: clean rotation (harness shift end, context 384026) after 110 min
- `10-21 19:24Z / 12:24 PT` **shift** shift 6 starts at `25ff27f`
- `10-21 19:25Z / 12:25 PT` **recap** Deckwright is being built unattended. All 139 features pass and every gate is done, but the final player walk failed, so it isn't certified yet. The…
- `10-21 19:26Z / 12:26 PT` **features** freeze 13 (D-40): +13 features (F-140, F-141, F-142, F-143…), total 152
- `10-21 19:28Z / 12:28 PT` **watchdog** watchdog: idle-looking pane longrun-deckwright-build-s6, heartbeat 4m; strike 1, checking again next minute
- `10-21 19:34Z / 12:34 PT` **recap** Deckwright is being built unattended and is at 139 of 152 features. Shift 6 turned the final walk's findings into 13 new features, and it opened one…
- `10-21 19:40Z / 12:40 PT` **features** freeze 14 (D-41): +1 features (F-153), total 153
- `10-21 19:41Z / 12:41 PT` **features** freeze 15 (D-42): +1 features (F-154), total 154
- `10-21 19:42Z / 12:42 PT` **progress** 140 features have passed at least once (the 140th: F-140)
- `10-21 19:44Z / 12:44 PT` **watchdog** watchdog: idle-looking pane longrun-deckwright-build-s6, heartbeat 5m; strike 1, checking again next minute
- `10-21 19:45Z / 12:45 PT` to `19:55Z / 12:55 PT` **recaps** ×2, quiet: still 145 of 154 features
- `10-21 20:00Z / 13:00 PT` **regression** F-083 fails again (exit 124) at `888633d`; caught by lane merge verify (lane L61)
- `10-21 20:05Z / 13:05 PT` **recap** Deckwright is being built unattended and is still at 145 of 154 features, with no new passes for 20 minutes. Next, the remaining 9 walk-3 fixes, then…
- `10-21 20:06Z / 13:06 PT` **regression** F-083 passes again after 7 min
- `10-21 20:14Z / 13:14 PT` **recap** Deckwright is being built unattended and is at 146 of 154 features, so progress has restarted. Next, the remaining 8 walk-3 fixes, then the next play…
- `10-21 20:24Z / 13:24 PT` **lane conflict** lane L60 (F-142, F-141) merge conflict on deckwright/cli.py
- `10-21 20:25Z / 13:25 PT` to `20:36Z / 13:36 PT` **recaps** ×2, quiet: still 147 of 154 features
- `10-21 20:38Z / 13:38 PT` **features** freeze 16 (D-43): 1 verify(s) changed (F-148)
- `10-21 20:38Z / 13:38 PT` **progress** 150 features have passed at least once (the 150th: F-146)
- `10-21 20:42Z / 13:42 PT` **features** freeze 17 (D-44): 1 verify(s) changed (F-119)
- `10-21 20:44Z / 13:44 PT` **watchdog** watchdog: idle-looking pane longrun-deckwright-build-s6, heartbeat 4m; strike 1, checking again next minute
- `10-21 20:44Z / 13:44 PT` **recap** Deckwright is being built unattended and is at 150 of 154 features, three more since the last check. It has opened another non-blocking question for…
- `10-21 20:45Z / 13:45 PT` **watchdog** watchdog: idle session longrun-deckwright-build-s6, heartbeat 5m (idle on two checks); kill longrun-deckwright-build-s6
- `10-21 20:45Z / 13:45 PT` **watchdog** watchdog: launcher exit 0 launched: Claude session 'longrun-deckwright-build-s7'
- `10-21 20:45Z / 13:45 PT` **shift** shift 6 ends: watchdog kill at 20:45Z (idle session longrun-deckwright-build-s6, heartbeat 5m (idle on two c…) after 81 min
- `10-21 20:45Z / 13:45 PT` **shift** shift 7 starts at `f86d4b0`
- `10-21 20:45Z / 13:45 PT` **regression** F-091 fails again (exit 1) at `f86d4b0`; caught by verify --all (143 features verified at one commit, inferred), run right after lane L66's merge
- `10-21 20:55Z / 13:55 PT` **harness** harness commit `970b27b` fix(long-run): agent-panel rows count as busy, so a shift waiting on lane agents is not killed as i…
- `10-21 20:55Z / 13:55 PT` to `21:04Z / 14:04 PT` **recaps** ×2, quiet: still 150 of 154 features
- `10-21 21:07Z / 14:07 PT` **regression** F-067 passes again after 2.3 h
- `10-21 21:14Z / 14:14 PT` **recap** Deckwright is being built unattended and is at 152 of 154 features. Next, the last 2 fixes, then the next player walk and certification.
- `10-21 21:18Z / 14:18 PT` **gate** gate C r3: **PASS-WITH-RESIDUALS** (`gates/C-r3.md`)
- `10-21 21:18Z / 14:18 PT` **features** freeze 18 (D-45): +1 features (F-155), total 155
- `10-21 21:24Z / 14:24 PT` **recap** Deckwright is being built unattended and is at 154 of 155 features, with gate 12 just landed. A gate added one more feature. Next, gate C round 3's v…
- `10-21 21:29Z / 14:29 PT` **gate** gate D r1: **FAIL** (`gates/D-r1.md`)
- `10-21 21:30Z / 14:30 PT` **features** freeze 19 (D-46): 5 verify(s) changed (F-128, F-131, F-145, F-151…)
- `10-21 21:31Z / 14:31 PT` **Jaime** "so i'm curious, we had 138 features before i think. how'd we get to 154? Also, -s4 doesn't seem to have moved…"
- `10-21 21:32Z / 14:32 PT` **harness** harness commit `aa7413d` docs(long-run): pilot findings P-07 (viewer does not follow shifts) and P-08 (feature growth not vi…
- `10-21 21:34Z / 14:34 PT` **recap** Deckwright is being built unattended and is at 154 of 155 features, with gate 13 landed. Next, F-099 and the last gate, then the next player walk and…
- `10-21 21:36Z / 14:36 PT` **Jaime** "nice! Great job on all fronts. Can't wait to test the final product. seems like we're close. overall I think…"
- `10-21 21:37Z / 14:37 PT` **harness** harness commit `580d652` docs(long-run): level 0 is the CEO pane; wall-clock recaps, live-view check, and a context budget s…
- `10-21 21:40Z / 14:40 PT` **Jaime** "ok. this sounds great! add all that to our findings"
- `10-21 21:41Z / 14:41 PT` **harness** harness commit `0b0af98` docs(long-run): pilot finding P-09, the CEO pane model and its context budget, with measurements an…
- `10-21 21:44Z / 14:44 PT` **recap** Deckwright is being built unattended and is at 154 of 155 features on shift 7. Next, the last feature and the final gate, then the closing player wal…
- `10-21 21:51Z / 14:51 PT` **regression** F-099 fails again (exit 1) at `f86d4b0`; caught by verify --all (143 features verified at one commit, inferred), run right after lane L66's merge
- `10-21 21:52Z / 14:52 PT` **regression** F-145 fails again (exit 1) at `21ff75e`; caught by lane merge verify (lane L68)
- `10-21 21:52Z / 14:52 PT` **harness** harness commit `b2460dc` docs(long-run): research on always-on AI employee harnesses vs long-run
- `10-21 21:54Z / 14:54 PT` **recap** Deckwright is being built unattended and is at 153 of 155 features. One feature that was passing has failed again, and the shift's verify caught it.…
- `10-21 21:59Z / 14:59 PT` **Jaime** "Hey something that I think might be good for research purposes... can you assembly a timeline of all the effo…"
- `10-21 21:59Z / 14:59 PT` **Jaime** "or if you want you could save it to a prez artifact"

## Regressions: passed, then failed, then caught



### R01 F-025: No command ever prints, saves or exports a list that fails the legality or bracket check: a forced illegal ca…

- **First passed:** 10-21 08:52Z / 01:52 PT; last pass before the failure 10-21 09:34Z / 02:34 PT at `31aed18`.
- **Failed again:** 10-21 12:17Z / 05:17 PT at `0a5e9fd`, exit 1 (`evidence/verify/F-025-20261021T121742321064Z.log`); 1 failing log(s) in the episode.
- **Failing line:** `E TypeError: test_illegal_candidate_never_written_or_printed.<locals>.forced() got an unexpected keyword argument 'owned'`
- **Likely cause (inferred):** `0a5e9fd` merge: long-run/build into lane L24 (build.py keeps avoid_ids and owned; cli.py keeps every registration) (10-21 12:16Z / 05:16 PT). How: nearest commit before the failure that touched a related file (deckwright/cli.py); 18 of 22 commits in the pass..fail range touched related files (inferred). Both sides of the merge changed deckwright/cli.py.
- **Caught by:** targeted verify (this feature alone), run right after lane L24's merge; also supervisor alert 10-21 12:18Z / 05:18 PT.
- **Broken for:** 9 min (from the inferred cause commit to the next pass); time to catch 1 min; time to fix 8 min.
- **Fixed:** 10-21 12:25Z / 05:25 PT at `c51a231`: `f0ac199` merge(long-run): lane L17 F-066, F-067, F-097; `c51a231` merge(long-run): lane L26 F-025.
- **Category:** lane merge conflict.

### R02 F-026: A build writes data/user/decks/<commander-slug>-<hash>/ with request.json and v1.json holding the list, seed,…

- **First passed:** 10-21 08:52Z / 01:52 PT; last pass before the failure 10-21 09:34Z / 02:34 PT at `31aed18`.
- **Failed again:** 10-21 12:25Z / 05:25 PT at `c51a231`, exit 1 (`evidence/verify/F-026-20261021T122521805128Z.log`); 1 failing log(s) in the episode.
- **Failing line:** `E AssertionError: assert (0 == 0 and ['report-v1.h...n', 'v1.json'] == ['request.json', 'v1.json']`
- **Likely cause (inferred):** `9f073e6` feat(report): F-087 F-088 F-093 combo report with assembly steps cross-checked against Spellbook find-my-combos (trunca… (10-21 11:54Z / 04:54 PT). How: nearest commit before the failure that touched a related file (tests/fixtures/edhrec/README.md, tests/fixtures/edhrec/top-salt.json); 2 of 24 commits in the pass..fail range touched related files (inferred).
- **Caught by:** targeted verify (2 features at one commit, inferred), run right after lane L26's merge.
- **Broken for:** 44 min (from the inferred cause commit to the next pass); time to catch 31 min; time to fix 12 min.
- **Fixed:** 10-21 12:37Z / 05:37 PT at `a73cc86`: `a73cc86` merge(long-run): lane L28 F-026 (fix touched tests only).
- **Category:** a later feature's change.

### R03 F-109: On real data, three Meren of Clan Nel Toth builds share at most 60% of non-basics, and 'spicy' then 'most con…

- **First passed:** 10-21 12:43Z / 05:43 PT; last pass before the failure 10-21 12:43Z / 05:43 PT at `a73cc86`.
- **Failed again:** 10-21 14:46Z / 07:46 PT at `2403c55`, exit 1 (`evidence/verify/F-109-20261021T144652067878Z.log`); 3 failing log(s) in the episode.
- **Failing line:** `E assert ('Sol Ring' in {'Accursed Marauder', 'Arcane Signet', "Ashnod's Altar", "Assassin's Trophy", 'Blood Artist', 'Bojuka Bog', ...})`
- **Likely cause (weak inference):** `2403c55` Merge branch 'longrun/deckwright-build/L43' into longrun/deckwright-build/L50 (10-21 14:38Z / 07:38 PT). How: no commit in the 13-commit range touched a related file; nearest commit taken (weak inference).
- **Caught by:** broad verify (47 features at one commit, inferred --fast or --failing), run right after lane L50's merge.
- **Broken for:** 49 min (from the failure to the next pass); time to catch not recorded; time to fix 49 min.
- **Fixed:** 10-21 15:35Z / 08:35 PT at `3d19383`: not recorded.
- **Category:** other (no commit in range touched a related file).

### R04 F-080: On real data, a real current Wizards precon from MTGJSON pasted as text is diagnosed for bracket 3 with legal…

- **First passed:** 10-21 14:12Z / 07:12 PT; last pass before the failure 10-21 14:12Z / 07:12 PT at `1a22755`.
- **Failed again:** 10-21 14:48Z / 07:48 PT at `2403c55`, exit 1 (`evidence/verify/F-080-20261021T144832986725Z.log`); 1 failing log(s) in the episode.
- **Failing line:** `E assert 1 == 0`
- **Likely cause:** environmental (exit 1, or the same commit passed on a re-run); the nearest related commit `0d50ba2` merge(long-run): long-run/build into lane L45 (test_real_build.py: kept every side) is not blamed.
- **Caught by:** broad verify (47 features at one commit, inferred --fast or --failing), run right after lane L50's merge.
- **Broken for:** 13 min (from the failure to the next pass); time to catch not recorded; time to fix 13 min.
- **Fixed:** 10-21 15:01Z / 08:01 PT at `2403c55`: passed on a re-run at the same commit (no code change).
- **Category:** flaky/environmental.

### R05 F-125: On real data, the benchmark over the fixed commander set (8 commanders, brackets 2-5) accepts no illegal deck…

- **First passed:** 10-21 13:54Z / 06:54 PT; last pass before the failure 10-21 13:54Z / 06:54 PT at `2c46ff8`.
- **Failed again:** 10-21 14:52Z / 07:52 PT at `2403c55`, exit 1 (`evidence/verify/F-125-20261021T145222863684Z.log`); 1 failing log(s) in the episode.
- **Failing line:** `E assert 1 == 0`
- **Likely cause:** environmental (exit 1, or the same commit passed on a re-run); the nearest related commit `0d50ba2` merge(long-run): long-run/build into lane L45 (test_real_build.py: kept every side) is not blamed.
- **Caught by:** broad verify (47 features at one commit, inferred --fast or --failing), run right after lane L50's merge.
- **Broken for:** 15 min (from the failure to the next pass); time to catch not recorded; time to fix 15 min.
- **Fixed:** 10-21 15:07Z / 08:07 PT at `2403c55`: passed on a re-run at the same commit (no code change).
- **Category:** flaky/environmental.

### R06 F-080: On real data, a real current Wizards precon from MTGJSON pasted as text is diagnosed for bracket 3 with legal…

- **First passed:** 10-21 14:12Z / 07:12 PT; last pass before the failure 10-21 15:01Z / 08:01 PT at `2403c55`.
- **Failed again:** 10-21 16:07Z / 09:07 PT at `4256bf7`, exit 124 (`evidence/verify/F-080-20261021T160737982345Z.log`); 1 failing log(s) in the episode.
- **Failing line:** `exit 124 (timeout)`
- **Likely cause (inferred):** `4256bf7` test(import): F-080 and F-136 real-data checks: precon swaps non-empty, Moxfield export has no unknown cards (10-21 15:58Z / 08:58 PT). How: nearest commit before the failure that touched a related file (tests/integration/test_real_import.py); 1 of 4 commits in the pass..fail range touched related files (inferred).
- **Verify command changed** between the pass and the failure (freeze under D-33).
- **Caught by:** lane merge verify (lane L54); also named in gate E r1 (10-21 16:17Z / 09:17 PT).
- **Broken for:** 10 min (from the failure to the next pass); time to catch not recorded; time to fix 10 min.
- **Fixed:** 10-21 16:18Z / 09:18 PT at `4256bf7`: passed on a re-run at the same commit (no code change).
- **Category:** other: verify tightened (the check changed, not the code).

### R07 F-133: With a budget in the request (S-2.1 ~$150), each shortlisted commander shows the estimated cost of a legal de…

- **First passed:** 10-21 16:44Z / 09:44 PT; last pass before the failure 10-21 17:24Z / 10:24 PT at `1d1ee52`.
- **Failed again:** 10-21 17:47Z / 10:47 PT at `0ec27b7`, exit 2 (`evidence/verify/F-133-20261021T174753514725Z.log`); 1 failing log(s) in the episode.
- **Failing line:** `bash: -c: line 2: syntax error: unexpected end of file`
- **Likely cause (inferred):** `0ec27b7` feat(finder): F-138 resolve an EDHREC partner-pair entry to its two commanders and shortlist the pair; drop the may_cha… (10-21 17:46Z / 10:46 PT). How: nearest commit before the failure that touched a related file (tests/test_finder.py); 1 of 1 commits in the pass..fail range touched related files (inferred).
- **Verify command changed** between the pass and the failure (freeze under D-37).
- **Caught by:** targeted verify (this feature alone), run right after lane L56's merge; also named in gate B r2 (10-21 18:24Z / 11:24 PT).
- **Broken for:** 15 min (from the failure to the next pass); time to catch not recorded; time to fix 15 min.
- **Fixed:** 10-21 18:03Z / 11:03 PT at `0ec27b7`: passed on a re-run at the same commit (no code change); verify command changed (D-38).
- **Category:** other: verify tightened (the check changed, not the code).

### R08 F-067: On real data: S-2.1 tokens bracket 3 ~$150, S-2.2 black-red aristocrats bracket 2 and S-2.3 control bracket 4…

- **First passed:** 10-21 12:22Z / 05:22 PT; last pass before the failure 10-21 12:22Z / 05:22 PT at `f0ac199`.
- **Failed again:** 10-21 18:51Z / 11:51 PT at `0ec27b7`, exit 1 (`evidence/verify/F-067-20261021T185108417564Z.log`); 2 failing log(s) in the episode.
- **Failing line:** `E assert ([] or False)`
- **Likely cause (inferred):** `1d1ee52` Merge branch 'long-run/build' into longrun/deckwright-build/L55 (10-21 16:52Z / 09:52 PT). How: nearest commit before the failure that touched a related file (tests/integration/test_real_finder.py); 2 of 21 commits in the pass..fail range touched related files (inferred).
- **Caught by:** verify --all (134 features verified at one commit, inferred), run right after lane L56's merge.
- **Broken for:** 4.3 h (from the inferred cause commit to the next pass); time to catch 119 min; time to fix 2.3 h.
- **Fixed:** 10-21 21:07Z / 14:07 PT at `9f66b1d`: `9f66b1d` merge(long-run): lane L65 F-142, F-141, F-067.
- **Category:** a later feature's change.

### R09 F-083: In Claude Code across resumed turns, after S-1.1 the edits 'make it cheaper', 'more interaction' and 'swap Do…

- **First passed:** 10-21 13:39Z / 06:39 PT; last pass before the failure 10-21 19:17Z / 12:17 PT at `0ec27b7`.
- **Failed again:** 10-21 20:00Z / 13:00 PT at `888633d`, exit 124 (`evidence/verify/F-083-20261021T200004631273Z.log`); 1 failing log(s) in the episode.
- **Failing line:** `exit 124 (timeout)`
- **Likely cause:** environmental (exit 124, or the same commit passed on a re-run); the nearest related commit `888633d` test(chat-check): F-083 S-4.1's Doubling Season swap turn is conditional on the card bein… is not blamed.
- **Caught by:** lane merge verify (lane L61).
- **Broken for:** 7 min (from the failure to the next pass); time to catch not recorded; time to fix 7 min.
- **Fixed:** 10-21 20:06Z / 13:06 PT at `888633d`: passed on a re-run at the same commit (no code change).
- **Category:** flaky/environmental.

### R10 F-091: The HTML report renders legibly in a real browser with every section visible (headless screenshot judged by a…

- **First passed:** 10-21 19:23Z / 12:23 PT; last pass before the failure 10-21 19:23Z / 12:23 PT at `25ff27f`.
- **Failed again:** 10-21 20:45Z / 13:45 PT at `f86d4b0`, exit 1 (`evidence/verify/F-091-20261021T204538670660Z.log`); 2 failing log(s) in the episode.
- **Failing line:** `capture commit 25ff27f659e4 != HEAD f86d4b0ac005`
- **Likely cause (weak inference):** `f86d4b0` feat(formats): F-148 a Brawl commander legal only in Historic Brawl builds the 100-card Historic deck for that same com… (10-21 20:41Z / 13:41 PT). How: no commit in the 12-commit range touched a related file; nearest commit taken (weak inference).
- **Caught by:** verify --all (143 features verified at one commit, inferred), run right after lane L66's merge; also named in gate D r1 (10-21 21:29Z / 14:29 PT).
- **Broken for:** not recorded (still failing at cutoff); time to catch not recorded; time to fix not recorded.
- **Fixed:** not yet at cutoff.
- **Category:** other (no commit in range touched a related file).

### R11 F-099: On real data, rebuilding S-1.1 gives a byte-identical deck file (S-8.2), and a commander from the newest set…

- **First passed:** 10-21 15:19Z / 08:19 PT; last pass before the failure 10-21 19:28Z / 12:28 PT at `0ec27b7`.
- **Failed again:** 10-21 21:51Z / 14:51 PT at `f86d4b0`, exit 1 (`evidence/verify/F-099-20261021T215104612703Z.log`); 1 failing log(s) in the episode.
- **Failing line:** `E assert 1 == 0`
- **Likely cause (inferred):** `bfe5dea` feat(present): F-149 chat build output names fields by label (no input ids), states one land count equal to the table's… (10-21 20:36Z / 13:36 PT). How: nearest commit before the failure that touched a related file (deckwright/cli.py, deckwright/gameplan.py); 3 of 13 commits in the pass..fail range touched related files (inferred).
- **Caught by:** verify --all (143 features verified at one commit, inferred), run right after lane L66's merge.
- **Broken for:** not recorded (still failing at cutoff); time to catch 74 min; time to fix not recorded.
- **Fixed:** not yet at cutoff.
- **Category:** a later feature's change.

### R12 F-145: After a build, a pilot question in chat ('how do I play this deck?') is answered from the engine's `deckwrigh…

- **First passed:** 10-21 19:40Z / 12:40 PT; last pass before the failure 10-21 20:49Z / 13:49 PT at `f86d4b0`.
- **Failed again:** 10-21 21:52Z / 14:52 PT at `21ff75e`, exit 1 (`evidence/verify/F-145-20261021T215204336543Z.log`); 1 failing log(s) in the episode.
- **Failing line:** `- the reply names none of the engine primer's win lines ['Two-card combo: Kinnan, Bonder Prodigy + Basalt Monolith']`
- **Likely cause (inferred):** `21ff75e` test(chat): F-145 S-5.1 chat check resumes after the Kinnan build with the pilot question and requires a deckwright pri… (10-21 21:45Z / 14:45 PT). How: nearest commit before the failure that touched a related file (scripts/chat_check.py); 1 of 5 commits in the pass..fail range touched related files (inferred).
- **Verify command changed** between the pass and the failure (freeze under D-46).
- **Caught by:** lane merge verify (lane L68).
- **Broken for:** not recorded (still failing at cutoff); time to catch not recorded; time to fix not recorded.
- **Fixed:** not yet at cutoff.
- **Category:** other: verify tightened (the check changed, not the code).

### Aggregate

- Episodes: 12 (9 fixed, 3 still failing at cutoff) across 11 features.
- Median time-to-catch (inferred cause commit to failing verify): 53 min over 4 episodes with an inferred cause.
- Median time-to-fix (failing verify to next pass): 13 min over 9 fixed episodes.
- Causes by category: a later feature's change 3, flaky/environmental 3, lane merge conflict 1, other (no commit in range touched a related file) 2, other: verify tightened (the check changed, not the code) 3.
- Caught by: broad verify 3, lane merge verify 3, targeted verify 3, verify --all 3.
- Code regressions (excluding flaky/environmental and tightened verifies): 6; median time-to-catch 53 min, median time-to-fix 31 min.

## Setbacks and harness faults

| time | setback | cost | finding |
| --- | --- | --- | --- |
| 10-21 07:26Z / 00:26 PT | watchdog: longrun-deckwright-build-s1 waiting on a permission prompt, alerted at 07:36Z / 00:36 PT (harness fix `0d0e043` +20 min, inferred) | 28 min | [fixed: Imports dialog for a linked worktree](261021-deckwright-pilot-findings.md#fixed-during-the-run-for-the-record) (commit) |
| 10-21 07:55Z / 00:55 PT | harness fix `0d0e043` fix(long-run): trust-worktree also approves the main repo of a linked git worktree (deckw… | not recorded | [fixed: Imports dialog for a linked worktree](261021-deckwright-pilot-findings.md#fixed-during-the-run-for-the-record) (commit) |
| 10-21 07:56Z / 00:56 PT | watchdog killed and relaunched idle session longrun-deckwright-build-s1 (ends the permission wait that began 07:26Z / 00:26 PT) | 30 min of heartbeat silence before the kill | [fixed: Imports dialog for a linked worktree](261021-deckwright-pilot-findings.md#fixed-during-the-run-for-the-record) (commit) |
| 10-21 08:21Z / 01:21 PT | watchdog: longrun-deckwright-build-s1 looked hung (pane busy), alerted at 08:25Z / 01:25 PT (harness fix `b19fc14` +0 min, inferred) | 6 min | [fixed: Watchdog launched a shift during INTAKE](261021-deckwright-pilot-findings.md#fixed-during-the-run-for-the-record) (commit), [fixed: Shift viewers latched onto other panes](261021-deckwright-pilot-findings.md#fixed-during-the-run-for-the-record) (commit), [fixed: Busy shift read as idle](261021-deckwright-pilot-findings.md#fixed-during-the-run-for-the-record) (commit) |
| 10-21 08:24Z / 01:24 PT | harness fix `b19fc14` fix(long-run): minute-scale cadence (cron 1 min, stale 2, hung 3, wakes 60 s), no shift d… | not recorded | [fixed: Watchdog launched a shift during INTAKE](261021-deckwright-pilot-findings.md#fixed-during-the-run-for-the-record) (commit), [fixed: Shift viewers latched onto other panes](261021-deckwright-pilot-findings.md#fixed-during-the-run-for-the-record) (commit), [fixed: Busy shift read as idle](261021-deckwright-pilot-findings.md#fixed-during-the-run-for-the-record) (commit) |
| 10-21 08:35Z / 01:35 PT | watchdog: longrun-deckwright-build-s1 looked hung (pane busy), alerted at 08:39Z / 01:39 PT | 5 min | [P-06](261021-deckwright-pilot-findings.md#p-06-a-shift-whose-own-turn-has-ended-but-whose-lane-agents-still-run-looks-idle) (keyword, inferred) |
| 10-21 08:40Z / 01:40 PT | watchdog: longrun-deckwright-build-s1 looked hung (pane busy), alerted at 08:44Z / 01:44 PT | 5 min | [P-06](261021-deckwright-pilot-findings.md#p-06-a-shift-whose-own-turn-has-ended-but-whose-lane-agents-still-run-looks-idle) (keyword, inferred) |
| 10-21 08:58Z / 01:58 PT | harness fix `0fbc690` fix(long-run): certify-ready names open DEFECT/JOB-FAILURE findings before a certifier is… | not recorded | [fixed: Fixed defects left unticked blocked certify](261021-deckwright-pilot-findings.md#fixed-during-the-run-for-the-record) (commit) |
| 10-21 09:18Z / 02:18 PT | gate A r1 FAIL | 22 min until A r2 PASS-WITH-RESIDUALS | product finding (no P-NN) |
| 10-21 09:21Z / 02:21 PT | fitness walk 1 (skeleton) FAIL | not recorded | product finding (no P-NN) |
| 10-21 09:35Z / 02:35 PT | recap cadence: median 10.0 min, max 23.3 min between recaps under 30 min apart (37 intervals) | not recorded | [P-01](261021-deckwright-pilot-findings.md#p-01-supervision-cadence-drifts-silently) (keyword, inferred) |
| 10-21 11:31Z / 04:31 PT | shift 1 rotated by hand (inferred) | not recorded | [P-04](261021-deckwright-pilot-findings.md#p-04-a-running-shift-ignores-protocol-changes-notes-and-rotation-thresholds) (time) |
| 10-21 11:41Z / 04:41 PT | 12 lane merges conflicted and were re-laned (DECISIONS D-22, D-24) | 5.3 h of lane time from creation to conflict, summed | no matching P-NN |
| 10-21 11:44Z / 04:44 PT | watchdog killed and relaunched idle session longrun-deckwright-build-s2 (harness fix `8a948e5` +3 min, inferred) | 6 min of heartbeat silence before the kill | [fixed: Idle kill right after a long turn (six lanes lost)](261021-deckwright-pilot-findings.md#fixed-during-the-run-for-the-record) (commit) |
| 10-21 11:47Z / 04:47 PT | harness fix `8a948e5` fix(long-run): watchdog kills an idle-looking shift only on two consecutive checks with n… | not recorded | [fixed: Idle kill right after a long turn (six lanes lost)](261021-deckwright-pilot-findings.md#fixed-during-the-run-for-the-record) (commit) |
| 10-21 12:26Z / 05:26 PT | fitness walk 2 (about 60%) FAIL; 7 features added from it (D-27) | not recorded | product finding (no P-NN) |
| 10-21 12:26Z / 05:26 PT | supervising pane silent (no assistant turn) until 16:04Z / 09:04 PT while the run ran | 3.6 h | [P-02](261021-deckwright-pilot-findings.md#p-02-one-shot-watches-died-when-a-re-arm-was-forgotten) (time) |
| 10-21 15:32Z / 08:32 PT | gate C r1 FAIL; findings became work under D-33 | 86 min until C r2 PASS | product finding (no P-NN) |
| 10-21 15:49Z / 08:49 PT | gate F r1 FAIL; findings became work under D-34 | 2.5 h until F r2 PASS | product finding (no P-NN) |
| 10-21 17:33Z / 10:33 PT | gate B r1 FAIL; findings became work under D-37 | 83 min until B r3 PASS | product finding (no P-NN) |
| 10-21 18:24Z / 11:24 PT | gate B r2 FAIL; findings became work under D-39 | 32 min until B r3 PASS | product finding (no P-NN) |
| 10-21 19:23Z / 12:23 PT | fitness walk 3 (final) FAIL; 15 features added from it (D-40) | not recorded | product finding (no P-NN) |
| 10-21 20:15Z / 13:15 PT | verify record for F-083 written at 20:15Z / 13:15 PT from a run started 19:17Z / 12:17 PT, over a newer failure at 20:00Z / 13:00 PT | 58 min between the run's start and its record | no matching P-NN |
| 10-21 20:15Z / 13:15 PT | verify record for F-091 written at 20:15Z / 13:15 PT from a run started 18:24Z / 11:24 PT, over a newer pass at 19:23Z / 12:23 PT | 112 min between the run's start and its record | no matching P-NN |
| 10-21 20:45Z / 13:45 PT | watchdog killed and relaunched idle session longrun-deckwright-build-s6 (harness fix `970b27b` +11 min, inferred) | 5 min of heartbeat silence before the kill | [P-06](261021-deckwright-pilot-findings.md#p-06-a-shift-whose-own-turn-has-ended-but-whose-lane-agents-still-run-looks-idle) (time) |
| 10-21 20:55Z / 13:55 PT | harness fix `970b27b` fix(long-run): agent-panel rows count as busy, so a shift waiting on lane agents is not k… | not recorded | no matching P-NN |
| 10-21 21:29Z / 14:29 PT | gate D r1 FAIL; findings became work under D-46 | not passed at cutoff | product finding (no P-NN) |

## Method and caveats

- Script: `skills/long-run/scripts/run_timeline.py` 0.1.0. Re-run it to refresh; with the same sources and `--until` the output is byte-identical apart from the generated-at comment.
- **Shifts** come from `STATE.shifts`. A shift with an `end` ended by the harness (clean rotation). One without an `end` whose successor started within 3 minutes of a watchdog `kill` line was a watchdog kill; any other is a hand rotation (inferred).
- **Features planned** = `logs/frozen-snapshots/1/features.json`; **added** = features created by a freeze (`logs/freeze-log.jsonl` hunks starting `@@ -0,0`). The source of an addition is its `from_finding` field, else the title of the freeze's decision in `DECISIONS.md`.
- **Verify history** is `evidence/verify/*.log`: the stamp in the file name is when that verify started, and `exit:` inside it is the result. Passing at cutoff uses the latest log per feature, not STATE, because STATE records are written when a whole batch ends.
- **First passes** use `STATE.verified[*].first_pass_at` (the record time) and fall back to the first passing log's stamp.
- **Regression catcher:** a failing log at a lane's `merge_commit` for one of that lane's features is a lane merge verify; other logs at one commit with stamps within 15 minutes of each other are one verify invocation (inferred). One covering at least 80% of the features then planned is a `verify --all`, one of 20 or more a broad verify (`--fast` or `--failing`), anything smaller a targeted verify. Gate and fitness files, and supervisor alerts, that name the feature after the failure are listed as corroboration, not as catchers.
- **Regression cause (inferred):** the first-parent commits after the last passing commit up to the failing commit; the nearest one that touched a file named in the verify command or the failing log, or a fixture dir of the feature. Categories, in order: verify command changed between pass and fail; exit 124 or a pass on a re-run with no code change (flaky/environmental); a test change acknowledged in `STATE.test_acks` (test too strict vs spec); a lane merge whose both sides changed a related file (lane merge conflict); a commit naming another feature, or any lane merge (a later feature's change); else other. When no commit in the range touched a related file, the nearest commit is shown as a weak inference and the episode is classed other; a flaky episode names the nearest related commit without blaming it.
- **Time to catch** runs from the inferred cause commit's committer time to the failing verify's start; it is not recorded where no cause was inferred. **Time to fix** runs from the failing verify to the next passing one.
- **Watchdog** lines are deduplicated exactly (the log writes each line twice); hung episodes start at the first `hung (Nm, ...)` line minus N.
- **Transcript:** Jaime's messages are non-meta user turns with real text (and queued prompts), excluding tool results, task and agent notifications and scheduled `/loop` wakes; recaps are assistant lines starting `※ recap:` (with the `Now:` line after them); built-in away summaries are counted separately. Sidechain entries are skipped.
- **Stale verify records:** a result recorded (in `STATE.verified` or an `attempts/*.jsonl` verify row) more than a minute after its log started, while a log of the same feature with the opposite result started in between, is listed as a record written over a newer result.
- **Setback costs** are measured only where the sources bound them; the finding column matches each setback to a P-NN section by a time (±2 min) or commit hash it mentions, else by keyword (marked inferred).
- `DECISIONS.md` reuses ids D-09, D-10, D-11, D-12; the first title for each id is used.
- The run was still RUNNING when this was generated; numbers describe the state at the cutoff.

