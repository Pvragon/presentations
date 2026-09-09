---
template: deliverable
version: 1.1.0
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

The 1 September draft groups the open work into 26 epics. Hover an epic to see the work inside it. "In flight" means at least one ticket is being built, reviewed or verified in production today. "Started" means only scoping or refinement has happened. Owners are shown where one is named.

| Epic | Owner | State |
| --- | --- | --- |
| <span title="v1 parity for 837 exports (done) • Invoice workflow for contract billing • Updated payer framework for more detailed contract terms • Claims resubmission and rework lifecycle workflow • Data visualization, export and analysis for the billing team • 835 ingestion and improved adjudication tracking • Requester entity renames silently orphaning historical billing records • Restrict who can mark a transport as Processed">Full lifecycle revenue management</span> | Roman | In flight |
| <span title="Crisis classification and its implications from intake form through billing • Dispatch workflow for when manager approval is needed • Cross-state rides need manager approval before dispatch • Hold status to pause the lateness clock on undispatchable crisis rides • Audible alert when a new crisis request arrives • Remove redundant CRISIS/SCHEDULED filters duplicating Secured/Unsecured">Advanced crisis classification and manager approvals</span> | JP | In flight |
| <span title="Get optimization over the line • Optimizer strands riders when an earlier drop-off is free • Routes drivers home mid-day regardless of proximity • Assigns routes outside driver available hours and to off-duty drivers • Max Start and Max End stored as durations but read as clock times • Driver shift and wheel-time constraints • Geo-fence drivers to an operating zone for pickups • Per-run optimizer dashboard (V1 parity) • Stop count discrepancy between V1 and V2 on the same route • Show active client and drop-off distance on optimized routes">Optimization</span> | Rafael | In flight |
| <span title="Vehicle and driver assignment in the trip log, so drivers never pick a vehicle in Samsara • Migrate driver messaging off Samsara • Lock drivers out of Samsara • Driver:vehicle pairing integrity, mid-day vehicle switch corrupts trip data • Mid-day vehicle swap scheduled as a routed stop for ADA vehicle collection">Get drivers out of Samsara</span> | Roman | In flight |
| <span title="Complete the Situational Awareness page • Visual edit log for transport requests and transports • Complete all route editing functions, including extracting multiple clients from a route • Train dispatchers to use Echo1 for all day-to-day processes • Lock dispatchers out of Samsara • Add clients to an already-dispatched route for a group trip • Duplicate already-dispatched or voided transports • Swap vehicle to one the driver has not signed into • Historic transports: state-by-state record search">Remove Samsara from dispatcher day-to-day</span> | JP | In flight |
| <span title="Finalize the form configurator tool • Let RideCare add fields • Intake form creator tool • Training material for creating a new form">Finalize form configuration tools</span> | Victor, Prameeth | In flight |
| <span title="Reconcile audit schema with the v1.0 architecture spec • Verify audit_log auto-capture is working in staging and production • Routes audit log and dispatcher-visible change log (Samsara parity) • Transport history completion and the 17-event catalog • pgaudit in production for PHI-read auditing • 42 CFR Part 2 SUD trip confidentiality controls • MFA enforcement for admin and dispatcher roles">Audit, change log and compliance controls</span> | Rafael | In flight |
| <span title="Fix Cognito role and profile resets in employee management • Employee creation creates the matching Fleet driver record • Review and document the Cognito roles and permissions architecture • Supervisor-only control of transport request dispatcher assignment • Pre-dispatch assignment of transport requests to dispatchers • Expand dispatcher permissions for vehicle and driver reassignment • Clean up V2 employee management">Identity, roles and employee management</span> | Rafael | In flight |
| <span title="Stop the client edit drawer wiping stored addresses and dropping fields • Client merge for tenant admins, carrying claims, communications and SMS sessions • Facility merge, soft delete, and type and subtype editing • Facility address 2 capture across the universal autocomplete component • Stop case-manager submissions writing bad addresses into facilities • Retain the client home address collected on public intake">Client and facility data integrity</span> | Alexander, Roman | In flight |
| <span title="Architectural review and documentation of all submission paths • Fix variant contracts stuck at draft, which makes discharge and multistop forms unavailable • Mitigate stale request-form contracts parked by the production deploy race • V1 to V2 form parity review • Migrate email-intake LLM extraction to the OpenAI Responses API • Separate the staging email parser from the production intake inbox">Intake and submissions reliability</span> | Victor | In flight |
| <span title="Fix 20 to 30 second page-change load times across every data table • Loading animation for all data grids • Fix pagination controls disappearing when rows-per-page exceeds record count • Minimum sizing, spacing and colour formatting standards • Multi-select, filter and CSV export on driver forms">Data grid performance and usability</span> | JP | In flight |
| <span title="Admin, employee and fleet • Intake flow • Dispatch flow • Driver flow • Processing and billing • End-to-end test dispatching a real ride to a Nebraska driver • Nebraska intake forms: confirm what is needed, test what exists, build the rest">Quality of life for the Nebraska rollout</span> | JP | Started |
| <span title="Migrate cw.pvragon.com to help.echo1.co • Rewrite the transport lifecycle help-center articles for V2 • In-app help component across all core pages • Review all articles for operational coverage, especially dispatcher workflows">Help center and in-app guidance</span> | William | Started |
| <span title="Offline route access and offline work capture • Driver-requested void from the trip log • Client belongings capture at pickup and handoff (V1 parity) • Purchase receipts in driver forms • Overdue trip log enforcement with warnings and admin override • Trip-log error detection and dispatch alerting on submission • Systemic sweep of unsignable trip logs, which is blocking billing">Driver trip log and field experience</span> | none | Started |
| <span title="Dispatcher-adjustable client status and permanent risk flags • Increase visibility of risk-flag chips in the driver trip log • Surface transport notes in the driver trip log • Restore automated dispatcher notes • Make transport notes editable after dispatch • Split risk flags from Operational Ban, with managerial approval on ban • Warm handoff flag on intake forms">Improved client risk flags and transport notes</span> | none | Started |
| <span title="Two ETA timers and flags: contractual long ETA and operational ETA • Blown ETA report for crisis transports • Delayed drop-off recognition to prevent auto-miss">ETA accuracy</span> | none | Started |
| <span title="Unified Notifications Service • Configurable notification schedule and channel per requesting entity • Ride confirmation SMS build • Suppress SMS for flight-risk clients on involuntary admissions • Email deliverability re-testing for intake notifications • Route deviation email alert to admins">Unified notifications and client communications</span> | none | Not started |
| <span title="Lifecycle Tracker built on V2 data • Audit the Operations Report and Dispatcher Productivity data • Data export tool • PDF trip log downloads • Audit package downloads • Actual driven GPS path on the routes page">Reporting and analytics</span> | none | Not started |
| <span title="Driver onboarding pathway in Echo1 • Vehicle onboarding pathway in Echo1 • Gateway setup pathway in Echo1 • Lock admins out of Samsara">Migrate HR and admin users out of Samsara</span> | none | Not started |
| <span title="Driver to dispatcher messaging • Dispatcher to manager messaging">In-app messaging</span> | none | Not started |
| <span title="Entire workflow from the v1 plan • People discuss issues tied directly to transports • Manager escalation and approval flow • Open discussion vs manager discussions">In-app issue log</span> | none | Not started |
| <span title="Login capability for customers (not riders) • Dedicated area of the site where they can see their transports • Reporting and analytics for their transports • Ability to manage client profiles (open question)">Customer login and reporting</span> | none | Not started |
| <span title="New strategy for 24/7 realtime support • Monitoring, metrics and queue management tools">Streamline and formalize customer success processes</span> | none | Not started |
| <span title="Finalize the improved UX flow for the entire historic transports page and processing • Implement that design">Finalized transport processing UI and UX</span> | none | Not started |
| <span title="Feature flags • Preview environments • Test gates check less than they appear to • Flip-flop detector CI check for regression-reintroducing diffs • Staging equivalency: mirror production data and config • Formal dev test account set, and a global toggle to hide test records">Finalize modern dev environment</span> | none | Not started |
| <span title="Dispatch Orchestration Service • Database health monitoring • Merge Assets and Vehicles • Admin Tools data transfer and request management">Core platform services</span> | none | Not started |

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
