# Redaction Layer Design — "Privacy Guard"

**Version:** 2.3
**Created:** February 14, 2026
**Last Updated:** March 2026 (v1.2: Engine sync, Perplexity refinements, US pattern priority, cross-line fix, entity differentiation spec)
**Status:** PHASES 1, 2, 4 IMPLEMENTED — Standalone v1.2 SHIPPED — Phase 3 spec finalised — v2 Entity Differentiation PLANNED
**Priority:** P0
**Author:** AI Doctor Ben Development Team

---

## Problem Statement

AI Doctor Ben processes health data through external LLMs (Gemini, Claude). While health records are stored on-device only, the text extracted from lab results — which may contain personal identifiers (names, NHS numbers, addresses, DOBs) — is sent to LLM APIs for analysis.

Users must trust that their personal identity is separated from their health data before it leaves their device. For open-source credibility, this process must be **inspectable, auditable, and verifiable by the user in real time**.

---

## Design Principles

1. **Protect silently by default** — Redaction is ON. Users don't need to think about it.
2. **Transparency on demand** — Users who WANT to see can inspect exactly what's being sent.
3. **User control** — Users define what's sensitive to them (not just what we think is sensitive).
4. **Fun, not frightening** — Privacy should feel empowering, not scary. Gamify the trust moment.
5. **Open-sourceable** — The client-side redaction logic is publishable. No secrets in the algorithm.
6. **Honest about limitations** — We document what we catch and what we don't. Trust comes from honesty.

---

## Open-Source / Proprietary Boundary

> **Everything that touches your data before the network is open. Everything after the network boundary is our private risk-management layer.**

| Layer | Where it runs | Visibility | Published? |
|-------|--------------|------------|------------|
| Phase 1: Privacy Guard UI | Browser | Open-source | Yes |
| Phase 2: Client Redaction Engine | Browser | Open-source | Yes |
| Phase 3: Dual-Path Preview + Self-Audit | Browser | Open-source | Yes (optional components) |
| Phase 4: Prompt Guard | System prompt (server) | Public text | Yes (published in docs) |
| Phase 5: Server-Side Layer 2 + Admin Controls | Server | Proprietary | No |
| Phase 6: Open-Source Packaging & Docs | N/A | Public | Yes |

---

## Architecture Overview

```
                      USER'S DEVICE (Browser)                         SERVER
               ┌───────────────────────────────────┐          ┌──────────────────┐
               │                                   │          │                  │
  Raw text ──> │  Phase 2   Client-Side Redaction   │          │  Phase 5         │
               │  (open-source JS engine)           │          │  Server-side     │
               │             |                      │          │  redaction       │
               │  Phase 4   Prompt Guard            │          │  (proprietary)   │
               │  (system prompt prefix)            │  ─────>  │  + admin toggle  │
               │             |                      │          │                  │ ──> LLM
               │  Phase 3   Dual-Path Preview       │          │                  │
               │  + Self-Audit feedback             │          │                  │
               │  (user inspects before sending)    │          │                  │
               │                                   │          │                  │
               └───────────────────────────────────┘          └──────────────────┘
                        OPEN-SOURCE                              PROPRIETARY
```

---

## Phase 1 — Privacy Guard UI (DONE)

**Status:** COMPLETE (February 18, 2026)
**Component:** `/app/frontend/src/components/PrivacyGuard.js`
**Location:** Profile page accordion (between Personalization and Security)

**Delivers:**
- Master toggle (ON by default) — "Active — stripping PII before AI" / "Disabled — data sent as-is"
- 5 default blocked fields: NHS Number, Insurance ID, Date of Birth, Full Address, Full Name
- Add/remove custom blocked fields with persist-on-blur
- 6 pattern detection toggles (NHS, NI, Postcodes, Phone, Email, DOB) — collapsible section
- Redaction counter display (items redacted / queries processed)
- All settings stored in localStorage (`privacy_guard_settings`) — never leaves device

**Note:** Phase 1 is UI only. No redaction happens yet — that's Phase 2.

---

## Phase 2 — Client-Side Redaction Engine (Open-Source Core)

**Status:** COMPLETE (February 18, 2026)
**Component:** `/app/frontend/src/utils/redactionEngine.js`
**Wired into:** `/app/frontend/src/services/apiService.js` (queryHealth, analyzeDocument, analyzeGuestDocument)
**What:** JavaScript redaction engine running entirely in the browser, BEFORE any data is sent to the server or LLMs.
**This is the code that will later be published as the "Privacy Guard" open-source library.**

### 2.1 Redaction Sources (Priority Order)

**1. User Custom Fields — exact string match (case-insensitive)**
- Values from Profile Privacy Guard (name variants, addresses, NHS number, etc.)
- Always masked as `[PRIVATE-REDACTED]`
- 100% accuracy — if user enters their NHS number, it's caught every time

**2. UK Pattern Library (regex) — high accuracy**

| Pattern | Regex | Token |
|---------|-------|-------|
| NHS Number | `\d{3}\s?\d{3}\s?\d{4}` | `[NHS-REDACTED]` |
| National Insurance | `[A-Z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]` | `[NI-REDACTED]` |
| UK Postcode | `[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}` | `[POSTCODE-REDACTED]` |
| UK Address | `\d{1,4}\s+[Word]+\s+(Street|Lane|Road|Ave|...)` | `[ADDRESS-REDACTED]` |
| Flat/Apartment | `(Flat|Apartment|Apt|Unit|Suite)\s+\w+...` | `[ADDRESS-REDACTED]` |

**3. Always-Active Patterns (all regions)**

| Pattern | Regex | Token |
|---------|-------|-------|
| SSN | `\d{3}-\d{2}-\d{4}` (handles en-dash/non-breaking hyphen) | `[SSN-REDACTED]` |
| Phone (UK/US/Intl) | `(\+44|\+1|0)...(xxx)...` with parentheses support | `[PHONE-REDACTED]` |
| Email | RFC-style email regex | `[EMAIL-REDACTED]` |
| Date of Birth | `\d{1,2}[/-.]\d{1,2}[/-.]\d{2,4}` (context-aware) | `[DOB-REDACTED]` |
| MRN | `\d{5,10}` near "MRN"/"medical record" context | `[MRN-REDACTED]` |
| Hospital Reference | `[A-Z]{1,4}-\d{4}-\d{2,6}` near hospital context | `[REF-REDACTED]` |
| Insurance/Policy ID | `[A-Z]{1,6}-\d{2,10}` near insurance context | `[INSURANCE-REDACTED]` |
| Auth/Claim Code | `[A-Z\d]{2,5}-[digits/codes]` near auth/claim context | `[CLAIM-REDACTED]` |
| Transaction ID | `(TXN|REF|INV)-[digits]` | `[TRANSACTION-REDACTED]` |
| Card Digits | `\d{4}` near "card"/"last 4" context | `[CARD-REDACTED]` |

**DOB context rule:** Dates are treated as PII only when in personal-data contexts (e.g. same line as "DOB", "Date of birth", "Patient"). Test dates used purely as clinical timeline markers pass through.

**4. Clinician / Organisation / Insurer Names — curated prefix patterns**

Clinician and organisation names are public entities, but in combination with test data they raise re-identification risk. "Dr Patel at St Thomas' on 09/02/2026 + cholesterol 5.8" can identify a patient.

**Implementation: curated structured-context prefixes, NOT naive keyword search.**

| Context type | Pattern examples | Token |
|-------------|-----------------|-------|
| Clinician prefix | `Seen by Dr`, `Consultant:`, `GP:`, `GP name:`, `Attending physician:`, `Ordering physician:` | `[CLINICIAN-REDACTED]` |
| Hospital prefix | `at [Hospital Name]`, `Hospital:`, `Clinic:`, `GP practice:`, `Medical Center/Centre` | `[HOSPITAL-REDACTED]` |
| Insurer prefix | `Insurance provider:`, `Insurer:` | `[INSURER-REDACTED]` |
| Co-occurring dates | Date on same line as postcode/clinic/ID pattern | `[DATE-REDACTED]` |

**The goal:** Only redact when the token clearly behaves as a name/organisation label, not when it appears inside ordinary medical language ("drug", "drainage", "clinic review"). This is a curated list of prefixes/labels plus simple context rules. The list is refined over time using the Phase 3 self-audit feedback loop.

**4. Common Name Detection — best-effort only (heuristic)**
- Patterns: `Patient: [Name]`, `Name: [Name]`, `Dear [Name]`
- **Explicitly documented as heuristic.** This layer is NOT relied on for compliance — it's an extra safety net.
- Catches structured name fields, not names embedded in narrative

### 2.2 Replacement Tokens (Complete Table)

| Detected Type | Token | Example |
|--------------|-------|---------|
| NHS Number | `[NHS-REDACTED]` | 943 476 5919 → `[NHS-REDACTED]` |
| NI Number | `[NI-REDACTED]` | QQ 12 34 56 C → `[NI-REDACTED]` |
| Postcode | `[POSTCODE-REDACTED]` | SW1A 1AA → `[POSTCODE-REDACTED]` |
| Phone | `[PHONE-REDACTED]` | 07700 900000 → `[PHONE-REDACTED]` |
| Email | `[EMAIL-REDACTED]` | name@domain.com → `[EMAIL-REDACTED]` |
| DOB | `[DOB-REDACTED]` | 15/03/1985 → `[DOB-REDACTED]` |
| Address | `[ADDRESS-REDACTED]` | 12 Oak Lane → `[ADDRESS-REDACTED]` |
| Custom Field | `[PRIVATE-REDACTED]` | User-defined value → `[PRIVATE-REDACTED]` |
| Patient Name | `[NAME-REDACTED]` | Patient: John Smith → `Patient: [NAME-REDACTED]` |
| Clinician | `[CLINICIAN-REDACTED]` | Seen by Dr Patel → `Seen by [CLINICIAN-REDACTED]` |
| Hospital/Clinic | `[HOSPITAL-REDACTED]` | St Thomas' Hospital → `[HOSPITAL-REDACTED]` |
| Co-occurring Date | `[DATE-REDACTED]` | 09/02/2026 (near clinic/ID) → `[DATE-REDACTED]` |

### 2.3 What Passes Through (NOT Redacted)

- All health metrics and units (e.g. cholesterol 5.8 mmol/L)
- Lab reference ranges
- Medical terminology and symptom descriptions
- Test dates used purely as clinical timeline markers, **unless** they co-occur with postcode/clinic/ID patterns
- User's natural-language questions to Dr Ben, minus any redacted substrings

### 2.4 Before/After Example

**Input (raw OCR text):**
```
Patient: John Smith, DOB 15/03/1985, NHS no. 943 476 5919,
12 Oak Lane, SW1A 1AA. Seen by Dr Patel at St Thomas' Hospital
on 09/02/2026. Total Cholesterol 5.8 mmol/L, LDL 3.9 mmol/L.
```

**Output (sent to AI):**
```
Patient: [NAME-REDACTED], DOB [DOB-REDACTED], NHS no. [NHS-REDACTED],
[ADDRESS-REDACTED], [POSTCODE-REDACTED]. Seen by [CLINICIAN-REDACTED]
at [HOSPITAL-REDACTED] on [DATE-REDACTED]. Total Cholesterol 5.8 mmol/L,
LDL 3.9 mmol/L.
```

Health metrics pass through. Identity doesn't.

### 2.5 Type Signatures

```ts
// Client-side redaction input
type RedactionInput = {
  rawText: string;
  userFields: {
    nhsNumber?: string;
    niNumber?: string;
    fullName?: string;
    addressLines?: string[];
    custom: string[];
  };
  context: {
    country: 'UK';
    profileId: string;
  };
};

// Client-side redaction output
type RedactionResult = {
  redactedText: string;
  blockedFragments: string[];     // substrings removed or replaced
  tokens: { type: string; count: number }[];
};
```

---

## Phase 2.5 — Image Margin Crop (The Gap Phase 2 Can't Reach)

**Status:** SPEC READY — Priority: BUILD NOW
**What:** A manual crop tool for uploaded images (lab reports, prescriptions) that strips PII-heavy margins before the image is sent to AI vision models.
**Why this exists:** Phase 2 redacts TEXT. But when users upload images (PNG/JPG), the raw image goes to the AI with zero redaction. Most hospital lab reports have PII concentrated in predictable bands — patient name, DOB, NHS number, address in the top header; clinic details in the bottom footer. This phase fills that gap.

### 2.5.1 The Problem

```
┌─────────────────────────────────┐
│  St Thomas' Hospital            │  ← Header: Hospital name, logo
│  Patient: John Smith            │  ← PII: Full name
│  DOB: 15/03/1985  NHS: 943...  │  ← PII: DOB, NHS number
│  12 Oak Lane, SW1A 1AA          │  ← PII: Full address
│─────────────────────────────────│
│                                 │
│  Total Cholesterol: 5.8 mmol/L  │  ← Health data (this is what
│  LDL: 3.9 mmol/L               │     the AI needs)
│  HDL: 1.4 mmol/L               │
│  Triglycerides: 1.7 mmol/L     │
│  Fasting Glucose: 5.2 mmol/L   │
│                                 │
│─────────────────────────────────│
│  Dr Patel, Cardiology Dept      │  ← Footer: Clinician, department
│  Report ID: RPT-2026-0482      │  ← Footer: Reference number
└─────────────────────────────────┘
```

**80/20 rule:** A simple margin crop removes the majority of PII from the majority of lab reports with zero algorithmic complexity.

### 2.5.2 UX — Manual Crop Tool

When a user uploads an image and Privacy Guard is ON:

```
┌─────────────────────────────────────────────────────┐
│  Crop Personal Data                          [Skip] │
│                                                     │
│  Drag the edges to remove personal information      │
│  (name, address, NHS number) from the margins.      │
│                                                     │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐      │
│  ╔═══════════════════════════════════════════╗      │
│  ║░░░░░░░░░ CROPPED (greyed out) ░░░░░░░░░░║      │
│  ║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║      │
│  ╠═══════════ drag handle ══════════════════╣      │
│  ║                                          ║      │
│  ║  [ Visible lab results stay ]            ║      │
│  ║  [ This area is sent to AI  ]            ║      │
│  ║                                          ║      │
│  ╠═══════════ drag handle ══════════════════╣      │
│  ║░░░░░░░░░ CROPPED (greyed out) ░░░░░░░░░░║      │
│  ╚═══════════════════════════════════════════╝      │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘      │
│                                                     │
│  Top: 18% removed  |  Bottom: 10% removed          │
│                                                     │
│       [ Cancel ]           [ Crop & Continue ]      │
└─────────────────────────────────────────────────────┘
```

**Behaviour:**
- Appears after image upload, before analysis
- Greyed-out bands show what will be removed
- Draggable top/bottom handles (left/right optional, usually not needed)
- Percentage indicators show how much is being cropped
- **"Skip" button** — always visible, no judgement. Records `skipped: true` in tracking.
- "Skip" bypasses crop AND rectangle redaction (Phase 2.6) — goes straight to text redaction (Phase 2)
- Cropped image replaces original in the upload pipeline — only the cropped version goes to AI
- Original image is never modified on device (crop is applied to a copy)

### 2.5.3 Crop Learning System (Anonymised Geometry Tracking)

**Purpose:** Track crop patterns to build smart defaults per document type. Eventually automate the crop.

**What we collect (server-side):**

```json
{
  "crop_top_pct": 17.5,
  "crop_bottom_pct": 10.2,
  "crop_left_pct": 0,
  "crop_right_pct": 0,
  "aspect_ratio": 0.71,
  "document_tag": "blood_test",
  "image_width": 2480,
  "image_height": 3508,
  "skipped": false,
  "timestamp": "2026-03-03T14:22:00Z"
}
```

**Privacy assessment:** This is pure geometry — rectangles and percentages. No pixel data, no image content, no thumbnails, no OCR text. It cannot reconstruct anything about the patient or the document content. Stored in `crop_learning` collection.

**What we DON'T collect:**
- No image data or pixel content
- No OCR'd text from the cropped regions
- No patient identifiers
- No file names or metadata from the original image

**Document tagging:** Users select a document type from a simple picker (blood test, hormone panel, X-ray, prescription, other) when uploading. This tag is stored with the crop geometry.

**Type signature:**

```ts
type CropGeometry = {
  crop_top_pct: number;      // 0-100
  crop_bottom_pct: number;   // 0-100
  crop_left_pct: number;     // 0-100
  crop_right_pct: number;    // 0-100
  aspect_ratio: number;      // width / height
  document_tag: string;      // e.g. "blood_test", "hormone_panel", "x_ray"
  image_width: number;       // pixels
  image_height: number;      // pixels
  skipped: boolean;          // true if user hit Skip
  timestamp: string;         // ISO8601
};
```

### 2.5.4 Learning Path (Manual → Smart Defaults → Auto-Crop)

| Stage | Trigger | What Happens |
|-------|---------|-------------|
| **Stage 1: Manual** (now) | Every image upload | User manually drags crop handles. Geometry saved to `crop_learning`. |
| **Stage 2: Smart Defaults** (~100 samples/type) | Enough data per document_tag | Compute median crop zones. Pre-apply as default position. User adjusts if needed. "Based on similar documents, we suggest this crop." |
| **Stage 3: One-Tap Confirm** (~500 samples/type) | High confidence per type | Show pre-cropped preview with single "Looks good" / "Adjust" choice. |
| **Stage 4: Auto-Crop** (future) | Very high confidence + user trust | Auto-crop silently (like Phase 2 text redaction). Show in Dual-Path Preview (Phase 3) what was cropped. |

**Metrics to track:**
- Skip rate per document type (are users engaging?)
- Crop variance (how consistent are crops for the same document type?)
- Median crop zones per type (the "smart defaults")
- Adjustment rate after smart defaults are applied (are defaults good enough?)

### 2.5.5 Integration with Phase 3 (Dual-Path Preview)

When Phase 3 is built, the Dual-Path Preview gains an image section:

```
⛔ STAYS ON DEVICE          ✅ SENT TO AI
─────────────────           ────────────────
~~NHS: 943 476 5919~~       Cholesterol: 5.8
~~Patient: J. Smith~~       LDL: 3.9 mmol/L
~~12 Oak Lane~~             HDL: 1.4 mmol/L
                            
[Cropped image margins]     [Cropped lab result]
 (greyed out preview)        (clean centre area)
```

---

## Phase 2.6 — Rectangle Redaction (Mid-Image PII)

**Status:** SPEC READY — Build alongside Phase 2.5
**What:** After margin cropping (Phase 2.5), users can place, resize, and delete black rectangles directly onto the cropped image to cover any PII that appears mid-page.
**Why:** Phase 2.5 handles PII in predictable header/footer bands (~80%). Phase 2.6 handles the remaining ~20% — patient names in table rows, reference numbers next to results, clinician signatures mid-page.

### 2.6.1 The Problem Phase 2.5 Can't Solve

```
┌─────────────────────────────────────────┐
│ ░░░░░░░░ CROPPED by Phase 2.5 ░░░░░░░░ │  ← Header removed
│─────────────────────────────────────────│
│                                         │
│  Test              Result    Range      │
│  ─────────────     ──────    ─────      │
│  Patient: John Smith        ← PII!      │  ← Mid-page, not in header
│  Ref: RPT-2026-0482        ← PII!      │
│                                         │
│  Cholesterol       5.8      <5.2        │
│  LDL               3.9      <3.0        │
│  HDL               1.4      >1.0        │
│                                         │
│  Requested by: Dr Patel    ← PII!      │  ← Mid-page clinician name
│                                         │
│─────────────────────────────────────────│
│ ░░░░░░░░ CROPPED by Phase 2.5 ░░░░░░░░ │  ← Footer removed
└─────────────────────────────────────────┘
```

### 2.6.2 UX — Rectangle Redaction Tool

Appears as Step 2 after margin cropping. Uses HTML5 Canvas overlay on the cropped image.

```
┌─────────────────────────────────────────────────────────┐
│  Redact Sensitive Areas                    [Done]       │
│                                                         │
│  Tap and drag to cover any personal information         │
│  remaining in the document.                             │
│                                                         │
│  ┌─────────────────────────────────────────────┐        │
│  │                                             │        │
│  │  Test              Result    Range          │        │
│  │  ─────────────     ──────    ─────          │        │
│  │  ██████████████████████████  ← rectangle 1  │        │
│  │  ██████████████████████      ← rectangle 2  │        │
│  │                                             │        │
│  │  Cholesterol       5.8      <5.2            │        │
│  │  LDL               3.9      <3.0            │        │
│  │  HDL               1.4      >1.0            │        │
│  │                                             │        │
│  │  ██████████████████████████  ← rectangle 3  │        │
│  │                                             │        │
│  └─────────────────────────────────────────────┘        │
│                                                         │
│  3 areas redacted  |  Tap a rectangle to delete it      │
│                                                         │
│       [ Back to Crop ]         [ Confirm & Continue ]   │
└─────────────────────────────────────────────────────────┘
```

**Behaviour:**
- User taps/clicks a start point, drags to create a rectangle
- Rectangle renders as a solid black (or themed) overlay
- Rectangles are resizable (corner/edge handles) and deletable (tap to select, delete button)
- Multiple rectangles allowed
- Count indicator: "3 areas redacted"
- **"Skip" button** — always visible. Records `rectangles_skipped: true` in tracking. Proceeds with cropped-only image.
- "Back to Crop" returns to Phase 2.5 margin tool
- "Confirm & Continue" burns rectangles into a copy of the image (Canvas `fillRect`) — only the redacted copy proceeds
- Original image untouched on device
- If no mid-page PII, user simply taps "Done" / "Confirm & Continue" with zero rectangles

**Mobile:** Full-width canvas with pinch-to-zoom. Draw with finger drag. Long-press to delete a rectangle.

### 2.6.3 Rectangle Learning System (Anonymised Geometry)

Same privacy model as Phase 2.5 — pure geometry, no pixel data.

**What we collect (appended to the same `crop_learning` document):**

```json
{
  "crop_top_pct": 17.5,
  "crop_bottom_pct": 10.2,
  "crop_left_pct": 0,
  "crop_right_pct": 0,
  "rectangles": [
    { "x_pct": 5.2, "y_pct": 34.1, "w_pct": 40.3, "h_pct": 3.8 },
    { "x_pct": 5.2, "y_pct": 42.0, "w_pct": 25.1, "h_pct": 3.8 },
    { "x_pct": 5.2, "y_pct": 78.5, "w_pct": 35.0, "h_pct": 3.8 }
  ],
  "rectangle_count": 3,
  "aspect_ratio": 0.71,
  "document_tag": "blood_test",
  "image_width": 2480,
  "image_height": 3508,
  "skipped": false,
  "timestamp": "2026-03-03T15:00:00Z"
}
```

**Type signature (extends Phase 2.5):**

```ts
type RedactionRectangle = {
  x_pct: number;       // left edge, 0-100 of image width
  y_pct: number;       // top edge, 0-100 of image height
  w_pct: number;       // width, 0-100
  h_pct: number;       // height, 0-100
};

type ImageRedactionGeometry = {
  // Phase 2.5 — margin crop
  crop_top_pct: number;
  crop_bottom_pct: number;
  crop_left_pct: number;
  crop_right_pct: number;
  // Phase 2.6 — rectangle redactions
  rectangles: RedactionRectangle[];
  rectangle_count: number;
  rectangles_skipped: boolean;     // true if user skipped rectangle step
  // Shared metadata
  aspect_ratio: number;
  document_tag: string;
  image_width: number;
  image_height: number;
  skipped: boolean;                // true if user skipped ALL image redaction (crop + rectangles)
  timestamp: string;
};
```

### 2.6.4 Learning Path (extends Phase 2.5 stages)

| Stage | Trigger | What Happens |
|-------|---------|-------------|
| **Stage 1: Manual** (now) | Every image upload | User crops margins (2.5) then places rectangles (2.6). All geometry saved. |
| **Stage 2: Smart Defaults** (~100 samples/type) | Enough data per document_tag | Pre-apply median crop + generate **heatmap zones** where rectangles cluster. Suggest: "Other users typically redact this area — would you like to?" |
| **Stage 3: One-Tap Confirm** (~500 samples/type) | High confidence | Show pre-cropped + pre-rectangled preview. User confirms or adjusts. |
| **Stage 4: Auto-Redact** (future) | Very high confidence | Auto-crop + auto-rectangle silently. Show results in Dual-Path Preview (Phase 3). |

**Heatmap aggregation (server-side):**
- For each document_tag, overlay all rectangle positions from all users
- Identify clusters where >60% of users place rectangles (e.g. "row 2 of blood tests, left 40%")
- These clusters become the "smart rectangle suggestions" in Stage 2

### 2.6.5 Combined UX Flow (Phase 2.5 + 2.6)

```
User uploads image
       │
       ▼
┌──────────────────┐
│ Phase 2.5        │
│ MARGIN CROP      │  ← Drag top/bottom to remove header/footer
│ (predictable PII)│
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Phase 2.6        │
│ RECTANGLE REDACT │  ← Draw boxes over any remaining mid-page PII
│ (scattered PII)  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Phase 3          │
│ DUAL-PATH        │  ← "Stays on device" vs "Sent to AI"
│ PREVIEW          │     (includes cropped margins + blacked rectangles)
└──────┬───────────┘
       │
       ▼
  Image sent to AI
  (margins removed, rectangles burned in)
```

---


## Phase 3 — Dual-Path Preview + Self-Audit (Open-Source)

**Status:** SPEC FINALISED
**What:** UX to show "Stays on Device" vs "Sent to AI" + optional privacy-safe feedback mechanism.
**Both components live in the same open-source repo as optional modules.**

### 3.1 Dual-Path Preview — Visual Concept

When the user has Privacy Guard ON, they can optionally tap a shield icon before sending their query to see exactly what happens to their data.

```
┌─────────────────────────────────────────────────────────────────┐
│  Where does your data go?                              [Close]  │
│                                                                 │
│  Your text was scanned. Here's what happens:                    │
│                                                                 │
│  ┌──────────────────────┐     ┌──────────────────────────────┐  │
│  │                      │     │                              │  │
│  │   STAYS ON DEVICE    │     │   SENT TO AI                 │  │
│  │                      │     │                              │  │
│  │  ~~943 476 5919~~    │     │  Total Cholesterol: 5.8      │  │
│  │  ~~QQ 12 34 56 C~~   │     │  LDL: 3.9 mmol/L            │  │
│  │  ~~15/03/1985~~      │     │  HDL: 1.4 mmol/L            │  │
│  │  ~~SW1A 1AA~~        │     │  Triglycerides: 1.7          │  │
│  │  ~~John Smith~~      │     │  Glucose: 5.2 mmol/L         │  │
│  │  ~~Dr Patel~~        │     │  HbA1c: 5.4%                 │  │
│  │  ~~St Thomas'~~      │     │  Vitamin D: 42 ng/mL         │  │
│  │                      │     │                              │  │
│  │  7 items redacted    │     │  "What do these results      │  │
│  │                      │     │   mean for my health?"       │  │
│  │       ⛔              │     │                              │  │
│  │  BLOCKED             │     │         |                    │  │
│  │  Dead end.           │     │    ✅ Clean & Safe            │  │
│  │  Never leaves        │     │    Ready for AI analysis     │  │
│  │  your device.        │     │                              │  │
│  └──────────────────────┘     └──────────────────────────────┘  │
│                                                                 │
│           [ Send to AI ]              [ Cancel ]                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Left Path — "Stays on Device" (The Dead End)**
- Background: subtle red/dark tint
- Redacted items shown as ~~struck-through red text~~
- Each item labelled with its type: `NHS Number`, `Postcode`, `DOB`, `Clinician`, etc.
- Count badge: "7 items redacted"
- Terminates with ⛔ No Entry road sign
- Below: "**Dead end.** Never leaves your device."

**Right Path — "Sent to AI" (The Clean Road)**
- Background: subtle green/clean tint
- Shows the actual cleaned content that will be sent
- Health metrics displayed clearly
- User's question shown at the bottom
- Terminates with ✅ Clean & Safe badge
- Below: "Ready for AI analysis"

**Interaction:**
- User reviews both paths
- Taps **"Send to AI"** to confirm, or **"Cancel"** to go back
- Preview is optional — power users verify, most users never open it

**Mobile:** Paths stack vertically — blocked items on top, clean data below.

### 3.2 Self-Audit / Human-in-the-Loop Learning

Sits on top of the Dual-Path Preview. Lets us continuously improve regex rules without collecting raw PHI.

**UX Behaviour:**
1. In the Dual-Path Preview, user sees "Stays on device" vs "Sent to AI" columns
2. If the user **edits** the "Sent to AI" side (e.g. manually masking something the engine missed), show a small optional checkbox:
   > "Help improve redaction (we'll anonymously learn from this change, never your full record)."
3. **Default: checkbox OFF.** Only when they tick it will feedback be sent. No silent data collection.

**Client-Side Diff Algorithm (in browser):**
1. If `!consentToShare` → send nothing
2. If consented:
   - Compute span-level diffs between `autoRedacted` and `userRedacted`
   - For each new masked span (e.g. user changed "AB1 2CD" to `[POSTCODE-REDACTED]`):
     - Classify the underlying token using existing regex library
     - **Do NOT send the literal value.** Send only:

```json
{
  "inferredType": "POSTCODE",
  "country": "UK",
  "patternHash": "sha256(\"[A-Z]{1,2}\\d[A-Z\\d]?\\s?\\d[A-Z]{2}\")",
  "timestamp": "2026-02-18T21:15:00Z"
}
```

**Type Signature:**
```ts
// Self-audit feedback (only if user opts in)
type FeedbackItem = {
  inferredType: string;      // e.g. 'POSTCODE', 'EMAIL'
  country: string;           // 'UK'
  patternHash: string;       // hash of regex/pattern, not raw text
  timestamp: string;         // ISO8601
};
```

**Server-Side Storage:**
- Collection: `redaction_feedback`
- Fields: `inferredType`, `patternHash`, `country`, `count`, `firstSeen`, `lastSeen`
- Nightly job: aggregate by `inferredType` and `patternHash` to surface clusters of misses
- Findings refine Phase 2 pattern library and unit tests

**Authenticity claim (once wired in):**
> "The redaction engine is designed to catch all the obvious identifiers, and when you correct it, you can choose to teach our open-source rules without ever sharing your raw record."

### 3.3 Shield Icon Activation

```
[ Type your question...                    🛡️  > Send ]
                                            ^
                                     Tap to preview
                                     what gets sent
```

- Shield icon appears only when Privacy Guard is ON
- Pulsing dot on first use to draw attention (then settles)
- Badge shows count: 🛡️³ (3 items will be redacted)

---

## Phase 4 — Prompt Guard (Behavioural Backstop)

**Status:** COMPLETE (February 18, 2026) — Implemented alongside Phase 2
**Locations:** 5 system prompts in `/app/backend/server.py` (main Dr Ben, timeline, variant, document, vision)
**What:** A system prompt prefix injected into every LLM call.
**Visibility:** Public (published in docs). Safe to share — it reinforces the trust story.

**Prompt:**
```
PRIVACY DIRECTIVE: You are receiving pre-redacted health data. If any personal 
identifiers (names, addresses, dates of birth, NHS numbers, insurance numbers, 
phone numbers, email addresses) have slipped through redaction, you MUST:
1. Ignore them completely in your analysis
2. Never repeat them in your response
3. Refer to the patient only as "you" or "the patient"
Proceed with health analysis on the clinical data only.
```

**Characteristics:**
- Always on. No toggle.
- Behavioural guard — relies on LLM compliance.
- Defence in depth: catches anything Phase 2 misses.
- Not sufficient alone (data still reaches LLM unredacted if Phase 2 fails).
- **Implemented alongside Phase 2** for immediate defence-in-depth. Low effort, high value.

---

## Phase 5 — Server-Side Layer 2 + Admin Controls (Proprietary)

**Status:** PLANNED
**What:** Additional redaction pass on the server before forwarding to LLM APIs, plus admin governance.
**Visibility:** Proprietary. This is our private risk-management layer.

### Admin Panel Control

```
Admin > Security Settings

┌────────────────────────────────────────────────────┐
│                                                    │
│  Server-Side Redaction              ━━━● ON        │
│                                                    │
│  Additional pattern matching on server before      │
│  data reaches LLM providers. Defence in depth.     │
│                                                    │
│  Active patterns:                                  │
│  ✓  UK NHS Numbers                                 │
│  ✓  UK National Insurance Numbers                  │
│  ✓  UK Postcodes                                   │
│  ✓  Email Addresses                                │
│  ✓  Phone Numbers                                  │
│                                                    │
│  Stats (last 30 days):                             │
│  |-- Queries processed: 342                        │
│  |-- Items redacted server-side: 18                │
│  |-- Items already redacted by client: 891         │
│                                                    │
│  Note: Most redaction happens client-side.         │
│  This is the safety net.                           │
│                                                    │
└────────────────────────────────────────────────────┘
```

**What lives here (not open-sourced):**
- Abuse-detection heuristics
- Edge-case handling rules
- Monitoring and alerting
- Admin slider for "strictness" or full block
- Server-side redaction stats and logging

**Why Admin Toggle?**
- **ON (default):** Belt and braces. Client missed something? Server catches it.
- **OFF:** For performance. If you trust the client engine, skip the server pass.
- **Operational visibility:** Admin sees how much work each layer is doing.

---

## Phase 6 — Open-Source Packaging & Docs

**Status:** PLANNED
**What:** Extract Phase 2 + Phase 3 client pieces into a clean, published library.
**Phase 5 logic stays entirely out of the public repo.**

### Repo Structure

```
ai-doctor-ben-privacy-guard/
├── README.md                  # Why this exists, how it works
├── SECURITY.md                # Honest limitations and threat model
├── LICENSE                    # MIT or Apache 2.0
├── src/
│   ├── redactus.js            # Client-side redaction engine (Phase 2)
│   ├── patterns/
│   │   ├── uk.json            # UK-specific regex patterns
│   │   ├── common.json        # Universal patterns (email, phone)
│   │   └── index.js           # Pattern loader
│   └── preview/
│       ├── DualPathPreview.js # React component (Phase 3)
│       └── SelfAudit.js       # Feedback module (Phase 3)
├── tests/
│   ├── redactus.test.js       # Unit tests with synthetic PII
│   ├── patterns.test.js       # Pattern accuracy tests
│   └── fixtures/
│       ├── sample-lab-text.txt     # Sample input (synthetic)
│       └── expected-output.txt     # Expected redacted output
└── docs/
    ├── ARCHITECTURE.md        # This design document
    └── PATTERNS.md            # Detailed pattern documentation
```

### SECURITY.md — Honest Limitations

**What this catches:**
- Structured PII: NHS numbers, NI numbers, postcodes, phone, email, DOB
- User-defined exact strings: anything the user tells us to block
- Clinician/hospital names in structured contexts (curated prefix patterns)
- Structured name fields: "Patient: [Name]", "Name: [Name]"

**What this does NOT catch:**
- Names embedded in narrative: "John mentioned his cholesterol is high"
- Contextual references: "my husband's results show..."
- Foreign language PII patterns (UK-only in v1)
- ~~PII in images/PDFs that OCR fails to extract~~ → **Addressed by Phase 2.5 Image Margin Crop**
- Sophisticated adversarial inputs designed to bypass regex

**Why that's acceptable:**
- Phase 4 (prompt guard) instructs the LLM to ignore any PII that slips through
- Phase 5 (server-side) provides additional proprietary defence
- Health records typically have structured PII (headers, footers) not embedded PII
- Users can add ANY custom string to catch edge cases specific to their documents
- Phase 3 self-audit lets users teach the rules without sharing raw data

---

## Complete Data Flow

```
Step 1: User uploads lab results / types question
         |
Step 1.2: Phase 2.5 — Image Margin Crop (if image upload + Privacy Guard ON)
         |-- User sees crop overlay on uploaded image
         |-- Drags top/bottom handles to remove PII-heavy margins
         |-- Crop geometry (percentages only) saved to crop_learning collection
         |-- Cropped image replaces original in upload pipeline
         |-- (Future: smart defaults pre-applied based on document type)
         |
Step 1.3: Phase 2.6 — Rectangle Redaction (if image upload + Privacy Guard ON)
         |-- On cropped image, user draws rectangles over any remaining mid-page PII
         |-- Rectangles burned into image copy (Canvas fillRect)
         |-- Rectangle geometry appended to crop_learning record
         |-- (Future: heatmap-based smart suggestions per document type)
         |
Step 2: OCR extracts text from PDF/cropped+redacted image (existing)
         |
Step 3: Phase 2 — Client-Side Redaction (open-source)
         |-- Exact match against user's custom blocked fields
         |-- Regex match against UK/US/EU pattern library
         |-- Curated prefix match for clinician/hospital
         |-- Structured name detection (heuristic)
         |-- Output: cleaned text + redaction log
         |
Step 4: Phase 3 — [Optional] Dual-Path Preview
         |-- Left:  Redacted items + cropped margins + blacked rectangles (dead end)
         |-- Right: Clean data + processed image centre (going to AI)
         |-- [Optional] User edits + self-audit feedback
         |-- User confirms "Send to AI"
         |
Step 5: Phase 4 — Prompt Guard
         System prompt instructs LLM to ignore any remaining PII
         |
Step 6: Phase 5 — Server-Side Redaction (proprietary, if admin toggle ON)
         Additional regex pass + abuse detection on server
         |
Step 7: LLM API Call (Gemini/Claude)
         Receives only cleaned health data + cropped+redacted image + user question
         |
Step 8: Response returned to user
         (LLM was never exposed to personal identifiers)
```

---

## Build Phases (Summary)

| Phase | Deliverable | Open/Closed | Depends On | Status |
|-------|------------|-------------|------------|--------|
| **1** | Privacy Guard UI (ON/OFF toggle + region selector) | Open (free) | None | **DONE** |
| **2** | Client Redaction Engine (JS, regex, tokens) + count display | Open (free) | Phase 1 | **DONE** |
| **2.5** | Image Margin Crop (manual crop + learning) | **Paid** (Preview tier) | Phase 1 | **SPEC READY** |
| **2.6** | Rectangle Redaction (mid-image PII + heatmap learning) | **Paid** (Preview tier) | Phase 2.5 | **SPEC READY** |
| **3** | Dual-Path Preview + Custom Fields Editor + Pattern Editor + Redaction Log | **Paid** (Preview tier) | Phase 2 | SPEC READY |
| **4** | Prompt Guard (system prompt injection) | Public | None | **DONE** |
| **5** | Server-Side Layer 2 + Admin Controls | Proprietary (Pro tier) | None | PLANNED |
| **6** | Open-Source Packaging & Docs | Public | Phases 2-3 | PLANNED |

**Free/Paid boundary:** Phases 1, 2, 4 are free and open-source. Phases 2.5, 2.6, 3 are paid (Preview tier). Phase 5 is paid (Pro tier). Phase 6 packages the free components for npm/GitHub.

**AI Doctor Ben exception:** All phases (free + paid) are bundled for AI Doctor Ben members. The tier split only affects standalone RedactUs.

---

## Detailed Wireframe — Dual-Path Preview

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  🛡️ Privacy Guard Preview                                   [  x  ]│
│                                                                     │
│  We scanned your data. Here's what happens to it:                   │
│                                                                     │
│  ════════════════════════╤═══════════════════════════════════════     │
│                         │                                           │
│  ⛔ STAYS ON DEVICE     │  ✅ SENT TO AI                            │
│  ─────────────────────  │  ────────────────────────────────         │
│                         │                                           │
│  ~~NHS: 943 476 5919~~  │  Total Cholesterol: 5.8 mmol/L           │
│  ~~NI: QQ 12 34 56 C~~  │  LDL Cholesterol: 3.9 mmol/L            │
│  ~~DOB: 15/03/1985~~    │  HDL Cholesterol: 1.4 mmol/L             │
│  ~~SW1A 1AA~~           │  Triglycerides: 1.7 mmol/L               │
│  ~~Patient: J. Smith~~  │  Fasting Glucose: 5.2 mmol/L             │
│  ~~Dr Patel~~           │  HbA1c: 5.4%                             │
│  ~~St Thomas'~~         │  Vitamin D: 42 ng/mL                     │
│                         │  TSH: 2.1 mIU/L                          │
│       │                 │                                           │
│       │                 │  Your question:                           │
│       v                 │  "What do these results mean              │
│                         │   for my heart health?"                   │
│    ┌───────┐            │                                           │
│    │       │            │         │                                 │
│    │  ⛔   │            │         v                                 │
│    │       │            │                                           │
│    │ DEAD  │            │    ┌──────────┐                           │
│    │ END   │            │    │          │                           │
│    └───────┘            │    │  ✅ GO   │                           │
│                         │    │          │                           │
│  7 items blocked.       │    │  CLEAN   │                           │
│  Never leaves your      │    │  & SAFE  │                           │
│  device.                │    └──────────┘                           │
│                         │                                           │
│                         │  AI receives health data only.            │
│                         │  Your identity stays with you.            │
│                         │                                           │
│  ════════════════════════╧═══════════════════════════════════════     │
│                                                                     │
│  [ ] Help improve redaction (anonymous pattern-level only)          │
│                                                                     │
│        [ Cancel ]                    [ ✅ Send to AI ]              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Metrics to Track

| Metric | Purpose |
|--------|---------|
| Privacy Guard adoption rate | % of users with toggle ON |
| Custom fields added per user | Are users engaging with the feature? |
| Client-side redactions per query | Is the engine catching things? |
| Server-side redactions per query | Is Phase 5 catching what Phase 2 missed? |
| Preview panel open rate | Are users inspecting? (Curiosity indicator) |
| Send-after-preview rate | Do users feel safe after seeing the preview? |
| Self-audit opt-in rate | Are users willing to help improve? |
| Pattern miss clusters (from feedback) | Which patterns need refinement? |
| Image crop skip rate | % who skip Phase 2.5 margin crop |
| Rectangle skip rate | % who skip Phase 2.6 rectangle redaction |
| Image crop engagement | Avg crop percentages per document type |
| Rectangle engagement | Avg rectangles placed per document type |
| **Privacy Engagement Score** | Composite score per user (see below) |

---

## Privacy Engagement Scoring (Anonymised Behavioural Profile)

**Purpose:** Understand — without attaching personal identity — how privacy-conscious our user base is. This drives product decisions: if 80% of users skip image redaction, we know to make it faster/simpler. If 80% engage deeply, we know to invest in Phase 3 preview.

**Where it lives:** `privacy_engagement` collection. One anonymous document per user, keyed by a hashed user ID (not email, not name). Updated on each privacy-related action.

### Scoring Signals

| Signal | Action | Points | Tracked How |
|--------|--------|--------|-------------|
| Privacy Guard toggle | ON (default) | +1 | localStorage check on session start |
| Privacy Guard toggle | Manually turned OFF | 0 | localStorage check on session start |
| Custom blocked fields | 0 fields | 0 | Count from localStorage |
| Custom blocked fields | 1-3 fields | +1 | Count from localStorage |
| Custom blocked fields | 4+ fields | +2 | Count from localStorage |
| Image margin crop (2.5) | Engages (adjusts crop) | +2 | `skipped: false` in crop_learning |
| Image margin crop (2.5) | Skips | 0 | `skipped: true` in crop_learning |
| Rectangle redaction (2.6) | Places 1+ rectangles | +2 | `rectangle_count > 0` in crop_learning |
| Rectangle redaction (2.6) | Skips | 0 | `rectangles_skipped: true` in crop_learning |
| Dual-Path Preview (3) | Opens preview | +1 | Client event |
| Dual-Path Preview (3) | Never opens | 0 | Absence of event |
| Self-Audit (3) | Opts in to feedback | +1 | Consent checkbox |

**Score range: 0–10**

### Privacy Concern Tiers

| Tier | Score | Label | What it tells us |
|------|-------|-------|-----------------|
| 0–2 | Low | "Convenience-first" | These users trust the system or don't worry about PII. They skip tools, leave defaults. Product learning: keep the skip path frictionless. |
| 3–5 | Medium | "Privacy-aware" | These users engage with some tools but not all. They're the mainstream. Product learning: make the tools faster and smarter (smart defaults). |
| 6–8 | High | "Privacy-driven" | These users actively configure, crop, redact, and inspect. They're the power users and likely advocates. Product learning: invest in Phase 3 preview and self-audit. |
| 9–10 | Very High | "Zero-trust" | These users use every available tool. They likely want Phase 5 (server-side) and would pay for RedactUs Pro. Product learning: these are your early enterprise customers. |

### What We Store (Per User, Anonymised)

```json
{
  "user_hash": "sha256(user_id + salt)",
  "score": 6,
  "tier": "high",
  "signals": {
    "guard_enabled": true,
    "custom_fields_count": 4,
    "image_crops_done": 12,
    "image_crops_skipped": 2,
    "rectangles_placed_total": 8,
    "rectangles_skipped": 3,
    "preview_opened": 7,
    "self_audit_opted_in": true
  },
  "updated_at": "2026-03-03T16:00:00Z"
}
```

**Privacy of the tracking itself:**
- `user_hash` is a one-way hash — cannot reverse to email or name
- No PII, no health data, no image content, no text content
- Only behavioural counts and booleans
- Aggregated for product analytics: "42% of users are Medium tier" — not "John Smith is Low tier"
- Admin dashboard shows aggregate distribution only (pie chart of tiers, trend lines)

### Integration Points

| Phase | What gets tracked |
|-------|------------------|
| Phase 1 (Privacy Guard UI) | `guard_enabled`, `custom_fields_count` — read from localStorage on session |
| Phase 2 (Text redaction) | Already tracked: redaction count per query |
| Phase 2.5 (Margin crop) | `image_crops_done` / `image_crops_skipped` — from `crop_learning.skipped` |
| Phase 2.6 (Rectangle redaction) | `rectangles_placed_total` / `rectangles_skipped` — from `crop_learning.rectangles_skipped` |
| Phase 3 (Dual-Path Preview) | `preview_opened` — client event on shield icon click |
| Phase 3 (Self-Audit) | `self_audit_opted_in` — consent checkbox state |

### Admin Dashboard View (Future)

```
┌──────────────────────────────────────────────────────┐
│  Privacy Engagement Overview          Last 30 days   │
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │ Low: 15%   │  │ Med: 52%   │  │ High: 28%  │     │
│  │            │  │            │  │            │     │
│  │ 23 users   │  │ 79 users   │  │ 43 users   │     │
│  └────────────┘  └────────────┘  └────────────┘     │
│                                                      │
│  Very High: 5% (8 users)                             │
│                                                      │
│  Image Crop Skip Rate: 31%                           │
│  Rectangle Skip Rate: 48%                            │
│  Preview Open Rate: 22%                              │
│  Avg Score: 4.7 (Medium)                             │
│                                                      │
│  Trend: ↑ Score rising 0.3/month (users engaging     │
│         more as smart defaults improve)              │
└──────────────────────────────────────────────────────┘
```

---

## Key Decisions

| Decision | Resolution |
|----------|-----------|
| Default toggle state | **ON** — protect silently |
| Pattern library scope | **UK-first** — match user base |
| Preview mandatory on first use? | **Yes once** — then optional |
| Custom fields backup | **Include** in JSON backup (encrypted section) |
| Redaction counter visible to user? | **Yes** — builds confidence. Free tier shows count only, paid shows details. |
| Clinician/hospital detection | **Curated prefix patterns** — not naive keyword search |
| Self-audit data collection | **Opt-in only** — checkbox OFF by default |
| Prompt Guard timing | **Build alongside Phase 2** — low effort, immediate value |
| Open-source boundary | **Phases 1, 2, 4 free. Phases 2.5, 2.6, 3 paid (Preview). Phase 5 paid (Pro).** |
| Custom blocked fields | **Paid feature (Preview tier)** — free tier uses default patterns only |
| Image crop/rectangle | **Paid feature (Preview tier)** — bundled with custom fields and preview |
| Image crop/rectangle skip | **Always available, no judgement** — skip recorded for learning |
| Privacy Engagement tracking | **Anonymised** — hashed user ID, behavioural counts only, no PII |
| Privacy tier labels | **Internal only** — never shown to the user, only in admin analytics |
| AI Doctor Ben members | **All paid features bundled** — tier split only affects standalone RedactUs |

---

## v1.2 Changelog (March 2026)

### Engine Sync
All three engine files are now fully synchronised:
- `/app/redactus-standalone/index.html` (embedded engine)
- `/app/redactus-standalone/redactus-engine.js` (importable module)
- `/app/frontend/src/utils/redactionEngine.js` (in-app engine)

### New Patterns Added
- **MRN** (Medical Record Numbers) — 5-10 digit codes in context of "MRN", "Patient ID", etc.
- **Auth/Claim Codes** — alphanumeric codes near "authorization", "claim", "pre-auth" context
- **Insurer Names** — prefix patterns for "Insurance provider:", "Insurer:"
- **Guarantor Names** — prefix pattern for "Guarantor:", "Guarantor name:"
- **Transaction IDs** — `TXN-`, `REF-`, `INV-` prefixed codes
- **Card Last 4** — 4-digit numbers near "card"/"last 4" context
- **Hospital Reference Numbers** — alphanumeric codes near hospital context
- **Insurance/Policy/Membership IDs** — alphanumeric codes near insurance context

### Perplexity Refinements (v1.2)
- **US Phone**: Bare US format (`503-555-1234`, `(503) 555-1234`) now caught without requiring "Phone:" label. `us_phone` pattern is no longer context-required.
- **Address Merge**: Full US address (street + city + state + ZIP) merged into single `[ADDRESS-REDACTED]` token instead of separate tokens. `us_address_full` regex catches the complete address. `us_city_state_zip` catches standalone city/state/ZIP.
- **Clinician Multi-Word**: `Dr FirstName MiddleInitial. LastName` caught by standalone pattern. Additional prefixes: `physician:`, `provider:`, `practitioner:`, `clinician:`, `attending physician:`.

### Bug Fixes
- **Cross-line name capture**: Changed `\s+` to `[^\S\n]+` in NAME_PATTERNS to prevent name regex from consuming text across newlines.
- **Insurer/Clinician priority**: INSURER_PREFIXES now run before CLINICIAN_PREFIXES to prevent `provider:` from matching "Insurance provider:" as a clinician.
- **US pattern priority**: When region is US, US patterns (more specific) run before UK patterns to prevent `uk_address` from grabbing just the street part of a full US address.
- **Unicode dash support**: SSN, hospital_ref, insurance_id, auth_claim, transaction_id patterns now match en-dashes (\u2013) and non-breaking hyphens (\u2011).

---

## v2 — Entity Differentiation (PLANNED)

### Problem
Currently, all names produce the generic `[NAME-REDACTED]` token regardless of role. This loses important context for downstream AI processing.

**Current output:**
```
Referred by [NAME-REDACTED] at [HOSPITAL-REDACTED]
Next of kin: [NAME-REDACTED]
Guarantor: [NAME-REDACTED]
```

The AI can't distinguish the patient from the clinician from the guarantor.

### Proposed Solution
Replace generic tokens with role-specific entity tokens:

| Current Token | v2 Token | Source Pattern |
|--------------|----------|---------------|
| `[NAME-REDACTED]` (from `Patient:`) | `[PATIENT-NAME]` | NAME_PATTERNS: patient, patient name, name, dear |
| `[NAME-REDACTED]` (from `Next of kin:`) | `[KIN-NAME]` | NAME_PATTERNS: next of kin, emergency contact |
| `[NAME-REDACTED]` (from `Guarantor:`) | `[GUARANTOR-NAME]` | NAME_PATTERNS: guarantor, guarantor name |
| `[CLINICIAN-REDACTED]` | `[CLINICIAN-NAME]` | CLINICIAN_PREFIXES |
| `[INSURER-REDACTED]` | `[INSURER-NAME]` | INSURER_PREFIXES |
| `[NAME-REDACTED]` (from `Cardholder:`) | `[CARDHOLDER-NAME]` | NAME_PATTERNS: cardholder |

### Implementation Approach
1. Each NAME_PATTERN regex already has a unique prefix (`patient:`, `next of kin:`, `guarantor:`, etc.)
2. Map each prefix to its specific entity token
3. The name capture logic (`while (match = re.exec(result))`) already knows which pattern matched
4. Change the replacement from `[NAME-REDACTED]` to the mapped entity token

### Backward Compatibility
- The `redactText()` return value already includes `stats` with label counts
- v2 stats would show: `{ "Patient Name": 1, "Kin Name": 1, "Clinician Name": 2 }` instead of `{ "Name": 2, "Clinician": 2 }`
- Existing users who search for `[NAME-REDACTED]` in their workflows would need to update

### Additional v2 Improvements
- **Configurable token format**: Support `[REDACTED:PATIENT_NAME]` style for structured extraction
- **Pattern confidence scoring**: Tag each redaction as high/medium/low confidence
- **Expanded pattern coverage**: More international ID formats per Perplexity feedback

---

*This document is the canonical reference for the Privacy Guard redaction system. Update when implementation proceeds or design decisions change.*
