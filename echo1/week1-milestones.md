---
title: "Echo1 V2 — Week 1 Milestones"
subtitle: "Foundation Sprint: March 23–28, 2026"
brand: pvragon
type: html-presentation
created: 2026-03-23
last_updated: 2026-03-23
version: 2.0.0
---

# Echo1 V2 — Week 1 Milestones

Foundation Sprint: March 23–28, 2026

---

## Week 1 Overview

Theme: AWS infrastructure up, app scaffold running locally, schema finalized, RLS validated on local Postgres.

9 milestones. Ordered by priority — what's blocking the most people comes first.

---

## Priority 1: Schema + RBAC Finalized (COB Tuesday 3/25)

Jaime — V2 schema delivered JIT domain-by-domain, finalized COB 3/25. RBAC model (roles, permissions, role-tenant rules) delivered same day.

Consumers: Roman (procedure auth middleware, tRPC router co-design), JP (tRPC router co-design), Rafael (Drizzle schema files, RLS policies), Farhan (Cognito groups).

Highest-risk deliverable — four people are directly blocked without it.

---

## Priority 2: AWS Infrastructure Provisioned

Farhan (starts Mon 3/24) — VPC, RDS Aurora, Valkey ×2, Cognito, Secrets Manager, CDK environment separation (dev + staging).

Critical dependency chain: VPC → RDS + Valkey → gates Roman's auth chain (S9) in Week 2.

Spikes: S1, S2, S3, S4, S8, S13, S15, S16. Rafael and Bilal assist where possible.

---

## Priority 3: App Scaffold Running Locally

JP + David — Monorepo scaffold. Next.js App Router (pure Next.js, no Fastify). tRPC server setup. tRPC router co-design with Roman.

AG Grid Community + tRPC data source adapter (pagination, sorting, filtering).

David pairs with JP — learning V2 stack patterns while building real foundation code.

---

## Priority 4: RLS Validated on Local Postgres

Rafael — The architecture's most important validation. Decoupled from AWS timeline via S0 (local Docker Compose harness).

S0: Docker Compose + sanitized V1 data, 2+ tenants, several hundred records.
S5: Drizzle schema files. S6: RLS policies + SET LOCAL + FORCE ROW LEVEL SECURITY. S7: RLS performance on dispatch grid joins.

If S7 shows unacceptable performance, escalate immediately.

---

## Priority 5: Deploy Pipeline Functional

Farhan — ECS Fargate + GitHub Actions. Can push code to dev environment by end of week.

V2 runs in existing AWS account (HIPAA BAA, SES, SNS already approved). Environment separation via CDK.

---

## Priority 6: tRPC Subscriptions (SSE) + Valkey Pub/Sub (Local)

JP — tRPC subscriptions with SSE transport, Valkey pub/sub for cross-task event broadcast. Local validation this week, ALB validation in Week 2.

Addresses the CRITICAL Softstackers finding (F-01) — without cross-task broadcast, real-time features break at 2+ Fargate tasks.

SSE replaces WebSocket as default transport. Pure HTTP — no custom server, no Fastify. Built-in reconnection via EventSource spec.

---

## Priority 7: Spec Production Underway (2-4 Specs)

Jaime — Page-level specs for the spec-to-build pipeline. Intake form and TR Management grid are first priorities.

Victor needs intake form spec by 4/4. David needs TR Management spec by 4/4.

Spec = the "what" (features, UX, data contracts, business rules). Engineer plans the "how" (implementation tasks, agent prompts, execution).

---

## Priority 8: Agentic Workflow Standardization

JP — Monorepo agent infrastructure. CLAUDE.md files, coding conventions, agent prompt patterns, file naming standards.

This is what makes the spec-to-build pipeline fast. Without established conventions, every engineer reinvents the wheel and JP spends Week 3 on code review rework instead of feature coaching.

---

## Priority 9: Project Planning + Spec Template

Jaime — First month plan finalized, week 1 task plan distributed, spec template designed.

The spec template is needed before spec production can scale. Defines the structure engineers and agents consume: features, UX flow, data contracts, business rules.

Additionally: kickoff meetings 4-5 execution, risk register updates, milestone tracking setup.

---

## Seed Data (Byproduct of S0)

Rafael's S0 local test harness produces multi-tenant seed data as a byproduct. 2+ tenants, several hundred records, unequal volumes.

Not a standalone milestone — it falls out of RLS validation work. Available to the team when S0 completes (Monday/Tuesday).

---

## Critical Dependency Chain

Farhan's VPC (S2) → RDS (S3) + Valkey (S4) → Roman's S9 auth chain (Week 2).

S0 decouples Rafael's RLS work from this chain — smart insurance.

Schema + RBAC (COB Tuesday) → unblocks Roman, JP, Rafael simultaneously.

---

## Closing

Week 1 sets the foundation. Every milestone directly enables feature development in Weeks 3-4.

Flag blockers early — escalate within 24 hours.
