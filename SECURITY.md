# Security Policy

## Reporting a vulnerability

If you've found a security issue in RedactUs, **please do not open a public issue**.

Use GitHub's private vulnerability reporting:

> [Open a private security advisory](https://github.com/docbones43/RedactUs/security/advisories/new)

This routes directly to the maintainers, stays private until disclosure is coordinated,
and avoids tipping off attackers while a fix is in flight.

What to include:

- A short description of the issue.
- Steps to reproduce, ideally with a minimal text fixture.
- The version / commit SHA you tested against.
- Any suggested fix.

We'll acknowledge within 5 working days.

---

## What counts as a security issue

| Yes — please report                                                          | No — open a normal issue                              |
|-----------------------------------------------------------------------------|-------------------------------------------------------|
| A PII pattern that leaks identity through the redactor                       | Suggestions for new pattern types                     |
| A regex with catastrophic backtracking (DoS)                                 | Engine accuracy improvements                          |
| Code execution via crafted input                                             | Documentation typos                                   |
| The standalone tool making an unexpected network request                     | UI/UX feedback                                        |

A "PII leak" means: text containing an identifier that the engine is documented as
catching (see `standalone/SECURITY.md`) passes through unredacted. If the identifier
class is already listed under **What RedactUs Does NOT Catch**, it's a known
limitation, not a security bug — open a normal issue.

---

## Supported versions

Only the latest tagged release on `main` receives security fixes. RedactUs is a single
file plus a small ES module — there is no LTS branch.

---

## Threat model

The threat model for the standalone tool is in
[`standalone/SECURITY.md`](./standalone/SECURITY.md). Read it before reporting — it
covers exactly what RedactUs protects against and what it does not.
