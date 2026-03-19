---
template: presentation
version: 0.1.0
summary: "V1 → V2 changes presentation for Meeting 3 product walkthrough. Covers platform shift, domain-by-domain improvements, new V2 capabilities, dropped features, and what stays the same. Designed for markdown-to-HTML slide conversion."
created: 2026-03-19
last_updated: 2026-03-19
maintainer: pvragon
status: draft
---

<!-- Slide separator: --- -->

# What's Changing in V2

## From What You Just Saw → What You're Building

---

## The Platform Shift

Everything Saymond just showed you runs on **Backendless** — a no-code platform we've outgrown.

| | V1 (Today) | V2 (Echo1) |
|---|---|---|
| **Platform** | Backendless (no-code) | Next.js 14, Fastify, GraphQL Yoga |
| **Database** | Backendless DB (PostgreSQL under the hood) | Aurora PostgreSQL + Drizzle ORM |
| **Hosting** | Backendless Cloud (single K8s node) | AWS Fargate (containerized) |
| **Auth** | Backendless user system | AWS Cognito + MFA |
| **Caching** | None | Valkey (Redis-compatible) — two instances |
| **Real-time** | Backendless RT channels | GraphQL subscriptions via WebSocket |
| **Multi-tenant** | No | Yes — Ride Care is the anchor tenant |
| **Compliance** | HIPAA (partial) | NIST 800-53 (covers HIPAA + government audits) |

**Why rebuild?** Single-tenant limits. Compliance gaps. Vendor lock-in. No path to selling this platform to other transportation providers.

---

## Intake & Forms

**What you saw:** A form built in Backendless UI Builder with a 1,042-line submit handler. Entity-specific configuration limited to boolean section toggles. One form submission = one transport request, tightly coupled — the submit handler creates the TR, the client record, the facility records, sends notifications, and publishes events all in one synchronous transaction.

### What's changing

- **Survey.js metadata-driven form engine** — forms defined as JSON schemas, not UI Builder pages. Question-level control per entity, not just section toggles.
- **New Submission entity** — V2 introduces a first-class **Submission** record as a parent entity in the database. The form writes a Submission; an async processor then creates one or more TransportRequest records from it. The 1:1 relationship between form submission and TR no longer holds. Even a simple single-ride request goes through this path: form → Submission → async processor → TR(s). The Submission has its own lifecycle, status tracking, audit trail, and admin interface for viewing/reprocessing failures.
- **Advanced request types** — because Submissions decompose into TRs server-side, V2 supports parent/accompanying riders, automatic return trips, multi-stop rides, recurring rides, batch requests, and joined ride requests. Each decomposes into atomic A-to-B transport requests (the fundamental billing and optimization unit never changes).
- **Async submission** — the form validates client-side, writes one JSON payload to the Submission table, and confirms instantly (HTTP 202). All downstream work — client resolution, facility resolution, TR creation, notifications — happens asynchronously within a 1-2 minute SLA. The form can't break because of backend issues.
- **Requesting Entity Management** (new) — centralized admin surface for per-entity configuration: form schemas, cancellation rules, notification workflows, billing requirements, program behavior. Replaces scattered boolean toggles.

### Stretch goal

- **Decoupled static form (CDN/S3)** — a fully independent copy of the intake form hosted on CloudFront/S3 that has zero dependency on the main application. If the entire app goes down, requesters can still submit rides. Submissions write to a minimal high-availability endpoint (API Gateway + Lambda) and sync to the primary database when the app recovers. The form that external partners use to request rides should never go down — even during a full platform outage.

---

## Dispatch

**What you saw:** All-or-nothing synchronous dispatch. If any step fails, roll back and start over. Four overlapping Samsara integrations.

### What's changing

- **Dispatch intent capture** — the system records what the dispatcher selected as JSON before executing. If something fails, the system can retry without the dispatcher re-doing their work.
- **Facility-to-facility distance cache** — stop re-calling Google Distance Matrix for facility pairs we've already calculated. Persistent PostgreSQL cache, not ephemeral.
- **Unified Samsara service** — four overlapping integration layers consolidated into one clean service. Modular API pattern: atomic API calls separate from business logic.
- **Circuit breakers** — if Samsara goes down, dispatch doesn't break. Transport is created and marked "pending Samsara confirmation" until the service recovers.

### New workflow capabilities

- Transport request duplication with route/time selection
- Auto-missed status for unworked TRs past their pickup window
- Void causation tracking (why did this void happen?)
- Role-based backdating with audit trail

---

## Transport Management & Processing

**What you saw:** A 53-column AG Grid for real-time transport visibility. Manual review of every completed ride.

### What's changing

- **Performant AG Grid** — server-side paging with inline filters. No more loading all records at once and watching the browser struggle.
- **In-app fleet monitoring** — live view of all active driver positions, statuses, route ETAs, and projected end-of-route locations. ~30-second refresh. No more switching to Samsara for fleet visibility.
- **Record locking via WebSocket** — real-time awareness of who's editing what. No more stepping on each other's work.
- **Data integrity as architecture** — schema constraints, application-level validation, and transaction guarantees built in. Fewer corrections needed during review because bad data is harder to create.
- **Issue tracking from transport** — badge column on the grid, create issues directly from a transport, threaded comments, manager escalation, linked HR records.

---

## Billing & Claims

**What you saw:** String-typed billing fields, an audit toolkit called "TEST" with 14 mystery methods, and export caps from platform limitations.

### What's changing

- **Proper numeric data types** — all billing fields stored as numbers, not strings. No more epsilon-based float comparison hacks.
- **Rebuilt audit tooling** — clear naming, documented purpose per method, trustworthy output. The billing team can trust what the tools tell them.
- **Per-tenant billing configuration** — each tenant maintains their own NPI, TIN, payer IDs, clearinghouse credentials. This is how multi-tenancy works at the billing level.
- **X12 837P rebuilt in TypeScript** — EDI generation on the new stack with Step Functions orchestration for the submission pipeline.
- **Insurance model cleanup** — deprecated Client-level insurance fields retired. Transport-level insurance model (which is correct) carried forward cleanly.

### Stretch goals

- 835 remittance auto-ingest (close the claims loop automatically)
- Raised export caps (5K-10K records)
- Invoice generation for private contracts

---

## Driver Experience

**What you saw:** Two trip log variants (crisis and pre-scheduled), signature capture, and connectivity that can disrupt sessions.

### What's changing

- **Session resilience** — driver sessions survive connectivity interruptions without re-login or tab refresh. Critical for rural Oklahoma, Kansas, and Louisiana routes.
- **Feature parity** — both trip log variants get the same capabilities (cancellation requests, form uploads, everything consistent).
- **Push notifications** — drivers get real-time updates on assignments and changes.

**What's NOT changing:** The core trip log workflow, the two-variant approach (crisis vs. pre-scheduled), signature capture, the driver-facing form structure. Drivers will see a familiar workflow on better technology.

---

## Communications & Notifications

**What you saw:** SMS and email notifications for dispatch, trip logs, confirmations, and ride reminders. V1 already has night-before TANF confirmations, 2-way SMS, driver ETA notifications, and day-ahead cancel flows in production.

### What's changing

- **Communication sophistication** — V2 continues improving the effectiveness of SMS, email, and phone-based communication. Better handling of undeliverable messages, delivery status tracking, retry logic, and channel optimization so communications actually reach the people they're meant for.
- **Communication audit trail** — visible log per transport showing all SMS and emails sent, with timestamps, recipients, and delivery status. Dispatchers can look at any transport and see exactly what the client received. No more guessing.
- **Per-tenant notification configuration** — each tenant defines which notifications their clients receive, via which channels, at which trigger points. Communication workflows become configurable, not hardcoded per program.
- **Overall communication UX** — the goal is a unified, reliable communication layer where dispatchers, drivers, and clients all have the right information at the right time through the right channel.

### Stretch goals

- AI-conducted phone calls for ride confirmation
- Full dispatcher-client messaging thread within the transport view
- PWA deployment to app stores

---

## Analytics & Reporting

**What you saw:** Operations reports, dispatcher productivity dashboards, real-time ops display, data export.

### What's changing

- **Config-driven dashboards** — new dashboard = new config file, not a week-long development project. Target: 2-4 hours per new dashboard.
- **Drizzle + Tremor/Chart.js** — query layer and visualization components that match the V2 design system. No iframes, no foreign-looking embedded tools.
- **Tenant-scoped reporting** — every report filtered by tenant. Platform-level aggregates for super admins only.
- **Real-time ops dashboard** — rebuilt with WebSocket data feed for live metrics.

---

## Entirely New in V2

These capabilities don't exist in V1 at all.

| Capability | What It Does |
|-----------|-------------|
| **Multi-tenancy** | Multiple transportation providers on one platform. Ride Care is tenant #1. Each tenant gets isolated data, config, billing, and users. |
| **Tenant provisioning** | Create a new tenant with isolated config — payers, entities, billing, users, roles — all through an admin interface. |
| **Platform administration** | Cross-tenant management, platform health monitoring, tenant usage metrics, concierge access for support. |
| **NIST 800-53 compliance** | Government-grade security framework. Four-layer tenant isolation (JWT → resolver → connection context → row-level security). Full audit trail. |
| **Issue tracking & HR records** | Structured incident tracking tied to transports. Manager escalation, private HR threads, personnel history. |
| **In-app notifications** | Toast notifications with a persistent notification tray. Operational alerts, status changes, system messages. |
| **Form versioning** | Submissions traced to the schema version they were captured under. Audit trail integrity as form definitions evolve. |

---

## What's Being Dropped

Features that are no longer needed or are being replaced.

| Dropped | Why |
|---------|-----|
| COVID-19 screening questions | No longer required by any entity or contract |
| Python/Playwright backup bot | JS backup is authoritative; V2 uses managed RDS backups |
| Outlook IMAP polling integration | Email forwarding rule replaces OAuth2/IMAP inbox polling |
| Legacy feedback system | Superseded by Chatwoot ticketing |
| Manual Samsara dispatch backfill | All dispatch goes through the app in V2 |
| Daily snapshot records for optimization | Driver templates in driver profiles already handle this |

---

## What Stays the Same

The core business logic transfers. Domain knowledge you build this week carries forward.

- **Transport lifecycle** — the six stages (intake → dispatch → execution → review → billing → reporting) are identical
- **Programs** — Crisis, Pre-scheduled, TANF — same operational model
- **Transport statuses** — same state machine (Voided, Cancelled, Completed, Processed, Billed)
- **Dispatch methods** — App-only, App+Samsara, Bulk optimization, Route creation
- **Trip log workflow** — same driver experience, two variants, signature capture
- **Billing model** — transports → service lines → claims → EDI submission → adjudication
- **Client/Facility/Employee entities** — same domain model, cleaner schema

**The workflows are the same. The technology underneath is what's changing.**

---

## Where to Dig Deeper

| Resource | What It Covers |
|----------|---------------|
| **RideCare User Video Series** | How dispatchers and drivers use V1 today |
| **Figma UX / Product Design** | V2 UI design direction |
| **V1 Product Spec** | 959 features across 12 domains — what exists today |
| **V2 Feature Specs** | 1,375 features across 14 domains — what you're building |
| **V2 Architecture Spec** | System design, tech stack, tenant isolation, deployment |
| **Your role description** | What you own, what you're responsible for, your authority boundaries |

All links are in the ClickUp Dev Space and were shared in Meeting 1.

**Next up:** Meeting 4 — Roadmap, Milestones, and Engineering Plan
