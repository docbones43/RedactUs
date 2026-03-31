# RedactUs

**The tool you MUST run before sending files to OpenClaw, ChatGPT, Claude, Perplexity,**

**Strip identity. Keep data such as health queries or financial statements 100% client-side.**

RedactUs is a privacy redaction engine that removes personal identifiers from text before it reaches any AI service. It runs entirely in the browser — zero server calls, zero dependencies, works offline.

Born from [AI Doctor Ben](https://the.aidoctorben.com), a health-tech application with embedded redaction services where members need to share medical data with multiple AI without exposing their identity.

---

## Products

### [Standalone Tool](/standalone/) — FREE

A single HTML file. Download it, open it in your browser, paste your text, click Redact. That's it.

**No installation. No account. No internet required. Works forever.**

- 20+ pattern types across UK, US, and EU regions
- Names, addresses, phone numbers, NHS numbers, SSNs, MRNs, insurance IDs, and more
- Markdown stripping pre-processor (handles text pasted from AI tools)
- Unicode dash support (catches formatted PDFs and documents)

**Get started:** Download [`standalone/index.html`](/standalone/index.html) and open in any browser.

**Integrate into your app:** Import [`standalone/redactus-engine.js`](/standalone/redactus-engine.js) as a JS module.

```javascript
import { redactText } from './redactus-engine.js';

const result = redactText("Patient: John Smith, NHS 943 476 5919", { region: 'UK' });
console.log(result.redactedText);
// → "Patient: [NAME-REDACTED], NHS [NHS-REDACTED]"
```

### Browser Extension — COMING SOON (Paid)

Redact directly inside Perplexity, ChatGPT, Claude, and Gemini. No copy-paste — the extension intercepts text before submission.

### RedactUs Preview — COMING SOON (Paid)

Visual "What you typed vs What AI sees" preview. Custom blocked fields. Image redaction tools.

## In-Depth Documentation
- [Redaction Engine Design](docs/REDACTION_DESIGN.md) — Regex patterns, architecture, accuracy trade-offs.
- [Product Concept](docs/REDACTUS_PRODUCT_CONCEPT.md) — Vision, user personas, differentiation.
- [Spin-off Reference](docs/REDACTUS_SPINOFF_REFERENCE.md) — Commercial evolution & independence plan.
  
---

## How It Works

```
Your text  →  RedactUs (in your browser)  →  Clean text  →  AI service
                    ↓
         Identity stripped here.
         Never leaves your device.
```

| What's stripped (your identity) | What passes through (your health data) |
|--------------------------------|---------------------------------------|
| Name, DOB, address, postcode/ZIP | Cholesterol, blood glucose, HbA1c |
| NHS number, SSN, MRN | Vitamin levels, hormones, medications |
| Phone, email | Symptoms, conditions, test results |
| Clinician and hospital names | Lab reference ranges and units |
| Insurance IDs, claim codes | Your question to the AI |

---

## Repository Structure

```
RedactUs/
├── README.md              ← You are here
├── LICENSE
├── standalone/            ← Free HTML tool + JS module + docs
│   ├── index.html
│   ├── redactus-engine.js
│   ├── README.md
│   ├── ROADMAP.md
│   ├── SECURITY.md
│   ├── USER_GUIDE.md
│   └── LICENSE
├── extension/             ← Future: Chrome/Firefox extension
├── packages/              ← Future: npm package
└── docs/                  ← Future: shared design specs
```

---

## Documentation

| Document | What it covers |
|----------|---------------|
| [Standalone README](/standalone/README.md) | Developer quickstart, token reference, free vs paid roadmap |
| [User Guide](/standalone/USER_GUIDE.md) | How to use with Perplexity, ChatGPT, Claude |
| [Security](/standalone/SECURITY.md) | Honest limitations and threat model |
| [Roadmap](/standalone/ROADMAP.md) | Full phase roadmap with release sequence |

---

## Licence

MIT — see [LICENSE](./LICENSE).

---

Built by the [AI Doctor Ben](https://the.aidoctorben.com) team.
