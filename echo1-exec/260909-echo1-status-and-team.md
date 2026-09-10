---
template: deliverable
version: 3.1.0
summary: "One-page brief for the RideCare CEO, 10 September 2026: what Echo1 does today versus V1, what is left by epic with conservative progress states, the contracted schedule by month, and the engagement roster with one status per person. Sub-bullets and evidence live in hover tooltips."
created: 2026-09-09
last_updated: 2026-09-09
maintainer: pvragon
audience: David Roberts (RideCare CEO)
---

# Echo1 status and team, September 2026

## Summary

<!-- strip end=Discuss -->
1. **The plan.** The original scope of work planned to ramp the team down about now, to $80k a month in steady state. Phase C began on 15 August.
2. **July.** We chatted at the 4th and moved that to $89k to keep Rafael on. That is the figure in the contract table below.
3. **What $89k requires.** Dropping at least one and a half engineers, the program manager, and the customer success person.
4. **Scope has grown.** "Reproduce V1 as a multi-tenant product" became "build a much bigger, better product". I, and sometimes Roman, are sometimes filling roles beyond dev.
5. **Where we are.** Echo1 has run RideCare since the 10 August cutover and is in good shape. A great deal remains, above all the Samsara exit, the full billing lifecycle, and audit and compliance.
6. **Against the market.** I've benchmarked the team's costs heavily and we're managing to stay well under market. Part of this comes from the team stretching hard through the build, which is great, but we won't be able to sustain that indefinitely.
7. **Three ways forward.** Staff what Echo1 truly needs at about $130k a month ongoing. Keep the current team as is at $113.5k a month. Or slow down significantly and reduce staff to meet the $90k plan.
8. **Upside.** A team that size can take on separate software contracts. What we see in the recent work from Roman and I on billing also suggests a tech-enabled approach to some traditional roles could pay off.

Detail follows. Hover over any row for what sits behind it.

## What Echo1 does today

| Capability | Versus V1 |
| --- | --- |
| <span title="Public and requester intake forms live on Echo1, V1 URLs redirect • Email intake • Forms configured per requesting entity • EPC badge, tribal and insurance details captured at intake • SPTHB form reachable">Every transport request comes in through Echo1</span> | Parity, expanded |
| <span title="Dispatch screen with driver search and route status • Route creation and the edit-route drawer after dispatch • Transport duplication for every dispatcher case • Missed-status timers with late and missed row colours • Void and reroute rules on in-progress routes • Scheduling standardised on UTC for multi-state operation">Dispatchers run the whole day in Echo1</span> | Parity, expanded |
| <span title="V1 optimizer parity • Groups nearby pickups and drop-offs • Caps rider time on board • Respects driver shift and wheel-time limits • Will not surface routes that failed validation • Constraint display on optimization outputs">Optimizer builds the pre-scheduled day</span> | Parity, expanded |
| <span title="Trip log with multi-route sign-off and end-of-route stop • Document upload at every pickup, including LMHP paperwork • Incident and crash reports with notifications restored • Manager edits to a trip log, each with a signature and change log">Drivers run rides from their phone</span> | Parity, expanded |
| <span title="Driver and vehicle assignments propagate to Samsara • Route extract and inject keep start time, location and client names current • Actual driven route and real mileage shown in the app">Samsara stays in sync from Echo1</span> | Parity |
| <span title="837 export at V1 parity • Processing table, review status and record counts fixed • Requesting-entity payer setup • Allowed-payer audit across 37 requesting entities">Claims go out as 837 files as before</span> | Parity |
| <span title="Soft delete and merge for clients and facilities • One address autocomplete on every form • SSN display standard across grids and drawers • Persistent filters and state columns">Client and facility records can be cleaned and merged</span> | Parity |
| <span title="Situational awareness page with live GPS for the fleet • Dashboard of un-dispatched requests for the day • Driver ETA visibility on the routes page">Live view of the fleet and of un-dispatched requests</span> | New in Echo1 |
| <span title="Multi-tenant architecture on AWS with tenant isolation at every layer • HIPAA-aligned infrastructure, encryption and audit logging • No dependence on the V1 Backendless platform">One platform built for more than one state and customer</span> | New |

## What is left

The 1 September working draft groups the remaining work into 26 outcomes. "In progress" means code for that outcome was merged or opened for review in the last two weeks. "Partly delivered" means part of it is already in production and nothing else is being built right now. "Started" means it has been scoped, or was built earlier and has not moved in over two weeks. Hover an epic for the work inside it, and hover a state for the evidence.

| Epic | Outcome | Owner | State |
| --- | --- | --- | --- |
| <span title="Epic: Full lifecycle revenue management • Invoice workflow for contract billing • Updated payer framework for more detailed contract terms • Claims resubmission and rework lifecycle workflow • Data visualization, export and analysis for the billing team • 835 ingestion and improved adjudication tracking • Requester entity renames silently orphaning historical billing records • Restrict who can mark a transport as Processed">Revenue</span> | Full revenue lifecycle in Echo1: contract invoicing, richer payer contract terms, claim resubmission, 835 remittances, billing analytics and processing controls | Roman | <span title="Merged 4 to 5 Sep (PRs 2446 to 2461): Waystar clearinghouse sync moved to the server on a schedule, rejection notes tracked per claim. In progress: billing export, query and payer-page fixes for the billing team.">In&nbsp;progress</span> |
| <span title="Epic: Advanced crisis classification and manager approvals • Crisis classification and its implications from intake form through billing • Dispatch workflow for when manager approval is needed • Cross-state rides need manager approval before dispatch • Hold status to pause the lateness clock on undispatchable crisis rides • Audible alert when a new crisis request arrives • Remove redundant CRISIS/SCHEDULED filters duplicating Secured/Unsecured">Crisis rides</span> | Crisis classification carried from intake to billing, with manager approval for crisis and cross-state rides, hold status, and dispatch alerts | JP | <span title="Shipped 8 Sep (PR 2440): hold status for undispatchable crisis rides; audible alert on new crisis requests, both in production QA. Manager approval flows are not started.">Partly&nbsp;delivered</span> |
| <span title="Epic: Optimization • Get optimization over the line • Optimizer strands riders when an earlier drop-off is free • Routes drivers home mid-day regardless of proximity • Assigns routes outside driver available hours and to off-duty drivers • Max Start and Max End stored as durations but read as clock times • Driver shift and wheel-time constraints • Geo-fence drivers to an operating zone for pickups • Per-run optimizer dashboard (V1 parity) • Stop count discrepancy between V1 and V2 on the same route • Show active client and drop-off distance on optimized routes">Optimizer</span> | Optimizer finished: correct sequencing and drop-offs, driver hours and zones respected, V1 dashboard parity, route details on screen | Rafael | <span title="Open PR 2470 (8 Sep): solver rework to escape local optima. In production QA: stranded-rider fix, mid-day routing home, per-run dashboard, no-revisit rule.">In&nbsp;progress</span> |
| <span title="Epic: Get drivers out of Samsara • Vehicle and driver assignment in the trip log, so drivers never pick a vehicle in Samsara • Migrate driver messaging off Samsara • Lock drivers out of Samsara • Driver:vehicle pairing integrity, mid-day vehicle switch corrupts trip data • Mid-day vehicle swap scheduled as a routed stop for ADA vehicle collection">Drivers off Samsara</span> | Drivers work only in Echo1: vehicle assignment, messaging, mid-day vehicle swaps, pairing integrity, then Samsara locked off | Roman | <span title="Vehicle assignment and driver duty status in the trip log have been in review since 21 Aug with no movement since. Messaging and lock-out are not started.">Started</span> |
| <span title="Epic: Remove Samsara from dispatcher day-to-day • Complete the Situational Awareness page • Visual edit log for transport requests and transports • Complete all route editing functions, including extracting multiple clients from a route • Train dispatchers to use Echo1 for all day-to-day processes • Lock dispatchers out of Samsara • Add clients to an already-dispatched route for a group trip • Duplicate already-dispatched or voided transports • Swap vehicle to one the driver has not signed into • Historic transports: state-by-state record search">Dispatch off Samsara</span> | Dispatchers work only in Echo1: full route editing, situational awareness, edit logs, group trips, duplication, vehicle swaps, record search, then Samsara locked off | JP | <span title="Open PR 2476 (9 Sep): route start and end ownership. In progress: route editing lockout for in-progress routes. In production QA: state-by-state search. Pre-start route editing is queued.">In&nbsp;progress</span> |
| <span title="Epic: Finalize form configuration tools • Finalize the form configurator tool • Let RideCare add fields • Intake form creator tool • Training material for creating a new form">Form tools</span> | RideCare configures and creates its own intake forms, with training material | Victor, Prameeth | <span title="Open PR 2475 (9 Sep): form configuration save reliability. In progress: intake form creator end-to-end check, configurator issues.">In&nbsp;progress</span> |
| <span title="Epic: Audit, change log and compliance controls • Reconcile audit schema with the v1.0 architecture spec • Verify audit_log auto-capture is working in staging and production • Routes audit log and dispatcher-visible change log (Samsara parity) • Transport history completion and the 17-event catalog • pgaudit in production for PHI-read auditing • 42 CFR Part 2 SUD trip confidentiality controls • MFA enforcement for admin and dispatcher roles">Audit and compliance</span> | Complete audit trail: reconciled schema, verified capture, routes change log, full transport history, PHI-read auditing, 42 CFR Part 2 controls, MFA | Rafael | <span title="Audit schema reconciliation, immutability roles and the routes change log were built in July and have not moved since 28 Jul. pgaudit, 42 CFR Part 2 and MFA are not started.">Started</span> |
| <span title="Epic: Identity, roles and employee management • Fix Cognito role and profile resets in employee management • Employee creation creates the matching Fleet driver record • Review and document the Cognito roles and permissions architecture • Supervisor-only control of transport request dispatcher assignment • Pre-dispatch assignment of transport requests to dispatchers • Expand dispatcher permissions for vehicle and driver reassignment • Clean up V2 employee management">Identity and roles</span> | Reliable identity and roles: Cognito fixes and documentation, driver records created on hire, dispatcher assignment controls, clean employee management | Rafael | <span title="Open PR 2445 (7 Sep): permission system measured against the CTO specification. In progress: employee management cleanup. In production QA: dispatcher reassignment permissions.">In&nbsp;progress</span> |
| <span title="Epic: Client and facility data integrity • Stop the client edit drawer wiping stored addresses and dropping fields • Client merge for tenant admins, carrying claims, communications and SMS sessions • Facility merge, soft delete, and type and subtype editing • Facility address 2 capture across the universal autocomplete component • Stop case-manager submissions writing bad addresses into facilities • Retain the client home address collected on public intake">Client and facility data</span> | Accurate client and facility records: no data loss on edit, merges that carry history, facility typing and address 2, clean intake addresses | Alexander, Roman | <span title="Merged 8 Sep (PR 2444): duplicate detection on the Clients page. Open PR 2467: deactivated-record and billing-link fixes. In review: client merge for tenant admins.">In&nbsp;progress</span> |
| <span title="Epic: Intake and submissions reliability • Architectural review and documentation of all submission paths • Fix variant contracts stuck at draft, which makes discharge and multistop forms unavailable • Mitigate stale request-form contracts parked by the production deploy race • V1 to V2 form parity review • Migrate email-intake LLM extraction to the OpenAI Responses API • Separate the staging email parser from the production intake inbox">Intake reliability</span> | Reliable submissions: documented paths, every form variant available, deploy-safe contracts, V1 parity review, upgraded email extraction, separate staging inbox | Victor | <span title="Discharge and multistop form variants stuck at draft: fix in QA since 31 Aug. V1 to V2 form comparison in review since 20 Aug. No build activity in the last two weeks.">Started</span> |
| <span title="Epic: Data grid performance and usability • Fix 20 to 30 second page-change load times across every data table • Loading animation for all data grids • Fix pagination controls disappearing when rows-per-page exceeds record count • Minimum sizing, spacing and colour formatting standards • Multi-select, filter and CSV export on driver forms">Data grids</span> | Fast, consistent data grids: load times, loading states, pagination, formatting standards, driver-form export | JP | <span title="Facilities grid load time fix released. Shipped 8 Sep (PR 2462): driver-forms export and filters; sizing and spacing standards in production QA. Loading animation and pagination fix awaiting QA since late Aug.">Partly&nbsp;delivered</span> |
| <span title="Epic: Improved client risk flags and transport notes • Dispatcher-adjustable client status and permanent risk flags • Increase visibility of risk-flag chips in the driver trip log • Surface transport notes in the driver trip log • Restore automated dispatcher notes • Make transport notes editable after dispatch • Split risk flags from Operational Ban, with managerial approval on ban • Warm handoff flag on intake forms">Risk flags and notes</span> | Risk flags and notes visible and editable where needed, operational ban with manager approval, warm handoff flag | JP | <span title="Shipped 8 Sep (PR 2464): automated dispatcher notes restored, in production QA. Risk-flag changes and warm handoff are in scoping.">Partly&nbsp;delivered</span> |
| <span title="Epic: Quality of life modifications for the Nebraska rollout • Admin, employee and fleet • Intake flow • Dispatch flow • Driver flow • Processing and billing • End-to-end test dispatching a real ride to a Nebraska driver • Nebraska intake forms: confirm what is needed, test what exists, build the rest">Nebraska rollout</span> | Nebraska live end to end: admin, intake, dispatch, driver and billing flows tested, Nebraska forms built | JP | <span title="In refinement: Nebraska intake forms, end-to-end test ride. No build work yet.">Started</span> |
| <span title="Epic: Help center and in-app guidance • Migrate cw.pvragon.com to help.echo1.co • Rewrite the transport lifecycle help-center articles for V2 • In-app help component across all core pages • Review all articles for operational coverage, especially dispatcher workflows">Help center</span> | Help center on help.echo1.co with V2 articles, in-app help on every core page, dispatcher coverage review | William | <span title="Queued: transport lifecycle article rewrite. In refinement: help centre review. In scoping: in-app help component.">Started</span> |
| <span title="Epic: Driver trip log and field experience • Offline route access and offline work capture • Driver-requested void from the trip log • Client belongings capture at pickup and handoff (V1 parity) • Purchase receipts in driver forms • Overdue trip log enforcement with warnings and admin override • Trip-log error detection and dispatch alerting on submission • Systemic sweep of unsignable trip logs, which is blocking billing">Driver trip log</span> | Trip log for the field: offline work, driver void requests, belongings, receipts, overdue enforcement, error alerts, unsignable-log sweep | none | <span title="In scoping: driver-requested void, purchase receipts. In refinement: offline access, belongings capture, unsignable trip log sweep.">Started</span> |
| <span title="Epic: ETA accuracy • Two ETA timers and flags: contractual long ETA and operational ETA • Blown ETA report for crisis transports • Delayed drop-off recognition to prevent auto-miss">ETA accuracy</span> | Contractual and operational ETAs tracked separately, blown-ETA reporting, delayed drop-off handling | none | <span title="In refinement: response time and late arrival expansion. In scoping: late ETA investigation. Blown ETA report is in backlog.">Started</span> |
| <span title="Epic: Unified notifications and client communications • Unified Notifications Service • Configurable notification schedule and channel per requesting entity • Ride confirmation SMS build • Suppress SMS for flight-risk clients on involuntary admissions • Email deliverability re-testing for intake notifications • Route deviation email alert to admins">Notifications</span> | One notification service: per-entity schedules and channels, ride confirmation SMS, flight-risk suppression, verified email delivery, deviation alerts | none | <span title="All items in backlog.">Not&nbsp;started</span> |
| <span title="Epic: Reporting and analytics • Lifecycle Tracker built on V2 data • Audit the Operations Report and Dispatcher Productivity data • Data export tool • PDF trip log downloads • Audit package downloads • Actual driven GPS path on the routes page">Reporting</span> | V2 reporting: lifecycle tracker, audited operations reports, data export, trip log PDFs, audit packages, driven GPS path | none | <span title="All items in backlog.">Not&nbsp;started</span> |
| <span title="Epic: Migrate HR and admin users out of Samsara • Driver onboarding pathway in Echo1 • Vehicle onboarding pathway in Echo1 • Gateway setup pathway in Echo1 • Lock admins out of Samsara">Admin off Samsara</span> | Driver, vehicle and gateway onboarding in Echo1, then admins locked out of Samsara | none | <span title="No tickets yet.">Not&nbsp;started</span> |
| <span title="Epic: In-app messaging • Driver to dispatcher messaging • Dispatcher to manager messaging">Messaging</span> | In-app messaging: driver to dispatcher, dispatcher to manager | none | <span title="No tickets yet.">Not&nbsp;started</span> |
| <span title="Epic: In-app issue log • Entire workflow from the v1 plan • People discuss issues tied directly to transports • Manager escalation and approval flow • Open discussion vs manager discussions">Issue log</span> | Issue log tied to transports, with open and manager-only discussion and escalation | none | <span title="No tickets yet.">Not&nbsp;started</span> |
| <span title="Epic: Customer login and reporting • Login capability for customers (not riders) • Dedicated area of the site where they can see their transports • Reporting and analytics for their transports • Ability to manage client profiles (open question)">Customer portal</span> | Customer login to see and report on their own transports, possibly manage client profiles | none | <span title="No tickets yet.">Not&nbsp;started</span> |
| <span title="Epic: Streamline and formalize customer success processes • New strategy for 24/7 realtime support • Monitoring, metrics and queue management tools">Customer success</span> | 24/7 support strategy with monitoring, metrics and queue tools | none | <span title="No tickets yet.">Not&nbsp;started</span> |
| <span title="Epic: Finalized transport processing UI and UX • Finalize the improved UX flow for the entire historic transports page and processing • Implement that design">Processing redesign</span> | Historic transports and processing flow redesigned and rebuilt | none | <span title="No tickets yet.">Not&nbsp;started</span> |
| <span title="Epic: Finalize modern dev environment • Feature flags • Preview environments • Test gates check less than they appear to • Flip-flop detector CI check for regression-reintroducing diffs • Staging equivalency: mirror production data and config • Formal dev test account set, and a global toggle to hide test records">Dev environment</span> | Modern dev environment: feature flags, preview environments, real test gates, regression detector, staging parity, test accounts | none | <span title="Three items in backlog, none picked up.">Not&nbsp;started</span> |
| <span title="Epic: Core platform services • Dispatch Orchestration Service • Database health monitoring • Merge Assets and Vehicles • Admin Tools data transfer and request management">Platform services</span> | Dispatch orchestration service, database health monitoring, asset and vehicle merge, admin data tools | none | <span title="All items in backlog.">Not&nbsp;started</span> |

## Contract and billing

| Month 2026 | Contracted |
| --- | --- |
| March | $86,000 |
| April | $119,500 |
| May | $120,000 |
| June | $118,500 |
| July * | $108,500 |
| August | $95,000 |
| September | $89,000 |
| October | $89,000 |
| November | $89,000 |
| … | … |

<small>* From July, includes $9,000 a month for Rafael, added per the discussion between David and James.</small>

The tapering in the roster below is what meeting that figure requires.

## The team

One status per person. Peak staffing ran April through June.

| Person | Role | Status |
| --- | --- | --- |
| James Hereford | CEO, acting CTO | Stays |
| Bradd Schofield | Product Manager | Stays |
| Roman Naidenko | Senior Engineer | Stays |
| JP Casabianca | Engineering Lead | Stays |
| Rafael Casabianca | Data and Infrastructure Lead | Stays |
| Saymond Montoya | QA Engineer | Stays |
| William Titus | Customer Success | Required&nbsp;Downsizing |
| Alexander Pavelko | Senior Engineer, part-time | Required&nbsp;Downsizing |
| Victor Cheung | Engineer | Required&nbsp;Downsizing |
| Prameeth Kotian | Program Manager | Required&nbsp;Downsizing |
| David Pérez | Full-stack Engineer | Left Aug 2026 |
| Dana Hetté | Delivery Manager | Left Aug 2026 |
| Muhammad Farhan | DevOps and Infrastructure | Left Jul 2026 |
| Clarissa Mitidiero | Customer Success and UAT | Left Jul 2026 |
| Bilal Mughal | Engineer, test automation | Left Apr 2026 |

## Who covers what

The application by area, and the people against each area.

<div class="coverage">
<p class="coverage-hint">Swipe sideways to see every column.</p>
<!-- coverage-map -->
</div>

## <span title="Same roster shape: two US leads, one US senior engineer, seven nearshore seats. Prices are what such agencies bill per seat, blended across the ten.">Price per person, against the market</span>

RideCare pays about $11.1k a month per person on Echo1. A hybrid US-lead plus nearshore agency fielding the same ten seats would charge $12.4k to $15.6k.

<div class="benchmark">
<!-- benchmark-chart -->
</div>

| Hybrid agency | Per person |
| --- | --- |
| <span title="One in ten hybrid agencies would price the roster at or below this. Published 2026 rate bands: Accelerance survey of 60 firms, Mismo, nCube, DistantJob, BLS.">Low (P10)</span> | $12.4k |
| <span title="Matches the $13.4k per seat from the independent same-roster benchmark in the full assessment.">Typical (P50)</span> | $13.9k |
| High (P90) | $15.6k |
| **<span title="Current monthly billing across the 10 people on Echo1. Below the lowest tenth of agencies at rate card; roughly equal to the lowest tenth after the 10 to 20% discount agencies give long-term dedicated teams.">RideCare today</span>** | **$11.1k** |
