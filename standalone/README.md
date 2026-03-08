# RedactUs

**Client-side PII redaction for AI applications. Your data goes to AI. Your identity doesn't.**

---

## What is this?

RedactUs strips personal identifiers (names, addresses, NHS numbers, SSNs, emails, phone numbers, insurance IDs, and more) from text **before** it's sent to any AI service. It runs entirely in the browser — zero server calls, zero dependencies, works offline.

Born inside [AI Doctor Ben](https://the.aidoctorben.com) (a health-tech app), RedactUs solves a universal problem: people want to use AI but don't trust it with their identity.

## Quick Start

### Option 1: Use the standalone page

Open `index.html` in any browser. Paste text, click Redact, copy the cleaned output.

### Option 2: Integrate into your app (5 minutes)

```javascript
// Copy redactus-engine.js into your project, then:

import { redactText } from './redactus-engine.js';

const input = "Patient: John Smith, NHS no. 943 476 5919, SW1A 1AA";
const result = redactText(input);

console.log(result.redactedText);
// → "Patient: [NAME-REDACTED], NHS no. [NHS-REDACTED], [POSTCODE-REDACTED]"

console.log(result.totalRedacted);
// → 3
```

### Option 3: Use as a module

```html
<script type="module">
  import { createRedactor } from './redactus-engine.js';
  
  const redactor = createRedactor({ region: 'UK' });
  const clean = redactor.redact("Patient: John Smith, NHS 943 476 5919");
  document.getElementById('output').value = clean.redactedText;
</script>
```

## What It Catches

### Always Active (all regions)

- **SSN** (XXX-XX-XXXX, including en-dash and non-breaking hyphen variants)
- **MRN / Medical Record Numbers** (5-10 digit codes in context of "MRN", "Patient ID", etc.)
- **Phone numbers** (UK, US with parentheses, international formats)
- **Email addresses**
- **Dates of birth** (context-aware — only in PII context, not clinical dates)
- **Clinician names** (`Seen by Dr...`, `Consultant:`, `GP:`, `Attending physician:`, `Ordering physician:`, `Dr FirstName MiddleInitial. LastName`)
- **Hospital/clinic names** (`at St Thomas' Hospital`, `Hospital:`, `Medical Center/Centre`)
- **Insurer names** (`Insurance provider:`, `Insurer:`)
- **Patient names** (`Patient: John Smith`, `Name: Jane Doe`)
- **Guarantor names** (`Guarantor: ...`, `Guarantor name: ...`)
- **Next of kin / Emergency contact names**
- **Cardholder names** (all-caps format)
- **Hospital reference numbers** (e.g., `RPT-2026-0482` in context)
- **Insurance / Policy / Membership IDs** (alphanumeric codes in context)
- **Auth / Claim codes** (e.g., `AUTH-12345`, `PRE-AUTH-00789` in context)
- **Transaction IDs** (`TXN-...`, `REF-...`, `INV-...`)
- **Card last 4 digits** (in context of "card", "last 4")

### UK Patterns
- NHS Numbers (3-3-4 format)
- National Insurance Numbers
- UK Postcodes
- UK Street Addresses (including Flat/Apartment/Suite)

### US Patterns
- Full street addresses with city, state, and ZIP (merged into single token)
- City, State ZIP combinations (in address context)
- US phone numbers without country code (in phone context)
- ZIP Codes (context-aware — only near address keywords)

### EU Patterns
- IBAN Numbers
- European Health Card Numbers (context-aware)

## Pre-Processing

RedactUs automatically **strips markdown formatting** (bold, italic, strikethrough, zero-width spaces) before pattern matching. This prevents formatting characters from breaking word boundaries in regex patterns — a common issue when pasting from AI tools or formatted documents.

## What It Does NOT Catch

See [SECURITY.md](./SECURITY.md) for the full honest limitations list.

TL;DR: It catches structured identifiers, common name patterns, and context-aware codes. It does **not** catch names embedded in narrative text ("my husband John mentioned...") or sophisticated adversarial inputs.

## File Structure

```
redactus-standalone/
├── index.html           # Standalone web app (open in browser)
├── redactus-engine.js   # Core engine (import into your project)
├── README.md            # This file
├── USER_GUIDE.md        # End-user guide (how to use with Perplexity etc.)
├── SECURITY.md          # Honest limitations and threat model
└── LICENSE              # MIT
```

## Replacement Tokens

| Detected Type | Token |
|--------------|-------|
| NHS Number | `[NHS-REDACTED]` |
| NI Number | `[NI-REDACTED]` |
| Postcode | `[POSTCODE-REDACTED]` |
| Phone | `[PHONE-REDACTED]` |
| Email | `[EMAIL-REDACTED]` |
| Date of Birth | `[DOB-REDACTED]` |
| SSN | `[SSN-REDACTED]` |
| MRN / Medical Record | `[MRN-REDACTED]` |
| ZIP Code | `[ZIP-REDACTED]` |
| IBAN | `[IBAN-REDACTED]` |
| Health Card | `[HEALTHCARD-REDACTED]` |
| Patient Name | `[NAME-REDACTED]` |
| Clinician | `[CLINICIAN-REDACTED]` |
| Hospital/Clinic | `[HOSPITAL-REDACTED]` |
| Insurer | `[INSURER-REDACTED]` |
| Co-occurring Date | `[DATE-REDACTED]` |
| Address | `[ADDRESS-REDACTED]` |
| Hospital Reference | `[REF-REDACTED]` |
| Insurance/Policy ID | `[INSURANCE-REDACTED]` |
| Auth/Claim Code | `[CLAIM-REDACTED]` |
| Transaction ID | `[TRANSACTION-REDACTED]` |
| Card Digits | `[CARD-REDACTED]` |

## Configuration

The engine accepts a region parameter that determines which pattern set is active:

| Region | Active Patterns |
|--------|----------------|
| `UK` (default) | UK + Base (SSN, MRN, phone, email, DOB, names, clinicians, insurers) |
| `US` | UK + US + Base (adds full US addresses with city/state/ZIP, US phone formats, ZIP codes) |
| `EU` | UK + EU + Base (adds IBAN, European health cards) |

UK patterns are always active as the foundation. US and EU patterns layer on top.

## Unicode Support

Pattern matching handles en-dashes (\u2013), non-breaking hyphens (\u2011), and standard hyphens interchangeably. This catches identifiers that have been reformatted by word processors, PDFs, or AI tools.

## Browser Support

Any modern browser (Chrome, Firefox, Safari, Edge). No build step, no transpilation, no polyfills needed.

## Licence

MIT — see [LICENSE](./LICENSE).

## Tiers — Free vs Paid Roadmap

### Free (Available Now)

| Feature | Status |
|---------|--------|
| Standalone HTML tool (this package) | SHIPPED v1.2 |
| JS module for integration | SHIPPED v1.2 |
| 20+ pattern types (UK/US/EU) | SHIPPED |
| Markdown stripping pre-processor | SHIPPED |
| Multi-word clinician names | SHIPPED |
| US full address merge (street + city/state/ZIP) | SHIPPED |
| Works offline, zero dependencies | SHIPPED |

### Coming Soon — Free

| Feature | Status |
|---------|--------|
| v2 Entity differentiation (`[PATIENT-NAME]` vs `[CLINICIAN-NAME]`) | PLANNED |
| npm package (`npm install redactus`) | PLANNED |
| GitHub Releases with versioned downloads | PLANNED |

### Paid — Browser Extension

| Feature | Status |
|---------|--------|
| Chrome/Firefox extension — redact directly on AI sites | PLANNED |
| Inline redaction on Perplexity, ChatGPT, Claude, Gemini | PLANNED |
| No copy-paste — extension intercepts text before submission | PLANNED |
| Settings synced via browser storage | PLANNED |

### Paid — RedactUs Preview (for developers/apps)

| Feature | Status |
|---------|--------|
| Dual-path preview ("What you typed / What AI sees") | SPEC READY |
| Custom blocked fields editor | SPEC READY |
| Image margin crop (remove PII-heavy headers/footers) | SPEC READY |
| Rectangle redaction (draw boxes over mid-page PII) | SPEC READY |
| Redaction history/log | SPEC READY |

### Paid — RedactUs Pro (enterprise)

| Feature | Status |
|---------|--------|
| Custom pattern packs | PLANNED |
| Org-wide policies and central config | PLANNED |
| Audit logs and compliance reports | PLANNED |
| Server-side redaction (defence-in-depth) | PLANNED |

**Full roadmap:** See [ROADMAP.md](./ROADMAP.md)

## Credits

Built by the [AI Doctor Ben](https://the.aidoctorben.com) team. RedactUs was born from the need to protect patient identity while using AI for health analysis.

---

*"The only privacy redaction tool to run fully in your browser — before info is sent to the servers."*
