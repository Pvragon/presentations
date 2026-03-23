---
title: "Echo1 V2 — Week 1 Milestones"
subtitle: "Foundation Sprint: March 24–28, 2026"
brand: pvragon
type: html-presentation
created: 2026-03-23
---

# Echo1 V2 — Week 1 Milestones

Foundation Sprint: March 24–28, 2026

---

## Week 1 Overview

Theme: AWS infrastructure up, app scaffold running locally, schema finalized, RLS validated on local Postgres.

7 exit criteria that must be met by end of Friday, March 28.

---

## 1. AWS Infrastructure Provisioned

Farhan — VPC, RDS Aurora, Valkey ×2, Cognito, Secrets Manager, CDK environment separation (dev + staging).

Critical dependency chain: VPC → RDS + Valkey → gates Roman's auth chain in Week 2.

Spikes: S1, S2, S3, S4, S8, S13, S15, S16. Rafael and Bilal assist where possible.

---

## 2. Schema + RBAC Finalized (COB Tuesday 3/25)

Jaime — V2 schema delivered JIT domain-by-domain, finalized COB 3/25. RBAC model (roles, permissions, role-tenant rules) delivered same day.

Consumers: Roman (resolver auth, GraphQL co-design), JP (GraphQL schema co-design), Rafael (Drizzle schema files, RLS policies), Farhan (Cognito groups).

Highest-risk deliverable this week — most people are blocked without it.

---

## 3. App Scaffold Running Locally

JP + David — Monorepo scaffold. Next.js App Router on Fastify. GraphQL Yoga on Fastify. WebSocket setup (local first). GraphQL schema co-design with Roman.

David pairs with JP on monorepo scaffold and app foundation — learning V2 stack patterns.

Spikes: S10, S11, S12 (local), S14.

---

## 4. RLS Validated on Local Postgres

Rafael — The architecture's most important validation. Decoupled from AWS timeline via S0 (local Docker Compose harness).

S0: Local test harness — Docker Compose + sanitized V1 data, 2+ tenants, several hundred records, unequal volumes.

S5: Drizzle schema files. S6: RLS policies + SET LOCAL + FORCE ROW LEVEL SECURITY. S7: RLS performance on multi-table dispatch joins.

If S7 shows unacceptable performance on dispatch grid joins, the tenant isolation model needs rethinking. Escalate immediately.

---

## 5. Deploy Pipeline Functional

Farhan — ECS Fargate + GitHub Actions. Can push code to dev environment by end of week.

AWS: V2 runs in existing account (HIPAA BAA, SES, SNS already approved). Environment separation via CDK.

---

## 6. Spec Production Underway (2–4 Specs)

Jaime — Spec production begins. Intake form and TR Management grid are first priorities.

Victor needs intake form spec by 4/4. David needs TR Management spec by 4/4.

Spec-to-build pipeline: Jaime specs the "what" (features, UX, data contracts, business rules). Engineers plan the "how" (implementation tasks, agent prompts, execution).

---

## 7. Seed Data Available for the Team

Rafael — Comes out of S0 (local test harness). 2+ tenants, several hundred records, unequal volumes.

This data enables the entire team to develop against realistic multi-tenant scenarios from day one.

---

## Critical Dependency Chain

Farhan's VPC (S2) → RDS (S3) + Valkey (S4) → Roman's S9 auth chain (Week 2).

S0 decouples Rafael's RLS work from this chain — smart insurance policy.

Schema + RBAC (COB Tuesday) → unblocks Roman, JP, Rafael simultaneously.

---

## Closing

Week 1 sets the foundation. Every milestone this week directly enables feature development in Weeks 3–4.

Questions? Flag blockers early — escalate within 24 hours.
