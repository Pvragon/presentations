---
template: presentation
version: 0.1.0
summary: "Meeting 3 presentation: Echo1 V2 roadmap, milestones, technical unknowns, and month 1 weekly plan. Designed for HTML slide generation."
created: 2026-03-18
last_updated: 2026-03-18
maintainer: pvragon
status: draft
---

<!-- Slide 1 -->
# Echo1 V2 — Roadmap & Engineering Plan

### Meeting 3 | March 20-21, 2026

RideCare Operations Platform — ground-up rebuild as multi-tenant SaaS

---

<!-- Slide 2 -->
## Project Lifecycle

### Phase A — Development Sprint (Mar 24 – May 15)

Build the V2 platform from foundation to feature-complete. Weeks 1-2 validate the stack (infrastructure, auth chain, RLS, deploy pipeline). Weeks 3-8 are feature development against Jaime's page specs. All 14 feature domains built, tested, and deployed to staging.

### Phase B — Stabilization + Parallel Running (May 15 – Aug 15)

V2 enters parallel running alongside V1. Both systems live, same data flowing through both. Clarissa leads UAT — exhaustive validation of every dispatcher workflow. Migration dry runs continue until data integrity is confirmed. Cutover happens when confidence is earned, not on a fixed date. V1 remains available as rollback throughout.

### Phase C — Ongoing Operations (Aug 15+)

V1 decommissioned. V2 is the production system. Team transitions to steady-state: feature development, new state onboarding, performance optimization, compliance maintenance. Dana and Rafael exit by end of July; Delivery Manager assumes coordination.

---

<!-- Slide 3 -->
## Milestone Timeline

| Date | Milestone |
|------|-----------|
| **Mar 24** | Sprint begins. Farhan starts AWS infrastructure. |
| **Mar 25** | Schema + RBAC model finalized (Jaime). |
| **Mar 28** | Week 1 complete: VPC, RDS, Valkey, Cognito up. App scaffold running locally. RLS validated on local Postgres. |
| **Apr 4** | Week 2 complete: Full auth chain proven on Aurora. CI/CD deploying. Layout skeleton ready. First 8-12 page specs delivered. |
| **Apr 11** | Week 3 complete: First features live on staging (AG Grid template page, intake form, login). |
| **Apr 18** | Week 4 complete: 3-4 AG Grid pages. Samsara integration. First migration dry run. |
| **May 7** | Target: parallel running begins (V1 + V2 side-by-side). |
| **May 15** | Target: V2 feature-complete on staging. UAT in full swing. |
| **May–Jun** | Parallel running. UAT. Migration validation. Pen testing. |
| **Jun–Jul** | Cutover (when confidence earned). V1 decommission. Stabilization. |
| **Aug 15** | Steady-state operations. |

---

<!-- Slide 4 -->
## Top 5 Technical Unknowns

### 1. Full Auth Chain (S9)

Cognito JWT → Fastify middleware → tenant context → `SET LOCAL` → RLS-filtered query. Every request in V2 flows through this chain. If any link breaks, the multi-tenancy architecture changes. Roman validates in week 2 on real Aurora.

### 2. RLS Performance on Dispatch Grid (S7)

Row-Level Security on multi-table joins (Transport + Route + Vehicle + Driver). If RLS adds 2+ seconds to the dispatch grid, dispatchers reject V2. Rafael benchmarks locally in week 1, confirms on Aurora in week 2.

### 3. Next.js App Router on Custom Fastify Server (S10)

The entire frontend runs Next.js App Router on a Fastify custom server — not Vercel. Known gotchas with Server Components, SSR streaming, and middleware on custom servers. JP validates in week 1.

### 4. WebSocket Through ALB (S12)

Real-time dispatch dashboard, GPS updates, and record locking all depend on WebSocket subscriptions through the Application Load Balancer. Requires specific ALB config (idle timeout, sticky sessions, connection draining). JP + Farhan validate in weeks 1-2.

### 5. Samsara Multi-Tenant Webhook Routing (S17)

V1 has a single-tenant Samsara integration. V2 needs tenant-aware webhook routing — does Samsara support multiple webhook endpoints per account, or do we build a single receiver with tenant routing? Roman investigates API docs in week 1; answer determines S17 architecture in week 4.

---

<!-- Slide 5 -->
## Week 1 — Foundation (3/24 - 3/28)

::::columns

:::left

**AWS infrastructure goes up.** Farhan builds the CDK foundation: VPC, RDS Aurora, Valkey, Cognito, deploy pipeline, Secrets Manager. 8 spikes — heavy week. Rafael and Bilal assist where possible.

**App scaffold runs locally.** JP + David stand up the monorepo: Next.js on Fastify, GraphQL Yoga, WebSocket setup. Roman co-designs the GraphQL schema with JP as Jaime delivers the V2 schema domain-by-domain.

**RLS validated on local Postgres.** Rafael stands up a local test harness (half-day), pulls sanitized V1 data, and validates the entire RLS pattern — Drizzle, `SET LOCAL`, `FORCE ROW LEVEL SECURITY`, multi-table join performance. Decoupled from AWS timeline.

**Schema + RBAC finalized COB 3/25.** Jaime delivers the V2 schema JIT and the RBAC model. Spec production begins (1-2 page specs/day).

:::right

### Exit Criteria

- [ ] VPC, RDS, Valkey, Cognito provisioned on AWS
- [ ] Schema + RBAC model finalized and delivered
- [ ] Next.js + Fastify + GraphQL Yoga running locally
- [ ] RLS validated on local Postgres (S5, S6, S7)
- [ ] Deploy pipeline functional (can push code to dev)
- [ ] Spec production underway (2-4 specs delivered)
- [ ] Rafael's seed data available for the team

::::

---

<!-- Slide 6 -->
## Week 2 — Auth Chain + Deploy + Layout (3/31 - 4/4)

::::columns

:::left

**The critical spike.** Roman proves the full auth chain end-to-end on real Aurora: Cognito JWT → Fastify middleware → tenant context → `SET LOCAL` → RLS-filtered query. If this fails, escalate to Jaime immediately.

**CI/CD deploys to staging.** Farhan completes the deploy pipeline and WebSocket ALB configuration. The team can push code and see it running on a real environment.

**Layout skeleton ready.** JP defines the Shadcn/ui pattern and app shell structure. Victor implements it. David continues the AG Grid + GraphQL data source adapter. This is the foundation every page builds on.

**Bilal transitions to V2 (3/30).** Monorepo orientation with JP. Starts pairing with David on AG Grid work.

**Dana takes over standups.** Jaime shifts from daily coordination to architecture decisions, spec production, and client communication.

:::right

### Exit Criteria

- [ ] Full auth chain (S9) proven on real Aurora
- [ ] CI/CD deploying to dev + staging
- [ ] WebSocket working through ALB
- [ ] Layout skeleton + Shadcn/ui foundation ready
- [ ] AG Grid + GraphQL pattern validated
- [ ] Connection pooling decision made (S29)
- [ ] Monorepo agent infrastructure in place
- [ ] Dana running standups
- [ ] 8-12 page specs delivered
- [ ] All week 1-2 spikes resolved

::::

---

<!-- Slide 7 -->
## Week 3 — First Features (4/7 - 4/11)

::::columns

:::left

**Feature development starts.** Two foundation streams run in parallel:

**Stream A — Intake form.** Victor builds the transport request submission form using Survey.js + Google Maps wrapper. This gates the entire downstream workflow (intake → TR management → dispatch → transport management).

**Stream B — AG Grid template.** David builds Transport Request Management as the reference AG Grid page. Once this page works, it becomes the blueprint for every list view in the app. Bilal establishes Playwright E2E test conventions against this page, then replicates the template to a second page.

**Backend matches frontend.** Roman builds DataLoader factory, domain resolvers for TR Management, and the NextBillion.ai service module. Farhan builds the tenant onboarding Step Function and S3 upload infrastructure.

**Rafael starts migration ETL** alongside the distance matrix cache build.

:::right

### Exit Criteria

- [ ] TR Management AG Grid page functional with real data
- [ ] Intake form rendering and submitting
- [ ] SSR tenant context pattern established
- [ ] DataLoader factory in place
- [ ] Login page working
- [ ] App shell with error boundaries
- [ ] Distance matrix cache built
- [ ] Tenant onboarding Step Function working

::::

---

<!-- Slide 8 -->
## Week 4 — Template Replication + Integration (4/14 - 4/18)

::::columns

:::left

**AG Grid template proven replicable.** David and Bilal stamp out 3-4 AG Grid pages total from the spec backlog. The template works. Every subsequent list view is a variation.

**Samsara integration lands.** Roman builds the webhook receiver with tenant routing — the fleet tracking pipeline that dispatch depends on. BullMQ job queue goes live with the first real background job.

**First migration dry run (4/18).** Rafael runs the full V1 → V2 migration on staging. Measures duration, row counts, orphaned records, encoding issues, null violations. This is the first real test of whether the data makes it across cleanly.

**15-20+ page specs delivered.** Jaime's spec backlog is healthy. The team isn't waiting for specs — they're consuming them as fast as they can build.

**Dana independently coordinating sprint.** Jaime is freed for architecture, client communication, and hiring.

:::right

### Exit Criteria

- [ ] AG Grid template replicated to 3-4 pages
- [ ] Intake form working end-to-end
- [ ] Samsara webhook receiver operational
- [ ] BullMQ job queue with at least one real job
- [ ] First migration dry run completed and documented
- [ ] 15-20+ page specs delivered
- [ ] At least one agentic workflow pattern adopted cross-team
- [ ] Dana independently coordinating sprint

::::

---

<!-- Slide 9 -->
## What Happens Next

### Weeks 5-8 (Apr 21 – May 15)

Feature development at full velocity. All 14 domains building against Jaime's specs. Migration dry runs 2 and 3. Billing engine (837P generation, Waystar integration). UAT begins with Clarissa. Security consultant engagement ramps.

### May 15 → Cutover

V2 enters parallel running. V1 stays live. Cutover when confidence is earned — not on a calendar date. Rollback to V1 available throughout.

### Questions?
