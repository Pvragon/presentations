---
template: facilitator-guide
version: 0.1.0
summary: "Demo facilitation guide for Saymond — live V1 product walkthrough for Echo1 kickoff Meeting 3. Structured as a transport lifecycle walkthrough with talking points, time budget, and pain points to highlight."
created: 2026-03-19
last_updated: 2026-03-19
maintainer: pvragon
status: draft
---

# Product Walkthrough — V1 Live Demo Facilitation Guide

> **Facilitator:** Saymond
> **Jaime's role:** In the room for Q&A, architecture context, and V2 framing
> **Audience:** Full Echo1 V2 team (new and existing members)
> **Duration:** 90 minutes total (~70 min demo + 20 min Q&A)
> **Goal:** The team sees the real product in action and builds a mental model of what dispatchers, drivers, and administrators actually do every day.

---

## Before You Start

- **Log into the V1 app** with a dispatcher-level account that has access to all major views.
- Have Samsara open in a separate tab (you'll reference it during dispatch).
- Have a second screen or window available for Kimai/ClickUp if someone asks about tooling — but don't demo those here.
- **Don't rehearse a perfect script.** This should feel like "let me show you what my day looks like." The team learns more from watching you navigate naturally than from a polished walkthrough.

---

## Session Flow

Follow the transport lifecycle — the same six stages Jaime covered in Meeting 1. This time, the team sees it live instead of hearing about it.

| Block | Duration | What to Show | Key Points |
|-------|----------|-------------|------------|
| **Intro** | 2 min | Nothing — just set context | "I'm going to walk you through what a typical day looks like for a dispatcher. Everything you're about to see is the real production app with real data." |
| **1. Intake** | 10 min | Transport request form + TR queue | How requests come in, what dispatchers see when they land |
| **2. Dispatch** | 15 min | Dispatch modal + route optimization + Samsara | The core of dispatcher work — assigning drivers to rides |
| **3. Driver execution** | 10 min | Driver trip log (if accessible) or describe from dispatcher side | What drivers see and do on the road |
| **4. Post-transport** | 5 min | Transport grid — processing workflow | How completed rides get reviewed and corrected |
| **5. Billing** | 8 min | Billing page — claim creation, export | How processed transports become revenue |
| **6. Reporting** | 5 min | Operations report + ops dashboard | Where the data ends up |
| **7. Administration** | 15 min | Clients, facilities, employees, entities, user management | How the system is configured and maintained |
| **Q&A** | 20 min | — | Jaime handles architecture/V2 questions |

---

## Block 1: Intake (8 min)

### What to show

1. **The public transport request form** — open the external-facing form that facilities use to submit ride requests.
   - Fill out a few fields to show the flow: client info, pickup/dropoff, date/time, program type.
   - Point out the entity-specific sections — "different requesting entities see different fields based on their configuration."
   - Don't submit — just show the form structure.

2. **The transport requests queue** — switch to the internal dispatcher view.
   - Show the grid with pending transport requests.
   - Point out the filters: "This is what I see when I start my shift. These are all the requests waiting to be worked."
   - Show the different statuses: undispatched, voided.
   - Show how a request gets split into legs if it's a round trip.

### Pain points to mention

- "The form is built in the platform's visual builder — if we need to change a question or add a field, it's a developer task. The new version will let us configure forms without code changes."
- "When we get a high volume day — 500+ requests — this grid can be slow to load. The new version is being built with better performance for large datasets."

---

## Block 2: Dispatch (12 min)

This is the most important block. Spend the most time here.

### What to show

1. **Manual single dispatch** — pick an undispatched transport request and open the dispatch modal.
   - Show the driver availability table — "I'm looking at which drivers are available, what vehicle they have, where they are."
   - Show vehicle selection.
   - Show the distance calculation — "The system calculates how far the driver needs to travel."
   - Walk through App-Only dispatch vs. App+Samsara dispatch — "App-only means we just record it in our system. App+Samsara means the driver also gets the route on their Samsara device."
   - **If possible, dispatch a test ride to Samsara** so the team can see the handoff.

2. **Route optimization (bulk dispatch)** — show the route optimization page.
   - "This is how we handle pre-scheduled rides. The night before, we batch all tomorrow's rides and run them through an optimizer."
   - Show the staging workflow — selecting transport requests, grouping by area/driver.
   - Mention NextBillion.ai — "We send the batch to an optimization service that figures out the best routes."
   - Show what a completed optimized route looks like.

3. **Samsara integration** — flip to the Samsara tab briefly.
   - Show a dispatched route in Samsara — the driver's view, the stops, the GPS tracking.
   - "This is what the driver sees on their device. When I dispatch through the app, it shows up here automatically."

### Pain points to mention

- "If Samsara is down, dispatch gets complicated. We can still dispatch in the app, but the driver doesn't get the route on their device. The new version will handle this more gracefully."
- "The dispatch is all-or-nothing right now. If any step fails — creating the record, sending to Samsara, calculating distance — the whole thing rolls back and I have to start over."
- "We have four different Samsara integrations in the code that kind of overlap. The new version consolidates all of that into one clean integration."

---

## Block 3: Driver Execution (8 min)

### What to show

1. **Driver trip log** — if you can access the driver-facing views, show what drivers see.
   - The upcoming rides list — "When a driver starts their shift, they see their assigned rides for the day."
   - A trip log form — pickup time, drop-off time, mileage, passenger signature, wait times.
   - The difference between crisis (on-demand) and pre-scheduled trip logs — "The system automatically shows the right version based on the driver's day."

2. **If you can't access the driver views directly**, describe from the dispatcher side:
   - Show a completed transport record — "This is what comes back to us after the driver finishes. They filled out all these fields in the app while doing the ride."
   - Point out the signature field, the timestamps, the mileage.

### Pain points to mention

- "Drivers in rural areas sometimes lose cell service. If they set their phone down and come back, they might need to refresh or re-login. The new version will handle that better."
- "The two trip log variants — crisis and pre-scheduled — have some feature gaps between them. The new version makes sure they're consistent."

---

## Block 4: Post-Transport Processing (5 min)

### What to show

1. **Transport grid — processing view** — show completed transports that need review.
   - Filter to show "Completed" transports waiting to be processed.
   - Open one and show the review workflow: "I'm checking that the times are right, the mileage makes sense, the notes are complete."
   - Show how a dispatcher makes corrections — editing times, fixing mileage.
   - Mark one as Processed — "Now this ride is ready for billing."

2. **Transport statuses** — quickly show the status flow:
   - In Progress → Completed → Processed → Billed
   - Voided (clerical error, excluded from everything)
   - Cancelled (happened after driver left, billable)

### Pain points to mention

- "This review step is manual and time-consuming. We're checking every ride for accuracy. The new version will have better data integrity built in so there's less to correct."

---

## Block 5: Billing (8 min)

### What to show

1. **Billing page** — show the billing review grid.
   - Point out the filters — "I can filter by status, date range, program, payer."
   - Show the review status workflow: Pending → Needs Attention → Processed.
   - Show how transports get grouped into claims — "Same client, same day, same payer — those transports become one claim."

2. **Claims export** — show the 837P EDI generation.
   - "When claims are ready, we generate an EDI file — that's the standard format insurance companies accept — and upload it to our clearinghouse."
   - If you can show a generated file or the export process, do so.
   - Mention the two export paths: 837P (standard EDI) and Waystar 213 (alternative format).

3. **Private contract billing** — briefly mention.
   - "Not all billing goes through insurance. Some clients have direct contracts — we export a CSV for those."

### Pain points to mention

- "Some billing fields are stored as text instead of numbers in the database. That causes weird rounding issues. The new version fixes all the data types."
- "Our audit tools work, but they have confusing names — there's a service literally called 'TEST' that has 14 billing audit methods in it. Nobody is totally sure what all of them do. The new version rebuilds these with clear names and documentation."

---

## Block 6: Reporting & Analytics (5 min)

### What to show

1. **Operations report** — show the leadership report.
   - Ride counts, incidents, program breakdowns.
   - "This is what management looks at to understand how the operation is running."

2. **Dispatcher productivity dashboard** — show briefly.
   - "We can see how each dispatcher is performing — how many rides they process, how quickly."

3. **Ops dashboard** — if available, show the real-time operations display.
   - "This runs on a TV in the operations room. Live metrics."

4. **Data export** — show the export page briefly.
   - "If someone needs a custom report, we can query and export data from here."

### Pain points to mention

- "Building a new dashboard or report is a developer project. The new version will make it much faster to create new reports — hours instead of weeks."

---

## Block 7: Administration (15 min)

This is the back-office side of the app — how the system gets configured and maintained. Not part of the daily dispatch flow, but critical context for the engineers building it.

### What to show

1. **Client management** — open the Clients page.
   - Show the client grid — search, filters, how a dispatcher finds a specific client.
   - Open a client record — contact info, insurance, linked transport history.
   - Show duplicate detection — "When a new client comes in, the system flags potential duplicates."
   - Show the merge process — "If we find two records for the same person, we merge them. The system repoints all their rides, claims, and history to the surviving record."
   - Mention red flags — "We can flag a client for behavioral issues or special handling requirements."

2. **Facility management** — show the Facilities page.
   - Show facility search and the Google Places autocomplete for addresses.
   - Open a facility record — address, contacts, linked transport requests.
   - Mention facility merge — "Same idea as client merge. Duplicate facilities get consolidated."

3. **Employee / user management** — show the user management page.
   - Show the employee list — roles, statuses, Samsara IDs.
   - Show role assignment — "This is how we control who sees what. Dispatchers, drivers, supervisors, billing staff — each role has different access."
   - Show the directory view if available.

4. **Requesting entity management** — show the entity configuration page.
   - "Each entity that sends us ride requests — a state agency, a facility, a program — has its own configuration."
   - Show the per-entity toggles — "These control which form fields that entity sees, how their rides are processed, what notifications they get."
   - "Right now this is a bunch of boolean switches. The new version replaces this with a much more flexible configuration system."

5. **Support / ticketing** — show briefly if time allows.
   - "We have a basic ticketing system for internal support issues. The new version will use a dedicated tool called Chatwoot for this."

### Pain points to mention

- "Client merge is limited to 500 records per batch because of platform constraints. The new version removes that cap."
- "The entity configuration is just a bunch of on/off switches. If we need a new option, a developer has to add it. The new version makes this much more configurable."
- "User management is functional but basic. The new version adds proper multi-tenant user management — each tenant manages their own users and roles independently."

---

## Closing (Before Jaime's V1→V2 Slides)

Wrap with something like:

> "That's the full cycle — from a ride request coming in, through dispatch, the driver doing the ride, us reviewing it, billing for it, and reporting on it. Every piece of the app maps to one of those stages. The new version you're building is going to rebuild all of this from the ground up — same core workflow, better technology, and a lot of improvements you'll hear about next."

Hand off to Jaime for the V1 → V2 changes presentation.

---

## Tips

- **Don't rush.** Better to cover intake through billing thoroughly than to speed-run everything and lose people.
- **Use real data.** Don't navigate to empty test pages. Show the production grids with real records (being mindful of PHI — no client names visible to screen share if recording).
- **It's okay to say "I don't know."** If someone asks a technical question about how something works under the hood, defer to Jaime: "That's a Jaime question."
- **Pause for questions between blocks.** Don't wait until the end — engineers will have questions as they see each piece.
- **Call out what's annoying.** You live in this app every day. The things that frustrate you are exactly what the team needs to hear — those are the things they're going to fix.
