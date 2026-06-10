# RedactUs test harness

Reproducible tests for the standalone engine. Zero dependencies, Node 18+.

## Run

From the repo root:

```bash
node standalone/tests/run.mjs
```

Or via npm:

```bash
npm test
```

## What the harness asserts

For each fixture, it verifies three things:

1. **`mustContain`** — every redacted token (e.g. `[NHS-REDACTED]`) appears in the
   output. Catches "the engine didn't redact anything".
2. **`mustNotContain`** — no real PII string remains in the output. Catches the
   primary failure mode: identity leaked through.
3. **`mustKeep`** — clinical / non-PII strings (cholesterol values, lab references,
   the user's question) survive. Catches over-redaction.
4. **`minRedactions`** — the engine reports at least N redactions in its
   `totalRedacted` counter.

The harness deliberately does **not** assert exact string equality on the output.
Replacement boundaries shift as patterns improve; what matters is *PII gone, clinical
data intact*. Tight string-equality tests would create false regressions every time a
regex was tightened.

## Adding fixtures

Append to the `FIXTURES` array in [`run.mjs`](./run.mjs). Use plausible fake data —
never real names, NHS numbers, or contact details.

## What this harness is not

This is a smoke-test suite, not a formal verification. It covers the canonical
documented behaviours from `USER_GUIDE.md` and `SECURITY.md`. For the full picture of
known limitations, read [`../SECURITY.md`](../SECURITY.md).
