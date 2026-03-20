# RedactUs — Your AI Privacy Guard

**Product Concept Document**
**Version:** 1.2
**Created:** February 20, 2026
**Updated:** March 2026 (added Tier 0 Standalone, Browser Extension, Entity Differentiation v2)
**Author:** AI Doctor Ben Team
**Status:** CONCEPT + TIER 0 SHIPPED

---

## What Is RedactUs?

RedactUs is a client-side privacy layer that strips personal identifiers from text **before** it reaches any AI service. It runs entirely in the user's browser — no data leaves the device until it's clean.

Born inside AI Doctor Ben (a health-tech app), RedactUs solves a universal problem: **people want to use AI, but don't trust it with their identity.**

---

## Tagline

> **"The only privacy redaction tool to run fully in your browser — before info is sent to the servers."**

---

## The Pitch (One-Liner)

> "Your data goes to AI. Your identity doesn't."

---

## How It Works (4 Layers)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                           │
│                                                             │
│  Layer 0: IMAGE MARGIN CROP (Phase 2.5)                     │
│  ├── User crops PII-heavy margins from uploaded images      │
│  ├── Header (name, DOB, NHS no.) and footer (clinic) bands  │
│  ├── Crop geometry tracked anonymously for smart defaults    │
│  └── Only cropped image proceeds to AI — original untouched │
│                                                             │
│  Layer 1: BLOCKED FIELDS (user-defined)                     │
│  ├── Exact-match values the user enters                     │
│  ├── e.g., "John Smith", "SW1A 1AA", "AB 12 34 56 C"      │
│  └── Replaced with [FIELD-REDACTED]                         │
│                                                             │
│  Layer 2: PATTERN DETECTION (regex library)                 │
│  ├── NHS Numbers, SSN, IBAN, postcodes, phone, email, DOB   │
│  ├── Region-aware (UK/US/EU) — additive, not exclusive      │
│  ├── Context-sensitive (ZIP only near address words, etc.)   │
│  └── Replaced with [NHS-REDACTED], [SSN-REDACTED] etc.      │
│                                                             │
│  Layer 3: NAME & ORG DETECTION (prefix matching)            │
│  ├── "Dr Smith" → "Dr [NAME-REDACTED]"                      │
│  ├── "Patient: Jane Doe" → "Patient: [NAME-REDACTED]"       │
│  └── Clinician names, hospital names, clinic references      │
│                                                             │
│  ══════════════════════════════════════════════════════════  │
│  ONLY the cleaned text + cropped image crosses this line →  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   AI Service (LLM)  │
              │   Sees: clean data  │
              │   Never sees: PII   │
              └─────────────────────┘
```

---

## Plugin Architecture Assessment

**Yes — RedactUs is architecturally separable.** Here's the current modularity:

### Current File Boundaries (in AI Doctor Ben)

| File | Role | Dependency on host app |
|------|------|----------------------|
| `redactionEngine.js` (310 lines) | Core engine — all regex, matching, redaction logic | **ZERO** — reads from `localStorage`, pure functions |
| `PrivacyGuard.js` (358 lines) | Settings UI — blocked fields, pattern toggles, region selector | **LOW** — uses Shadcn Switch component + localStorage |
| `ImageCropRedaction` (Phase 2.5 — to build) | Crop overlay UI + geometry tracking | **LOW** — canvas/CSS crop tool + POST to `/api/crop-learning` |
| `RectangleRedaction` (Phase 2.6 — to build) | Mid-image rectangle redaction + heatmap learning | **LOW** — Canvas overlay, extends 2.5 geometry tracking |
| `apiService.js` (5 lines changed) | Integration point — calls `redactText()` before API calls | **This is the "wire"** — 1 import + 5 call sites |

### What Makes It Plugin-Like

1. **Zero server dependency** — Everything runs in browser. No backend needed.
2. **localStorage only** — Settings stored on device. No database required.
3. **Single integration point** — Host app just calls `redactText(inputString)` and gets back `{ redactedText, stats }`.
4. **No framework lock-in** — The engine (`redactionEngine.js`) is pure JavaScript. The UI (`PrivacyGuard.js`) is React, but could be rebuilt for any framework.
5. **Region-aware but region-agnostic** — UK/US/EU patterns are additive modules. New regions = new pattern objects.

### What Would Need Extraction

| Component | Effort | Notes |
|-----------|--------|-------|
| `redactionEngine.js` | **Copy-paste ready** | Zero changes needed. Pure JS, no imports. |
| `PrivacyGuard.js` | **Light refactor** | Remove AI Doctor Ben branding, make Shadcn optional |
| Pattern libraries | **Already modular** | `UK_PATTERNS`, `US_PATTERNS`, `EU_PATTERNS` are separate objects |
| Integration guide | **Write new** | "How to wire RedactUs into your app" (5-minute setup) |

---

## The RedactUs Product Vision

### Target Users

| User | Pain Point | How RedactUs Helps |
|------|-----------|-------------------|
| **Health-tech apps** | Sending patient data to AI | Strip PII before LLM calls |
| **Legal-tech apps** | Client names in legal docs | Redact before AI summarisation |
| **HR/recruitment tools** | CVs with personal details | Anonymise before AI screening |
| **Education platforms** | Student data in AI tutoring | Remove identifiers before queries |
| **Any app using LLMs** | GDPR/HIPAA compliance anxiety | Client-side proof of redaction |

### Product Tiers

| Tier | What's Included | Model |
|------|----------------|-------|
| **Tier 0: RedactUs Standalone** (free) | Self-contained HTML file. Paste text, click Redact, copy cleaned output. Works offline, zero network requests, zero dependencies. Downloadable from GitHub. | Free / MIT licence |
| **RedactUs Core** (open-source) | Engine + default UK/US/EU patterns, runs silently. ON/OFF toggle, region selector. Shows redaction count ("3 items redacted") but NOT what was redacted. | Free / MIT licence |
| **RedactUs Browser Extension** (paid) | Chrome/Firefox extension. Inline redaction on third-party AI sites (Perplexity, ChatGPT, Claude, Gemini). Eliminates copy-paste workflow — extension intercepts text before submission and runs `redactText()` in place. Badge shows "3 items redacted". | Paid (one-time or subscription) |
| **RedactUs Preview** (paid — Phase 3) | Everything in Core PLUS: Dual-path preview ("What you typed / What AI sees"), custom blocked fields editor, pattern list editor (toggle individual patterns on/off), image margin crop (Phase 2.5), rectangle redaction (Phase 2.6), redaction history/log. | Paid SaaS or licence |
| **RedactUs Pro** (commercial) | Everything in Preview PLUS: Custom pattern packs, enterprise regions, org-wide policies, central config, audit logs, compliance reports, exportable redaction reports. | Paid SaaS or licence |
| **RedactUs API** (commercial) | Server-side redaction for non-browser environments (legacy systems, data lakes, batch jobs). | Paid API |

**Free/Paid boundary rationale:** Free tier protects everyone automatically — great for adoption. The upgrade hooks:
- *Standalone → Browser Extension:* "Tired of copy-paste? Install the extension and redact directly on Perplexity/ChatGPT."
- *Core → Preview:* "We redacted 3 items from your message. Want to see what they were and add your own?"
- Custom fields, image tools, the visual preview, and the browser extension are the paid conversion triggers.

**AI Doctor Ben members:** All paid features are bundled into the AI Doctor Ben subscription. This tier split only affects the standalone RedactUs product.

### Integration (Developer Experience)

```javascript
// 1. Install
npm install redactus

// 2. Configure (optional — works out of the box)
import { configure } from 'redactus';
configure({ region: 'US', customFields: ['John Smith', '123-45-6789'] });

// 3. Use — one function call
import { redact } from 'redactus';

const clean = redact("Patient John Smith, NHS 123 456 7890, lives at SW1A 1AA");
// → "Patient [NAME-REDACTED], [NHS-REDACTED], lives at [POSTCODE-REDACTED]"

// 4. Get stats
console.log(clean.stats);
// → { totalRedacted: 3, patterns: ['NHS Number', 'Postcode'], fields: ['John Smith'] }
```

### React UI (optional)

```jsx
import { RedactUsGuard } from 'redactus/react';

// Drop into any settings/profile page
<RedactUsGuard
  defaultRegion="US"
  onSettingsChange={(settings) => localStorage.setItem('redactus', JSON.stringify(settings))}
/>
```

---

## Existing Design Document

The full technical specification lives at:

> **`/app/memory/REDACTION_DESIGN.md`**

This covers:
- Phase 1-6 architecture (Phases 1, 2, 4 are LIVE in AI Doctor Ben)
- **Phase 2.5 — Image Margin Crop** (spec ready — manual crop with anonymised geometry learning for smart defaults)
- **Phase 2.6 — Rectangle Redaction** (spec ready — mid-image PII boxes with heatmap learning for auto-suggestions)
- UK Pattern Library with regex definitions
- US/EU Pattern Libraries (added Session 17)
- Context-aware redaction rules (DOB, ZIP codes, health cards)
- Name/org detection via prefix matching
- Dual-Path Preview design (Phase 3 — ready to build)
- Self-Audit feedback loop design
- Open-source packaging plan (Phase 6)
- Perplexity AI review notes

---

## Competitive Landscape

| Product | Approach | RedactUs Advantage |
|---------|----------|-------------------|
| Microsoft Presidio | Server-side Python NLP | RedactUs is client-side — data never leaves browser |
| AWS Comprehend PII | Cloud API | Requires sending data to AWS first (defeats purpose) |
| Google DLP | Cloud API | Same — data leaves device |
| Private AI | API service | Server-side, paid per call |
| **RedactUs** | **Client-side JS** | **Zero network dependency. Open-source core. Works offline.** |

**RedactUs's moat:** It's the only solution that runs entirely in the user's browser. Every competitor requires sending data to a server first — which is the very thing privacy-conscious users want to avoid.

---

## Revenue Model Options

| Model | Description | Fit |
|-------|-------------|-----|
| **Open-core** | Core free, Pro features paid (enterprise patterns, audit logs, compliance dashboards) | Best for developer adoption |
| **Hosted dashboard** | SaaS for non-technical teams to configure redaction rules | Good for enterprise |
| **Licence + support** | Annual licence for regulated industries (health, legal, finance) | High-margin, low-volume |
| **Integration bounty** | Partner with LLM providers (OpenAI, Anthropic) as recommended privacy layer | Strategic positioning |

---

## Perplexity AI Monetisation Review (Feb 21, 2026)

### Assessment

The core strategy is confirmed: **free code, paid convenience and assurance.** The open-core model holds. The unique moat — "runs fully in the browser, before any data hits a server" — is validated against all competitors (Presidio, AWS, GCP, Private AI are all server/cloud).

### Updated Monetisation Focus (Mapped to Tiers)

**RedactUs Core** (open-source, free)
- Engine + default UK/US/EU patterns, ON/OFF toggle, region selector
- Shows redaction count ("3 items redacted") — but NOT what was redacted
- No custom fields, no image tools, no visual preview
- Goal: maximum adoption, zero friction. The silent protector.

**RedactUs Preview** (paid SaaS feature — Phase 3)
- The upgrade trigger: *"3 items redacted. See what? Add your own?"*
- Includes:
  - Dual-path "What you typed / What the AI sees" visual
  - Custom blocked fields editor (add your own names, identifiers)
  - Pattern list editor (toggle individual regex patterns on/off)
  - Image Margin Crop (Phase 2.5) — drag to remove PII-heavy margins
  - Rectangle Redaction (Phase 2.6) — draw boxes over mid-page PII
  - Redaction log/history
- Monetise as:
  - Included in Pro plans for apps using the hosted bundle
  - Or small per-seat SaaS (e.g. £9–£19/month) for teams who want visual assurance without full enterprise features

**RedactUs Pro** (main revenue stream)
- For health-tech, legal, HR, education platforms
- Adds:
  - Custom pattern packs and extra regions
  - Organisation-wide policies and central config
  - Audit logs, basic compliance/exportable "redaction reports"
- Model: simple monthly SaaS per app/workspace (e.g. £49–£199/month depending on volume), not per-API-call at first

**RedactUs API** (secondary revenue)
- Server-side redaction for back-office batch jobs and non-browser environments (legacy systems, data lakes)
- Model: usage-based (per 1,000 documents or tokens), so heavy batch users fund themselves
- This should follow, not lead — build once browser traction is real

**Services: "Redaction Setup & Review"**
- Fixed-scope packages for:
  - Wiring RedactUs into an app
  - Reviewing prompts and flows for privacy (bringing in EveR Local Layer thinking)
- Great for schools, small clinics, small SaaS teams — low LLM cost, high trust

### Recommended Launch Sequence

**Phase 0 — Open-source + docs**
- Ship Core + UI on GitHub, npm package, "5-minute integration" guide

**Phase 1 — RedactUs Pro (hosted JS + Preview)**
- Offer: hosted script/bundle, config dashboard, Dual-path Preview and basic logs
- Pricing: one Pro plan to start (e.g. £49/month per app) to avoid pricing bloat

**Phase 2 — Governance / Enterprise**
- Add policy templates, multi-project admin, exportable reports, SSO
- "Contact us" pricing for regulators, trusts, large ed/health groups

**Phase 3 — RedactUs API**
- Only when someone asks for batch/server redaction

### Summary

> RedactUs makes money by hosting and governing the open-source browser redaction engine (with Preview and policies) for teams that need assurance, while keeping the core freely available for anyone to adopt.

---

## Immediate Next Steps

1. **Standalone v1.2 SHIPPED** — download from GitHub, ready for distribution
2. **GitHub repo + npm package (Phase 6)** — extract into public repo, publish on npm
3. **v2 Engine (Entity Differentiation)** — `[PATIENT-NAME]` vs `[CLINICIAN-NAME]` tokens
4. **Browser Extension (Chrome first)** — inline redaction on AI sites. The paid conversion trigger.
5. **Phase 3 (Dual-Path Preview)** in AI Doctor Ben = the "demo feature" for RedactUs marketing
6. **Landing page** for redactus.io (or similar domain)

---

## Key Files Reference (Current Codebase)

| File | Lines | Role |
|------|-------|------|
| `/app/redactus-standalone/index.html` | ~785 | Standalone tool (embedded engine v1.2) |
| `/app/redactus-standalone/redactus-engine.js` | ~260 | JS module (importable engine v1.2) |
| `/app/redactus-standalone/ROADMAP.md` | ~200 | Full phase roadmap |
| `/app/redactus-standalone/README.md` | ~190 | Developer quickstart + free vs paid plan |
| `/app/redactus-standalone/SECURITY.md` | ~120 | Honest limitations and threat model |
| `/app/redactus-standalone/USER_GUIDE.md` | ~170 | End-user guide |
| `/app/frontend/src/utils/redactionEngine.js` | ~500 | In-app engine (settings-driven) |
| `/app/frontend/src/components/PrivacyGuard.js` | ~358 | React UI component |
| `/app/memory/REDACTION_DESIGN.md` | ~1150 | Full technical spec (Phases 1-6 + v2) |
| `/app/memory/REDACTUS_PRODUCT_CONCEPT.md` | ~310 | Product strategy and tiers |

---

*This document is for strategic planning. No code changes have been made.*
