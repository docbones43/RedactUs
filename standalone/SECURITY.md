# RedactUs — Security & Limitations

**Honest documentation of what RedactUs catches and what it doesn't.**

We believe trust comes from honesty, not marketing. This document explains exactly where RedactUs is strong, where it's weak, and what you should do about the gaps.

---

## What RedactUs Catches (High Confidence)

These are detected reliably using regex pattern matching and structured context rules:

| Type | Detection Method | Confidence |
|------|-----------------|------------|
| NHS Numbers | 3-3-4 digit pattern | Very High |
| National Insurance Numbers | Letter-digit format (AA 00 00 00 A) | Very High |
| UK Postcodes | Standard UK format | Very High |
| Social Security Numbers | XXX-XX-XXXX (incl. en-dash, non-breaking hyphen) | Very High |
| Email Addresses | RFC-style regex | Very High |
| Phone Numbers | UK, US (with/without country code, parenthesized), international | High |
| IBAN Numbers | Country code + digits | High |
| MRN / Medical Record Numbers | 5-10 digits near "MRN", "Patient ID", etc. | High |
| Clinician Names | Structured prefixes (`Seen by Dr`, `Consultant:`, `GP:`, `Attending physician:`, `Ordering physician:`, `Dr FirstName MI. LastName`) | High |
| Hospital/Clinic Names | Structured prefixes (`at [Name] Hospital`, `Clinic:`, `Medical Center/Centre`) | High |
| Insurer Names | Structured prefixes (`Insurance provider:`, `Insurer:`) | High |
| Insurance/Policy/Membership IDs | Alphanumeric codes near insurance/policy context | High |
| Auth/Claim Codes | Alphanumeric codes near authorization/claim context | High |
| Dates of Birth | Date format near DOB-context keywords | High |
| Patient Names | Structured labels (`Patient:`, `Name:`, `Dear`) | Medium-High |
| Guarantor Names | Structured label (`Guarantor:`, `Guarantor name:`) | Medium-High |
| Next of Kin / Emergency Contact | Structured labels with negative lookahead for phone/email | Medium-High |
| Cardholder Names | All-caps format near `Cardholder:` | Medium |
| Hospital Reference Numbers | Alphanumeric codes near hospital/reference context | Medium |
| Transaction IDs | `TXN-`, `REF-`, `INV-` prefixed codes | Medium |
| Card Last 4 Digits | 4-digit number near "card"/"last 4" context | Medium |
| US Full Addresses | Street + City, State ZIP merged into single token (US region) | High |
| UK Street Addresses | Number + street name + suffix (incl. Flat/Apartment/Suite) | High |

---

## Pre-Processing: Markdown Stripping

Before any pattern matching runs, RedactUs strips markdown and rich-text formatting:
- Bold (`**text**`), italic (`*text*`), bold+italic (`***text***`)
- Strikethrough (`~~text~~`)
- Zero-width spaces

This prevents formatting characters from breaking word boundaries in regex patterns. It's essential when processing text pasted from AI tools, formatted documents, or markdown editors.

---

## What RedactUs Does NOT Catch

Be aware of these limitations:

### Names in Narrative Text
- **Example:** "My husband John mentioned his cholesterol is high"
- **Why:** "John" appears as ordinary text, not in a structured `Patient:` or `Name:` field
- **Risk:** Low-Medium. Most lab reports use structured fields. Narrative names are more common in free-text chat.
- **Mitigation:** Review the output before pasting. In future, custom blocked fields (Tier 2) let you explicitly block "John".

### Contextual References
- **Example:** "The results from my appointment at the clinic on Baker Street"
- **Why:** "Baker Street" isn't in a `Hospital:` or `Address:` structured field
- **Risk:** Low. Addresses in lab reports are typically in structured headers (caught by postcode/address detection).

### Foreign Language PII
- **Example:** German health insurance numbers, French carte vitale in non-standard format
- **Why:** v1 patterns are optimised for UK/US/EU standard formats in English
- **Risk:** Medium for non-English documents.

### Adversarial Inputs
- **Example:** Deliberately obfuscated PII like "N-H-S: nine four three..."
- **Why:** Regex matches character patterns, not semantic meaning
- **Risk:** Very Low in practice. Users aren't trying to bypass their own privacy tool.

### PII in Images
- **Example:** A photo of a lab report (not OCR'd text)
- **Why:** RedactUs Core operates on text only. Image redaction is Phase 2.5/2.6 (Tier 2).
- **Risk:** High if users paste images directly into AI tools. RedactUs only protects text input.
- **Mitigation:** Always use text (type or OCR), not screenshots, when asking AI about health data.

### Unusual Identifier Formats
- **Example:** A hospital reference number like "RPT-2026-0482" that doesn't match any pattern
- **Why:** We can't anticipate every hospital's custom reference format
- **Risk:** Low-Medium. These are institutional identifiers, not directly personal.

---

## Threat Model

### What RedactUs Protects Against

| Threat | Protection |
|--------|-----------|
| Accidental PII exposure to AI services | Strong — structured identifiers caught before transmission |
| Re-identification from health data + location | Strong — postcodes, addresses, city/state/ZIP, hospital names stripped |
| Re-identification from health data + clinician name | Strong — clinician prefixes detected (multi-word names, middle initials) |
| Re-identification from health data + date + clinic | Strong — co-occurring dates near clinic context stripped |
| Re-identification from insurance/claim codes | Strong — insurance IDs, auth/claim codes, MRNs detected in context |

### What RedactUs Does NOT Protect Against

| Threat | Why Not |
|--------|---------|
| Unique medical conditions that identify by rarity | Health data passes through by design — extremely rare conditions could theoretically identify |
| AI service storing your queries server-side | RedactUs cleans the input, but can't control what the AI service does with it |
| Screenshots or images pasted directly | Text-only processing in Core tier |
| Browser extensions or malware reading your clipboard | Out of scope — OS/browser security responsibility |

---

## Defence in Depth (AI Doctor Ben)

When used inside AI Doctor Ben, RedactUs is one layer of a multi-layer system:

1. **Layer 1: RedactUs Engine** (client-side, open-source) — regex pattern matching
2. **Layer 2: Prompt Guard** (system prompt) — instructs AI to ignore any PII that slips through
3. **Layer 3: Server-Side Redaction** (proprietary) — additional pass before LLM API call

In standalone mode (this package), only Layer 1 is active. The output is still significantly cleaner than raw text, but it's one layer, not three.

---

## Recommendations

1. **Always review the output** before pasting into an AI tool. The right panel shows you exactly what will be sent.
2. **Use text, not screenshots.** RedactUs Core can only process text. Don't paste images of lab results into AI tools.
3. **Check the count.** If "0 items redacted" on text that clearly contains personal data, check your region selector — you may need US patterns for US formats.
4. **For maximum protection**, use RedactUs inside AI Doctor Ben, which adds Prompt Guard and server-side redaction layers.

---

## Reporting Issues

If you find a pattern that should be caught but isn't, or a false positive (health data incorrectly redacted), please open an issue on GitHub. Include:

- The **type** of data that was missed (e.g., "NI number in format XX 00 00 00 X")
- The **context** (was it in a structured field or narrative text?)
- Do **NOT** include real personal data in bug reports. Use synthetic examples.

---

*RedactUs Core v1.2 — MIT Licence*
*Last updated: March 2026*
