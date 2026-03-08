# RedactUs — User Guide

**How to protect your identity when using AI health tools**

---

## What is RedactUs?

RedactUs strips personal identifiers from your text **before** you paste it into any AI tool — Perplexity, ChatGPT, Claude, or any other. It runs entirely in your browser. No data is sent anywhere.

Your health data (cholesterol levels, blood results, symptoms) passes through untouched. Your identity (name, address, NHS number, date of birth) is replaced with safe placeholders.

---

## Quick Start (2 minutes)

### Step 1: Open RedactUs

Open `index.html` in your browser. That's it — no installation, no account, no internet required.

### Step 2: Select your region

Choose **UK**, **US**, or **EU** from the dropdown. This activates the right pattern set for your country's ID formats. **US mode** adds full address merging (street + city + state + ZIP into one token) and catches US phone formats without country codes.

### Step 3: Paste your text

Copy your lab results, health notes, or the question you want to ask the AI. Paste it into the left panel ("Paste your text").

### Step 4: Click Redact

The right panel shows your cleaned text with personal data replaced by safe tokens like `[NHS-REDACTED]` or `[NAME-REDACTED]`.

### Step 5: Copy and paste into your AI tool

Click **"Copy to Clipboard"**, switch to Perplexity (or ChatGPT, Claude, etc.), and paste. The AI receives your health data without your identity.

**Keyboard shortcut:** Press `Ctrl + Enter` (or `Cmd + Enter` on Mac) to redact instantly.

---

## Before and After Example

### What you paste in (raw lab results):

```
Patient: John Smith, DOB 15/03/1985, NHS no. 943 476 5919,
12 Oak Lane, SW1A 1AA. Seen by Dr Patel at St Thomas' Hospital
on 09/02/2026. Total Cholesterol 5.8 mmol/L, LDL 3.9 mmol/L,
HDL 1.4 mmol/L, Fasting Glucose 5.2 mmol/L.
Email: john.smith@gmail.com, Phone: 07700 900123
Insurance provider: Bupa
```

### What RedactUs produces (cleaned):

```
Patient: [NAME-REDACTED], DOB [DOB-REDACTED], NHS no. [NHS-REDACTED],
[ADDRESS-REDACTED], [POSTCODE-REDACTED]. [CLINICIAN-REDACTED]
[HOSPITAL-REDACTED] on [DATE-REDACTED]. Total Cholesterol 5.8 mmol/L,
LDL 3.9 mmol/L, HDL 1.4 mmol/L, Fasting Glucose 5.2 mmol/L.
Email: [EMAIL-REDACTED], Phone: [PHONE-REDACTED]
[INSURER-REDACTED]
```

### What the AI sees:

All health metrics intact. Zero personal identifiers. The AI can still analyse your cholesterol, flag your LDL as high, and give you useful health guidance — it just doesn't know who you are.

---

## What Stays vs What's Stripped

| Stripped (your identity) | Kept (your health data) |
|--------------------------|------------------------|
| Full name (inc. titles Mr/Mrs/Dr) | Cholesterol, LDL, HDL values |
| Date of birth | Blood glucose & HbA1c |
| NHS number / SSN | Vitamin levels & hormones |
| National Insurance / IBAN | Reference ranges & units |
| MRN / Medical Record Number | Symptoms & conditions |
| Home address & postcode/ZIP | Medication names & doses |
| Full US address (street + city + state + ZIP) | Lab test names |
| Flat/apartment/suite addresses | Your question to the AI |
| Phone number (UK, US, international) | Clinical timeline dates (standalone) |
| Email address | |
| Hospital & clinician names (multi-word, with initials) | |
| GP practice name | |
| Next of kin name | |
| Guarantor name | |
| Emergency contact name | |
| Insurance provider & policy IDs | |
| Auth/claim/pre-auth codes | |
| Membership numbers | |
| Cardholder name | |
| Card last 4 digits (in context) | |
| Transaction IDs | |
| Hospital reference numbers | |
| Appointment dates (near clinic context) | |

**The principle:** Anything that could identify *you* is stripped. Anything that describes *your health* passes through.

---

## Using RedactUs with Perplexity

1. Open your lab results PDF or health notes
2. Copy the text you want to ask about
3. Open RedactUs (`index.html`) in another tab
4. Paste, click **Redact**, click **Copy to Clipboard**
5. Switch to Perplexity
6. Paste the cleaned text and add your question, e.g.:
   > "Based on these blood results, what should I discuss with my doctor about heart health?"
7. Perplexity analyses your health data without ever seeing your name, address, or NHS number

The same workflow works for ChatGPT, Claude, Gemini, or any other AI tool.

---

## Using RedactUs with ChatGPT / Claude

Identical to Perplexity — paste cleaned text into the chat. These tools work with the redacted tokens seamlessly because the health data and context remain intact.

---

## Region Selection Guide

| Region | What it detects |
|--------|----------------|
| **UK** | NHS numbers, NI numbers, UK postcodes, UK phone formats, street addresses |
| **US** | Full US addresses (street + city, state ZIP merged), US phone formats (with and without country code), ZIP codes (in address context) |
| **EU** | IBAN numbers, European health card numbers, EU date formats |

**All regions** also detect: SSNs, MRNs, phone numbers, email addresses, dates of birth, clinician names (multi-word, with middle initials), hospital/clinic names, insurer names, guarantor names, insurance/policy IDs, auth/claim codes, transaction IDs, and common name patterns.

**Tip:** If you're in the UK, the default (UK) is correct. UK patterns are always active even when you select US or EU, because the engine layers patterns — it doesn't replace them.

---

## Privacy Guarantee

- **No data leaves your browser.** RedactUs is a single HTML file with embedded JavaScript. It makes zero network requests.
- **No tracking, no cookies, no analytics.** Open it, use it, close it.
- **No account required.** No signup, no email, no payment for Core.
- **Works offline.** Save the file to your desktop and use it without internet.
- **Open source (MIT licence).** Read every line of code. There are no secrets.

---

## FAQ

**Q: Can I use this offline?**
A: Yes. Save `index.html` to your desktop. It works without internet.

**Q: Does RedactUs send my data anywhere?**
A: No. Open your browser's Network tab (F12 > Network) while using it — you'll see zero requests.

**Q: What if it misses something?**
A: RedactUs catches structured identifiers (NHS numbers, SSNs, MRNs, postcodes, emails, etc.) and common name patterns. It may miss names embedded in narrative text like "my husband John mentioned...". Always review the output before pasting. See SECURITY.md for the full honest limitations list.

**Q: Can I add my own blocked words?**
A: Not in the free Core version. Custom blocked fields are part of RedactUs Preview (paid tier, coming soon).

**Q: Does this work for non-English text?**
A: The pattern matching is optimised for English-language UK/US/EU documents. It will catch universal patterns (emails, phone numbers) in any language, but country-specific patterns (NHS numbers, postcodes) are English-format only.

**Q: Why does the output look slightly different from my input?**
A: RedactUs strips markdown formatting (bold, italic, strikethrough) before pattern matching. This is intentional — formatting characters can break identifier detection. The medical content is unaffected.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` / `Cmd + Enter` | Run redaction |

---

*RedactUs Core v1.2 — MIT Licence — Built by the AI Doctor Ben team*
