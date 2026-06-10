# Changelog

All notable changes to RedactUs are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] — `perplexity/v1.3-tidy` branch

### Added
- Root-level `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `package.json`.
- `.github/ISSUE_TEMPLATE/` with bug and feature templates.
- `standalone/tests/` — reproducible Node-based test harness for the v1.2 fixtures.
- "Install in 30 seconds" section in root README (one-liner commands) — placeholder
  URLs until `v1.4.0` ships the actual installers.

### Changed
- Root README polish: linked OpenClaw to [openclaw.ai](https://openclaw.ai/), tightened
  punctuation, fixed two minor copy issues, expanded the repository-structure tree to
  reflect the new files.
- `extension/.gitkeep` and `packages/.gitkeep` replaced with short `README.md` stubs
  pointing to the (private) `RedactUs-pro` repository.

### Notes
- **No engine code was touched in this branch.** `standalone/redactus-engine.js` and
  `standalone/index.html` are byte-identical to `v1.2`.
- The new test harness surfaced one real engine bug: the v1.2 IBAN regex does not
  match IBANs whose body contains letters (e.g. real GB IBANs like
  `GB29 NWBK 6016 1331 9268 19`). Documented under **Known engine gaps (v1.2)** in
  `standalone/SECURITY.md`. Queued for the `v1.3` engine branch.

---

## [1.2.0] — 2026-03-31

Reconstructed from `standalone/ROADMAP.md` and git history.

### Added — engine v1.2
- US full-address merge (street + city + state + ZIP → single token).
- US city/state/ZIP standalone detection.
- US phone numbers without country code (in phone context).
- Clinician name multi-word + middle-initial support (`Dr FirstName MI. LastName`).
- Standalone `Dr` pattern.
- Insurer-name detection (`Insurance provider:`, `Insurer:`).
- Guarantor-name and next-of-kin / emergency-contact detection.
- Cardholder name (all-caps near `Cardholder:`).
- Hospital reference numbers, insurance / policy / membership IDs.
- Auth / claim / pre-auth code detection.
- Transaction IDs (`TXN-`, `REF-`, `INV-`).
- Card last-4 digits (context-aware).
- Markdown stripping pre-processor (bold, italic, strikethrough, zero-width spaces).
- Unicode dash support (en-dash, non-breaking hyphen) for SSN matching.
- Cross-line name capture prevention (`[^\S\n]+`).
- Pattern priority ordering (US patterns first in US mode; insurer before clinician).

### Fixed
- IBAN / phone regex conflict.

### Status
- 11 canonical test cases passing.
- Three synced engine surfaces:
  - `standalone/index.html` (embedded copy)
  - `standalone/redactus-engine.js` (importable module)
  - AI Doctor Ben in-app copy at `frontend/src/utils/redactionEngine.js` (out of repo)

---

## [1.0.0] — 2026-02-18

### Added
- Initial public release of the standalone tool.
- Phase 1 Privacy Guard UI (in-app).
- Phase 2 client-side regex engine — UK / US / EU pattern libraries.
- Phase 4 Prompt Guard (in-app system-prompt prefix).
- `standalone/` package: `index.html`, `redactus-engine.js`, `README.md`,
  `USER_GUIDE.md`, `SECURITY.md`, `ROADMAP.md`, `LICENSE` (MIT).

[Unreleased]: https://github.com/docbones43/RedactUs/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/docbones43/RedactUs/releases/tag/v1.2.0
[1.0.0]: https://github.com/docbones43/RedactUs/releases/tag/v1.0.0
