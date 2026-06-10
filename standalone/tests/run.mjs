// RedactUs test harness
// ---------------------
// Zero dependencies. Node 18+. Runs the canonical fixtures and prints a summary.
//
//   node standalone/tests/run.mjs
//
// Each fixture asserts:
//   - that every token in `mustContain` appears in the redacted output
//   - that no string in `mustNotContain` appears in the redacted output
//   - that `totalRedacted` is at least `minRedactions`
//
// The harness does NOT assert exact string equality. The engine's exact replacement
// boundaries may shift as patterns improve; what matters is that PII is gone and
// clinical data is preserved.

import { redactText } from "../redactus-engine.js";

const FIXTURES = [
  // --- UK -----------------------------------------------------------------
  {
    name: "UK lab report (USER_GUIDE canonical example)",
    region: "UK",
    input:
      "Patient: John Smith, DOB 15/03/1985, NHS no. 943 476 5919, " +
      "12 Oak Lane, SW1A 1AA. Seen by Dr Patel at St Thomas' Hospital " +
      "on 09/02/2026. Total Cholesterol 5.8 mmol/L, LDL 3.9 mmol/L, " +
      "HDL 1.4 mmol/L, Fasting Glucose 5.2 mmol/L. " +
      "Email: john.smith@gmail.com, Phone: 07700 900123. " +
      "Insurance provider: Bupa",
    mustContain: [
      "[NAME-REDACTED]",
      "[NHS-REDACTED]",
      "[POSTCODE-REDACTED]",
      "[EMAIL-REDACTED]",
      "[PHONE-REDACTED]",
    ],
    mustNotContain: [
      "John Smith",
      "943 476 5919",
      "SW1A 1AA",
      "john.smith@gmail.com",
      "07700 900123",
    ],
    mustKeep: ["Cholesterol 5.8", "LDL 3.9", "HDL 1.4", "Fasting Glucose 5.2"],
    minRedactions: 5,
  },
  {
    name: "UK NHS number only",
    region: "UK",
    input: "My NHS number is 943 476 5919.",
    mustContain: ["[NHS-REDACTED]"],
    mustNotContain: ["943 476 5919"],
    minRedactions: 1,
  },
  {
    name: "UK postcode in address",
    region: "UK",
    input: "Address: 12 Oak Lane, SW1A 1AA.",
    mustContain: ["[POSTCODE-REDACTED]"],
    mustNotContain: ["SW1A 1AA"],
    minRedactions: 1,
  },
  {
    name: "UK national insurance number",
    region: "UK",
    input: "NI: AB 12 34 56 C",
    mustContain: ["[NI-REDACTED]"],
    mustNotContain: ["AB 12 34 56 C"],
    minRedactions: 1,
  },

  // --- US -----------------------------------------------------------------
  {
    name: "US SSN (standard dash)",
    region: "US",
    input: "SSN: 123-45-6789",
    mustContain: ["[SSN-REDACTED]"],
    mustNotContain: ["123-45-6789"],
    minRedactions: 1,
  },
  {
    name: "US SSN with en-dash",
    region: "US",
    input: "SSN: 123\u201345\u20136789",
    mustContain: ["[SSN-REDACTED]"],
    mustNotContain: ["123\u201345\u20136789"],
    minRedactions: 1,
  },
  {
    name: "US email + phone",
    region: "US",
    input: "Email me at jane.doe@example.com or call (415) 555-0199.",
    mustContain: ["[EMAIL-REDACTED]", "[PHONE-REDACTED]"],
    mustNotContain: ["jane.doe@example.com", "(415) 555-0199"],
    minRedactions: 2,
  },

  // --- EU -----------------------------------------------------------------
  {
    // The engine's IBAN regex currently matches digits-only IBAN bodies
    // (the simplified DE-style format). Real GB IBANs contain a 4-letter bank
    // code (`GB29 NWBK ...`) and are NOT caught by v1.2. See
    // standalone/SECURITY.md → "Known engine gaps (v1.2)". When the engine is
    // fixed, add a GB-format fixture here.
    name: "EU IBAN (DE-style, digits only)",
    region: "EU",
    input: "Transfer to IBAN DE89 3704 0044 0532 0130 00",
    mustContain: ["[IBAN-REDACTED]"],
    mustNotContain: ["DE89 3704 0044 0532 0130 00"],
    minRedactions: 1,
  },

  // --- Edge cases ---------------------------------------------------------
  {
    name: "Markdown stripping pre-processor",
    region: "UK",
    input: "Patient: **John** *Smith*, NHS ~~943 476 5919~~",
    mustContain: ["[NHS-REDACTED]"],
    mustNotContain: ["943 476 5919", "**", "~~"],
    minRedactions: 1,
  },
  {
    name: "Empty input is safe",
    region: "UK",
    input: "",
    mustContain: [],
    mustNotContain: [],
    minRedactions: 0,
  },
  {
    name: "Clinical data passes through untouched",
    region: "UK",
    input:
      "Total Cholesterol 5.8 mmol/L, LDL 3.9 mmol/L, HDL 1.4 mmol/L, " +
      "Fasting Glucose 5.2 mmol/L, HbA1c 38 mmol/mol.",
    mustContain: [],
    mustNotContain: ["[NAME-REDACTED]", "[NHS-REDACTED]", "[POSTCODE-REDACTED]"],
    mustKeep: ["Cholesterol 5.8", "HDL 1.4", "HbA1c 38"],
    minRedactions: 0,
  },
];

// -------- runner ---------------------------------------------------------

let passed = 0;
let failed = 0;
const failures = [];

for (const f of FIXTURES) {
  const out = redactText(f.input, { region: f.region });
  const errors = [];

  for (const needle of f.mustContain || []) {
    if (!out.redactedText.includes(needle))
      errors.push(`missing token: ${needle}`);
  }
  for (const needle of f.mustNotContain || []) {
    if (out.redactedText.includes(needle))
      errors.push(`PII leaked: ${needle}`);
  }
  for (const needle of f.mustKeep || []) {
    if (!out.redactedText.includes(needle))
      errors.push(`clinical data lost: ${needle}`);
  }
  if (typeof f.minRedactions === "number" && out.totalRedacted < f.minRedactions) {
    errors.push(
      `expected at least ${f.minRedactions} redactions, got ${out.totalRedacted}`
    );
  }

  if (errors.length === 0) {
    passed++;
    console.log(`\u2713  ${f.name}`);
  } else {
    failed++;
    failures.push({ name: f.name, errors, output: out.redactedText });
    console.log(`\u2717  ${f.name}`);
    for (const e of errors) console.log(`    - ${e}`);
  }
}

console.log("");
console.log(`${passed} passed, ${failed} failed, ${FIXTURES.length} total`);

if (failed > 0) {
  console.log("");
  console.log("Failures:");
  for (const f of failures) {
    console.log(`\n--- ${f.name} ---`);
    console.log("Output:", JSON.stringify(f.output));
  }
  process.exit(1);
}
