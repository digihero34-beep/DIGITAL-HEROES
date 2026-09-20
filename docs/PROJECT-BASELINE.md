# Digital Heroes — Project Baseline Analysis

> **Document Type**: Architecture & Engineering Analysis  
> **Phase**: Master Implementation Planning Only (No Application Code Modified)  
> **Date**: March 2026  
> **Source of Truth**: Digital Heroes PRD (Level 1), Version 1.0  

---

## 1. Executive Summary

This document establishes the verified baseline of the `DIGITAL HEROES` project repository prior to any implementation activity. It records the existing physical workspace state, tooling environment, architectural gaps, and the foundational requirements necessary to execute the Digital Heroes platform in strict accordance with the Digital Heroes PRD (Level 1) and the project's industrial engineering and premium design rules.

---

## 2. Workspace & Environment Inspection

A comprehensive inspection of the workspace root (`E:\DIGITAL HEROES`) was conducted:

| Parameter | Observed Status | Notes / Findings |
| :--- | :--- | :--- |
| **Workspace Root** | `E:\DIGITAL HEROES` | Active workspace directory |
| **Git Remote Repository** | `https://github.com/digihero34-beep/DIGITAL-HEROES.git` | Official remote repository provided by stakeholder (currently clean/empty). |
| **Local Git Status** | Pending initialization | Remote verified accessible; local git repository to be initialized and linked in Phase 0. |
| **Project Type** | Greenfield | No application source code, package manifests, or lockfiles exist. |
| **Existing Directory Structure** | `.agents/rules/` | Contains 22 master and subsystem engineering/design rule files. |
| **Existing Files** | `Digital Heroes PRD (Level 1).pdf` | 250,467 bytes. Official 14-page PRD specification (Level 1). |
| **Package Manifest (`package.json`)** | Not present | No Node.js project initialized yet. |
| **Dependencies** | None installed | Greenfield state. |
| **Runtime Environment** | Node.js / Python 3.8 / PowerShell | System host has Node, Python 3.8, PowerShell 5.1/7. |
| **Database Configuration** | None | No active local database, migrations, or ORM schema. |
| **Deployment Setup** | None | No Vercel configuration or Supabase project connected yet. |

---

## 3. Directory Layout Baseline

The physical filesystem layout prior to planning documentation creation is:

```
E:\DIGITAL HEROES\
├── .agents\
│   └── rules\
│       ├── architecture-industrial-standard-master.md
│       ├── architecture-industrial-standard-part-1.md
│       ├── architecture-industrial-standard-part-2.md
│       ├── architecture-industrial-standard-part-3.md
│       ├── architecture-industrial-standard-part-4.md
│       ├── architecture-industrial-standard.md
│       ├── database-industrial-standard-master.md
│       ├── database-industrial-standard-part-1.md
│       ├── database-industrial-standard-part-2.md
│       ├── database-industrial-standard-part-3.md
│       ├── main-core-engineering.md
│       ├── prd-compliance.md
│       ├── premium-product-design-master.md
│       ├── premium-product-design-part-1.md
│       ├── premium-product-design-part-2.md
│       ├── premium-product-design-part-3.md
│       ├── premium-product-design-part-4.md
│       ├── premium-product-design-part-5.md
│       ├── premium-product-design-part-6.md
│       ├── premium-product-design-part-7.md
│       ├── security.md
│       └── testing.md
└── Digital Heroes PRD (Level 1).pdf
```

---

## 4. Architectural Baseline & Target Stack Evaluation

Because the project is at a clean-slate greenfield baseline, the architectural selection must satisfy both the mandatory deliverables of the PRD (§ 15) and the industrial engineering directives:

### 4.1 Required Platform Deliverables (PRD § 15 & § 15.1)
1. **Live Website**: Fully deployed, publicly accessible URL on a new Vercel account.
2. **User Panel**: Functional signup, login, score entry (Stableford 1–45, 5 rolling scores), charity selection, draw participation, and user dashboard.
3. **Admin Panel**: Functional admin dashboard covering user management, draw configuration/simulation/publication, charity management, winner verification, and payout processing.
4. **Database**: Backend connected via Supabase PostgreSQL with relational integrity, constraints, and Row-Level Security (RLS).
5. **Payment Processing**: Stripe integration for recurring monthly and yearly subscription plans, with real-time status checks.

### 4.2 Architectural Stack Decision

To adhere strictly to the engineering rules (Clean Architecture, Modular Monolith, Strict Type Safety, Server-Side Authorization):

| Architectural Layer | Target Technology | Justification |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router, React 19, TypeScript)** | Standard for Vercel deployment; supports React Server Components, Server Actions for mutation boundaries, Route Handlers for Stripe webhooks, and strict server-side authorization. |
| **Language** | **TypeScript 5 (Strict Mode)** | Absolute type safety required; zero `any`; explicit domain models. |
| **Styling & Design System** | **Vanilla CSS / CSS Modules with Design Tokens** | Maximum flexibility and control; complies with Web Application Development rule (avoid Tailwind unless explicitly requested) and ensures bespoke, un-templated visual identity. |
| **Database & Auth** | **Supabase (PostgreSQL 15+)** | Managed PostgreSQL with native Row-Level Security (RLS), ACID transactions, check constraints, foreign keys, and cryptographic extensions (`pgcrypto`). Supabase Auth provides secure session handling and JWT identity. |
| **File Storage** | **Supabase Storage (Private Bucket)** | Secure storage for winner verification proof screenshots, protected by RLS and accessed exclusively via short-lived signed URLs. |
| **Payment Gateway** | **Stripe API & Webhooks** | PCI-compliant recurring billing for monthly and discounted yearly plans; cryptographic webhook signature verification; idempotent state transitions. |
| **Testing Framework** | **Vitest + Playwright** | Fast unit/integration test execution for pure domain rules (Vitest) and end-to-end user journeys (Playwright). |

---

## 5. Technical Debt & Risk Analysis at Baseline

1. **No Existing Codebase**: While this guarantees zero legacy bugs, it requires building foundational infrastructure (auth, database migrations, layout, domain services) correctly from day one.
2. **Missing Page in PRD Document**: The PRD PDF transitions from Page 10 (labeled `10 / 14`) to Page 11 (labeled `12 / 14`). Page `11 / 14` (which was to cover § 13 Technical Requirements and § 14 Scalability Considerations according to the Table of Contents) was physically omitted during PDF compilation. All technical and scalability requirements must therefore be rigorously derived from the remaining PRD sections and the Industrial Architecture Master Rules.
3. **Strict Boundary Enforcement**: The application must enforce absolute separation between Public, Subscriber, and Admin roles without relying on client-side state or hidden UI buttons.

---

## 6. Baseline Preservation Rule

During this planning phase, **zero application source code, package configurations, or migrations are created or modified**. Only planning and architectural specifications inside the `docs/` directory are produced until explicit user approval is granted.
