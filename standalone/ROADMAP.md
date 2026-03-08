# RedactUs — Phase Roadmap

**Version:** 1.0
**Created:** March 2026
**Status:** Living document — updated as phases ship

---

## Overview

RedactUs is a client-side PII redaction engine. It strips personal identifiers from text before it reaches any AI service. This roadmap covers the full development lifecycle from the free standalone tool through to the commercial browser extension and enterprise features.

---

## Phase Summary

| Phase | Name | Status | Tier |
|-------|------|--------|------|
| 1 | Privacy Guard UI | SHIPPED | Free (in-app) |
| 2 | Client-Side Redaction Engine | SHIPPED (v1.2) | Free |
| 2.5 | Image Margin Crop | SPEC READY | Paid (Preview) |
| 2.6 | Rectangle Redaction | SPEC READY | Paid (Preview) |
| 3 | Dual-Path Preview + Self-Audit | SPEC READY | Paid (Preview) |
| 4 | Prompt Guard | SHIPPED | Free (in-app) |
| 5 | Server-Side Layer 2 | PLANNED | Paid (Pro) |
| 6 | Open-Source Packaging | IN PROGRESS | Free |
| Standalone | Offline HTML Tool | SHIPPED (v1.2) | Free |
| Browser Extension | Chrome/Firefox Extension | PLANNED | Paid |
| v2 Engine | Entity Differentiation | PLANNED | Free |

---

## Phase Details

### Phase 1 — Privacy Guard UI (SHIPPED)

**What:** Toggle, region selector (UK/US/EU), custom blocked fields editor.
**Where:** `/app/frontend/src/components/PrivacyGuard.js`
**Tier:** Free (in-app)

---

### Phase 2 — Client-Side Redaction Engine (SHIPPED v1.2)

**What:** Regex-based PII detection with 20+ pattern types across UK/US/EU regions.
**Where:** Three synced engine files:
- `/app/redactus-standalone/index.html` (embedded)
- `/app/redactus-standalone/redactus-engine.js` (module)
- `/app/frontend/src/utils/redactionEngine.js` (in-app)

**v1.2 capabilities:**
- NHS numbers, NI numbers, UK postcodes, UK/US addresses
- SSN (with unicode dash variants), MRN, phone (UK + US bare format)
- Email, DOB (context-aware), hospital references, insurance/policy IDs
- Auth/claim codes, transaction IDs, card last-4 digits
- Clinician names (multi-word, middle initials, standalone `Dr` pattern)
- Hospital/clinic names, insurer names, guarantor names
- US full address merge (street + city + state + ZIP → single token)
- US city/state/ZIP standalone detection
- Markdown stripping pre-processor
- Unicode dash support (en-dash, non-breaking hyphen)
- Cross-line name capture prevention (`[^\S\n]+`)
- Pattern priority ordering (US patterns first in US mode; insurer before clinician)

**Tier:** Free / MIT

---

### Standalone Tool (SHIPPED v1.2)

**What:** Self-contained HTML file that works offline. Zero dependencies, zero network requests. Paste text, click Redact, copy cleaned output.
**Where:** `/app/redactus-standalone/`
**Package contents:**
- `index.html` — the standalone tool (open in any browser)
- `redactus-engine.js` — the engine as an importable JS module
- `README.md` — developer quickstart + token reference
- `SECURITY.md` — honest limitations and threat model
- `USER_GUIDE.md` — end-user guide for non-technical users

**Distribution:** Download from GitHub, save to desktop. Works offline forever.
**Tier:** Free / MIT

---

### Phase 2.5 — Image Margin Crop (SPEC READY)

**What:** Manual crop tool for uploaded images. Strips PII-heavy header/footer margins before image is sent to AI vision models.
**Why:** 80% of PII on lab reports is in predictable bands (top header: name, DOB, NHS no; bottom footer: clinic, ref no). A simple crop removes the majority of image PII.
**UX:** Draggable top/bottom handles, greyed-out cropped zones, percentage indicators.
**Learning:** Anonymised crop geometry tracked per document type → smart defaults after ~100 samples.
**Spec:** `/app/memory/REDACTION_DESIGN.md` (Section 2.5)
**Tier:** Paid (Preview)

---

### Phase 2.6 — Rectangle Redaction (SPEC READY)

**What:** After margin cropping, users draw black rectangles over any mid-page PII remaining in the image.
**Why:** Catches the ~20% of PII that isn't in header/footer bands — patient names in table rows, clinician signatures mid-page, etc.
**UX:** HTML5 Canvas overlay. Tap-drag to create, resize handles, tap to delete.
**Learning:** Rectangle positions tracked anonymously → heatmap suggestions after enough data.
**Spec:** `/app/memory/REDACTION_DESIGN.md` (Section 2.6)
**Tier:** Paid (Preview)

---

### Phase 3 — Dual-Path Preview + Self-Audit (SPEC READY)

**What:** Visual "What stays on device" vs "What AI sees" split-screen preview. Shows blocked items (struck-through red) and clean data (green checkmark) side by side.
**Why:** Builds user trust through transparency. The "show, don't tell" moment for privacy.
**Also includes:** Optional self-audit feedback mechanism (user reports missed PII — anonymised pattern-level only).
**Spec:** `/app/memory/REDACTION_DESIGN.md` (Section 3)
**Tier:** Paid (Preview)

---

### Phase 4 — Prompt Guard (SHIPPED)

**What:** System prompt injection in all LLM API calls. Instructs the AI model to ignore any PII that slips through redaction.
**Where:** Backend system prompts in `server.py`
**Defence-in-depth:** Works as a safety net behind the client-side engine.
**Tier:** Free (in-app)

---

### v2 Engine — Entity Differentiation (PLANNED)

**What:** Replace generic `[NAME-REDACTED]` with specific tokens:
- `[PATIENT-NAME]` — the patient's own name
- `[KIN-NAME]` — next of kin, emergency contact
- `[CLINICIAN-NAME]` — doctors, nurses, consultants
- `[GUARANTOR-NAME]` — financial guarantor
- `[INSURER-NAME]` — insurance provider/company

**Why:** Downstream AI processing benefits from knowing the *type* of entity that was redacted, not just that something was redacted. Example: "Referred by [CLINICIAN-NAME] at [HOSPITAL-NAME]" gives the AI much better context than "Referred by [NAME-REDACTED] at [NAME-REDACTED]".

**Also planned for v2:**
- Expanded pattern coverage per Perplexity feedback
- Configurable token format (e.g., `[REDACTED:PATIENT_NAME]` for structured extraction)
- Pattern confidence scoring (high/medium/low) for transparency

**Tier:** Free (engine upgrade — MIT)

---

### Browser Extension — Chrome/Firefox (PLANNED)

**What:** A browser extension that performs redaction directly within third-party websites (Perplexity, ChatGPT, Claude, etc.), eliminating the copy-paste workflow.

**Why this is the paid upgrade path:**

| Free (Standalone Tool) | Paid (Browser Extension) |
|------------------------|-------------------------|
| Copy text → Open RedactUs → Paste → Redact → Copy → Paste into AI | Type directly into AI site — extension redacts inline before submission |
| Works offline, zero setup | One-time install from Chrome Web Store / Firefox Add-ons |
| Manual workflow | Seamless, invisible |

**How it works:**
1. User installs extension from store
2. Extension detects text input fields on supported AI sites
3. Before form submission, extension intercepts text and runs `redactText()` on it
4. Redacted text replaces the original in the input field
5. User sees a small badge: "3 items redacted" with option to review

**Key design decisions:**
- Extension uses the same `redactus-engine.js` — no separate codebase
- Settings synced via browser storage (not a server)
- Whitelist model: only activates on known AI tool domains (perplexity.ai, chat.openai.com, claude.ai, gemini.google.com)
- "Review before send" optional — power users can enable auto-redact

**Tier:** Paid (one-time or subscription TBD)

---

### Phase 5 — Server-Side Layer 2 (PLANNED)

**What:** Proprietary server-side redaction pass that runs after client-side (Phase 2) and before the LLM API call. Additional NLP-based detection for names in narrative text that regex can't catch.
**Why:** Defence-in-depth. Client-side engine catches structured PII; server-side catches semantic PII.
**Tier:** Paid (Pro / AI Doctor Ben subscription)

---

### Phase 6 — Open-Source Packaging (IN PROGRESS)

**What:** Publish RedactUs Core as:
- npm package (`npm install redactus`)
- GitHub repository with MIT licence
- "5-minute integration" developer guide
- GitHub Pages demo

**Currently available:**
- Standalone tool downloadable from the main repo
- JS module importable via `<script type="module">`

**Remaining:**
- npm registry publication
- GitHub Releases with versioned downloads
- Landing page (redactus.io or similar domain)

**Tier:** Free / MIT

---

## Tier Summary

| Tier | What's Included | Price |
|------|----------------|-------|
| **RedactUs Core** | Engine + default patterns + standalone HTML tool + JS module | Free / MIT |
| **RedactUs Preview** | Core + custom blocked fields + dual-path preview + image redaction (crop + rectangles) + redaction log | Paid (SaaS or licence) |
| **RedactUs Pro** | Preview + enterprise patterns + org-wide policies + audit logs + compliance reports + server-side Layer 2 | Paid (SaaS) |
| **Browser Extension** | Core engine in Chrome/Firefox — inline redaction on third-party AI sites | Paid (one-time or subscription) |
| **RedactUs API** | Server-side redaction for non-browser environments (batch jobs, data lakes, legacy systems) | Paid (usage-based) |

**AI Doctor Ben members:** All paid features bundled into the subscription. Tier split only affects standalone RedactUs distribution.

---

## Release Sequence

| Step | What Ships | When |
|------|-----------|------|
| 1 | Standalone tool v1.2 (downloadable HTML) | NOW |
| 2 | GitHub repo + npm package (Phase 6) | Next |
| 3 | v2 Engine (entity differentiation) | After Phase 6 |
| 4 | Browser Extension (Chrome first, then Firefox) | After v2 |
| 5 | Phase 2.5 + 2.6 (image redaction) in AI Doctor Ben | Parallel track |
| 6 | Phase 3 (dual-path preview) in AI Doctor Ben | After 2.5/2.6 |
| 7 | Phase 5 (server-side) for Pro tier | After Phase 3 |

---

*This document is the single source of truth for the RedactUs development roadmap. Update when phases ship or priorities change.*
