---
template: deliverable
version: 1.0.0
summary: "One-page brief for the RideCare CEO, 10 September 2026: what is live on Echo1 since the 9 August cutover, what remains on the Wave 2 board by epic, and the engagement roster at peak, now, and under the SOW-001 steady-state plan. No dollar figures by design."
created: 2026-09-09
last_updated: 2026-09-09
maintainer: pvragon
audience: David Roberts (RideCare CEO)
---

# Echo1 status and team, September 2026

## Where we stand

**Echo1 has been RideCare's production platform since the cutover on the night of Sunday, 9 August 2026.** Every V1 intake URL now forwards permanently to its V2 form, completed V1 records were migrated that night, and dispatchers, drivers and billing work in Echo1. The engagement moved into SOW-001 Phase C, ongoing operations and development, on 15 August. Everything below comes from two sources: the Echo1 Wave 2 board in ClickUp, and the Epics & Milestones working draft of 1 September.

## What is done

| Area | What is live |
| --- | --- |
| Intake | Public and requester intake forms, email intake, entity-specific form configuration, EPC badge capture, tribal and insurance fields, SPTHB form |
| Dispatch and routes | Dispatch screen, route creation, edit-route drawer, transport duplication, missed-status timers, void and reroute rules, UTC-standard scheduling |
| Optimizer | Proximity grouping, onboard-time cap, driver shift and wheel-time constraints, unvalidated-route guard, constraint display |
| Driver trip log | Multi-route sign-off, end-of-route stop, document upload at every pickup, incident and crash notifications, manager edits with a change log |
| Samsara sync | Driver-vehicle assignment propagation, extract and inject sync, route linkage, actual driven route and mileage in the app |
| Billing and processing | 837 export at V1 parity, processing table and review-status fixes, requesting-entity payer setup, allowed-payers audit across 37 entities |
| Data and admin | Client and facility soft delete and merge, one address autocomplete everywhere, SSN display standard, test-record cleanup, persistent filters |
| Situational awareness | Live fleet GPS, un-dispatched request tracking, driver ETA visibility on routes |

Wave 2 tally since cutover, top-level tickets only.

| State | Tickets |
| --- | --- |
| Released to production | 95 |
| Closed without a change | 51 |
| Open | 181 |

## What is left

The 1 September draft groups the open work into 28 epics. "In flight" means at least one ticket is being built, reviewed or verified in production today. "Started" means only scoping or refinement has happened. Owners are shown where one is named.

| Epic | Owner | State |
| --- | --- | --- |
| Optimization | Rafael | In flight |
| Audit, change log and compliance controls | Rafael | In flight |
| Client and facility data integrity | Alexander, Roman | In flight |
| Route editing (part of removing Samsara from dispatch) | JP | In flight |
| Identity, roles and employee management | Rafael | In flight |
| Finalize form configuration tools | Victor, Prameeth | In flight |
| Intake and submissions reliability | Victor | In flight |
| Full lifecycle revenue management | Roman | In flight |
| Advanced crisis classification and manager approvals | JP | In flight |
| Get drivers out of Samsara | Roman | In flight |
| Help center and in-app guidance | William | In flight |
| Data grid performance and usability | JP | In flight |
| Quality of life for the Nebraska rollout | JP | Started |
| Driver trip log and field experience | none | Started |
| Improved client risk flags and transport notes | none | Started |
| ETA accuracy | none | Started |
| Reporting and analytics | none | Started |
| Unified notifications and client communications | none | Started |
| Remove Samsara from dispatcher day-to-day | none | Not started |
| Migrate HR and admin users out of Samsara | none | Not started |
| In-app messaging | none | Not started |
| In-app issue log | none | Not started |
| Customer login and reporting | none | Not started |
| Streamline customer success processes | none | Not started |
| Finalized transport processing UI and UX | none | Not started |
| Finalize modern dev environment | none | Not started |
| Core platform services | none | Not started |
| Finalize transport processing rules (who can mark Processed) | none | Not started |

## The team

The roster for the RideCare engagement, top to bottom. Peak is April through June 2026. Steady state is the SOW-001 Phase C plan that began 15 August.

| Person | Role | Peak (Apr to Jun) | Now (Sep) | Steady state |
| --- | --- | --- | --- | --- |
| James Hereford | CEO, acting CTO | On team | On team | Stays |
| Bradd Schofield | Product Manager | On team | On team | Stays |
| Roman Naidenko | Senior Engineer | On team | On team | Stays |
| JP Casabianca | Engineering Lead | On team | On team | Stays |
| Rafael Casabianca | Data and Infrastructure Lead | On team | On team | Stays |
| Saymond Montoya | QA Engineer | On team | On team | Stays |
| William Titus | Customer Success | On team | On team | Drop |
| Alexander Pavelko | Senior Engineer, part-time | On team | On team | Drop |
| Victor Cheung | Engineer | On team | On team | Drop |
| Prameeth Kotian | Program Manager | On team | On team | Drop |
| David Pérez | Full-stack Engineer | On team | Left Aug 2026 | |
| Dana Hetté | Delivery Manager | On team | Left Aug 2026 | |
| Muhammad Farhan | DevOps and Infrastructure | On team | Left Aug 2026 | |
| Clarissa Mitidiero | Customer Success and UAT | On team | Left Jul 2026 | |
| Bilal Mughal | Engineer, test automation | Left Apr 2026 | | |
