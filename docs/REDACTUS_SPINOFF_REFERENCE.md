# RedactUs Spin-Off — Document Reference Pack
**Created:** February 21, 2026
**Purpose:** Complete list of documents to carry into the new RedactUs Emergent project, organised by relevance.

---

## TIER 0: RedactUs Standalone Package (BUILT — ready to save to Git)

| # | File | Path | What it is |
|---|------|------|------------|
| 0a | **Standalone App** | `/app/redactus-standalone/index.html` | Single-file web app. Open in browser, paste text, get redacted output. Works offline. Zero dependencies. |
| 0b | **Engine Module** | `/app/redactus-standalone/redactus-engine.js` | Importable ES module. `import { redactText } from './redactus-engine.js'` |
| 0c | **User Guide** | `/app/redactus-standalone/USER_GUIDE.md` | End-user guide: "How to redact before pasting into Perplexity/ChatGPT/Claude" |
| 0d | **README** | `/app/redactus-standalone/README.md` | Developer-facing: quick start, integration, tiers, tokens |
| 0e | **Security** | `/app/redactus-standalone/SECURITY.md` | Honest limitations and threat model |
| 0f | **Licence** | `/app/redactus-standalone/LICENSE` | MIT |

**Status:** BUILT and TESTED (iteration_52). All 11 test cases pass. UK/US/EU patterns working. IBAN/phone conflict fixed. Ready to push to GitHub.

---

## TIER 1: RedactUs Core (Paste into new project — these ARE the product)

| # | Document | Path | What it gives you |
|---|----------|------|-------------------|
| 1 | **RedactUs Product Concept** | `/app/memory/REDACTUS_PRODUCT_CONCEPT.md` | Vision, tagline, tiers, monetisation, competitive landscape, launch sequence. **This is your opening brief for the new project.** |
| 2 | **Redaction Design (Phases 1-6)** | `/app/memory/REDACTION_DESIGN.md` | Full technical spec: regex patterns, type signatures, **Phase 2.5 image margin crop + Phase 2.6 rectangle redaction with heatmap learning**, dual-path preview wireframes, self-audit feedback, open-source packaging plan. The engineering bible. |
| 3 | **Redaction Engine Source** | `/app/frontend/src/utils/redactionEngine.js` (~310 lines) | Copy-paste ready. Pure JS, zero dependencies, zero host-app coupling. This IS the product core. |
| 4 | **Privacy Guard UI Source** | `/app/frontend/src/components/user/PrivacyGuard.js` (~358 lines) | React settings component. Light refactor needed (remove AI Doctor Ben branding, make Shadcn optional). Reference for the RedactUs React package. |

**How to use:** Paste docs 1 and 2 into your first prompt. Attach files 3 and 4 as code references. The new agent has your full product vision + working code from day one.

---

## TIER 2: Reusable Patterns (Adapt for RedactUs — battle-tested from AI Doctor Ben)

### 2A. Payments & Pricing

| # | Document | Path | What carries over to RedactUs |
|---|----------|------|-------------------------------|
| 5 | **Geo-Pricing Design** | `/app/memory/GEO_PRICING_DESIGN.md` | Currency detection logic (USD/GBP/EUR), Stripe price ID mapping per currency, edge cases (VPN, Channel Islands), localStorage caching. Directly applicable to RedactUs Pro pricing. |
| 6 | **Pricing Change Guide** | `/app/memory/PRICING_CHANGE_GUIDE.md` | How to create/archive Stripe prices, update backend + frontend, grandfather early adopters. Essential ops knowledge for any SaaS. |
| 7 | **Stripe Config Reference** | `/app/AI_DOCTOR_BEN_STRIPE_CONFIG.md` | Stripe account setup checklist, webhook config, DNS for email domain, what agent can/can't do. Reuse the structure — swap the product details. |

### 2B. Email Sequences & Retention

| # | Document | Path | What carries over to RedactUs |
|---|----------|------|-------------------------------|
| 8 | **Email Sequences Reference** | `/app/memory/EMAIL_SEQUENCES_REFERENCE.md` | Complete 5-group email architecture: exit intent, transaction abandoner, unconverted signups, win-back, member onboarding. Copy the structure, rewrite the copy for RedactUs. |
| 9 | **Retention System Design** | `/app/memory/RETENTION_SYSTEM_DESIGN.md` | Churned user CRM: status tracking, note-taking, automated win-back, GDPR considerations. Directly reusable for RedactUs Pro churn management. |
| 10 | **Welcome Experience Design** | `/app/memory/WELCOME_EXPERIENCE_DESIGN.md` | 7-day onboarding touchpoint timeline (email + in-app). Adapt for RedactUs developer onboarding: Day 1 "install + first redaction", Day 3 "add custom patterns", Day 7 "explore Pro features". |
| 11 | **Win-Back Tailoring Process** | `/app/memory/WINBACK_TAILORING_PROCESS.md` | Human-in-the-loop personalised win-back sequences with AI style learning. Useful later when RedactUs has enough customers to warrant tailored outreach. |

### 2C. Privacy & Compliance

| # | Document | Path | What carries over to RedactUs |
|---|----------|------|-------------------------------|
| 12 | **Privacy Compliance Positioning** | `/app/memory/PRIVACY_COMPLIANCE_POSITIONING.md` | UK/EU/US regulatory framing, architecture diagrams, social media copy. RedactUs IS a privacy product — this doc's positioning language is directly reusable. Change "AI Doctor Ben" to "RedactUs" and most of it works. |
| 13 | **GDPR Data Flow** | `/app/GDPR_DATA_FLOW.md` | Data controller/processor chain, processing activities register, data subject rights. RedactUs will need its own version — this is the template. |

---

## TIER 3: Quality & Process Standards (Paste key sections into your new project brief)

| # | Document | Path | What to extract for RedactUs |
|---|----------|------|------------------------------|
| 14 | **Code Excellence Standards** | `/app/memory/CODE_EXCELLENCE_STANDARDS.md` | Garden Principle, Musk Algorithm, KISS/YAGNI/DRY, Pre-Flight Checks, Pre-Deploy Self-Review Protocol. These are product-agnostic engineering standards. Paste the whole thing. |
| 15 | **Coding Protocols Addendum** | `/app/memory/CODING_PROTOCOLS_ADDENDUM.md` | FP-011 rule (gitignore), Anti-Duplication Checkpoint, Design-First Protocol, KISS Checkpoint, Quality Gates, No Redundant Re-Execution. Product-agnostic — paste the whole thing. |
| 16 | **Critical Functions Protocol** | `/app/memory/CRITICAL_FUNCTIONS_PROTOCOL.md` | Pre-deploy checklist structure, P0/P1/P2 test tiers, recovery procedures. Adapt the specific tests for RedactUs but keep the framework. |

---

## TIER 4: Reference Only (Don't paste — but useful to look at if stuck)

| # | Document | Path | Why reference-only |
|---|----------|------|-------------------|
| 17 | Decision Log | `/app/memory/DECISION_LOG.md` | Contains reasoning patterns and debugging lessons. Useful if you hit similar problems but too AI-Doctor-Ben-specific to paste wholesale. |
| 18 | Feature Register | `/app/memory/FEATURE_REGISTER.md` | Shows how we tracked feature status. Copy the format, not the content. |
| 19 | Member Lifecycle Path | `/app/memory/MEMBER_LIFECYCLE_PATH.md` | Prospect > Member > Churned > Reactivation flow. Good reference for designing RedactUs user lifecycle. |

---

## TIER 5: NOT Relevant to RedactUs (Stays with AI Doctor Ben)

- `BODY_PROFILE_DESIGN.md` — health-specific
- `VISUAL_HEALTH_SYSTEM.md` — health-specific
- `TIMELINE_ROADMAP.md` — health-specific
- `DR_BEN_PERSONALITY.md` — health-specific
- `CONVERSATION_MEMORY_ARCHITECTURE.md` — chat-specific
- `FAMILY_ACCOUNTS_DESIGN.md` — health-specific
- All fork handoff docs — session-specific

---

## Recommended Paste Order for New Project

When you start the RedactUs Emergent project, paste into your first prompt in this order:

1. **REDACTUS_PRODUCT_CONCEPT.md** (the "what" and "why")
2. **REDACTION_DESIGN.md** (the "how" — technical spec)
3. **CODE_EXCELLENCE_STANDARDS.md** (quality bar)
4. **CODING_PROTOCOLS_ADDENDUM.md** (process standards)
5. Attach `redactionEngine.js` and `PrivacyGuard.js` as code files

Then in follow-up messages as you build specific features:
- Paste **GEO_PRICING_DESIGN.md** when building pricing
- Paste **EMAIL_SEQUENCES_REFERENCE.md** when building email drips
- Paste **PRIVACY_COMPLIANCE_POSITIONING.md** when writing marketing copy
- Paste **PRICING_CHANGE_GUIDE.md** when setting up Stripe

---

## Fit Check: Do These Docs Align with RedactUs Intent?

| RedactUs Goal | Supporting Docs | Alignment |
|---------------|----------------|-----------|
| Free core + paid Preview/Pro | #1 Product Concept, #2 Redaction Design | Tiers defined: Free (Phases 1,2,4), Paid Preview (2.5, 2.6, 3 — custom fields, image tools, preview), Paid Pro (Phase 5 — enterprise) |
| Geo-based SaaS pricing | #5 Geo-Pricing, #6 Pricing Change Guide | Proven pattern, swap products |
| Developer onboarding emails | #8 Email Sequences, #10 Welcome Experience | Structure reusable, copy needs rewriting |
| Privacy-first positioning | #12 Privacy Compliance, #13 GDPR Data Flow | RedactUs IS privacy — this is core messaging |
| Win-back for churned Pro users | #9 Retention Design, #11 Win-Back Process | Directly applicable at scale |
| High engineering quality | #14 Code Excellence, #15 Coding Protocols | Product-agnostic, paste as-is |

---

*This document is a one-time reference for the RedactUs spin-off. It does not need ongoing maintenance.*
