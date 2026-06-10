# Contributing to RedactUs

Thanks for taking an interest. RedactUs is small, opinionated, and built to stay that
way. Read this once and you're set.

---

## Branching model

`main` is always shippable. Never commit directly to it.

Branch names declare authorship so `git log` is self-documenting:

| Prefix       | Who owns it                                     |
|--------------|-------------------------------------------------|
| `perplexity/`| Work generated with the Perplexity Computer agent |
| `emergent/`  | Work generated with the Emergent agent           |
| `human/`     | Hand-written commits from a human contributor    |

Each branch is one workstream, e.g. `perplexity/v1.3-tidy`,
`emergent/v1.4-installers`, `human/fix-postcode-regex`.

Commit messages keep the same tag so attribution is searchable forever:

```
chore(pplx): add CHANGELOG and CONTRIBUTING
fix(emergent): tighten NHS number regex on cross-line input
feat(human): add Welsh postcode patterns
```

---

## Pull-request workflow

1. Create the branch.
2. Open a **draft PR** as soon as the first commit exists — it gives reviewers something
   to watch.
3. Mark it ready for review when:
   - All tests in `standalone/tests/` pass locally (`node standalone/tests/run.mjs`).
   - The diff has been re-read end-to-end.
   - `CHANGELOG.md` has an entry under `[Unreleased]`.
4. Squash-merge to `main`. The squash commit subject keeps the same `prefix:` tag.
5. Tag releases on `main` only, with `git tag vX.Y.Z` followed by a GitHub Release.

---

## What changes need what

| Type of change                          | Tests | CHANGELOG | Roadmap |
|-----------------------------------------|-------|-----------|---------|
| Engine logic (regex, replacement, etc.) | Yes   | Yes       | Maybe   |
| Engine refactor with no behaviour change| Yes   | Yes       | No      |
| Docs / README / typo                    | No    | Yes       | No      |
| New tier or product surface             | Yes   | Yes       | Yes     |
| Test-harness changes                    | N/A   | Yes       | No      |

---

## Running the tests

```bash
node standalone/tests/run.mjs
```

No dependencies. Node 18+ only. The harness imports `standalone/redactus-engine.js`
directly and runs the canonical UK / US / EU fixtures from `USER_GUIDE.md`.

---

## Honest limitations stay honest

Any change to detection logic must be reflected in `standalone/SECURITY.md`. If a new
pattern catches a previously-unhandled identifier class, document it. If a known
limitation is closed, remove it. If a new failure mode appears, add it.

RedactUs's selling point is honesty about what it does and doesn't catch. Don't dilute
that to ship faster.

---

## Reporting vulnerabilities

Do not open public issues for security bugs. Use the
[private security advisory form](https://github.com/docbones43/RedactUs/security/advisories/new)
on the Security tab of the repo.

See [`SECURITY.md`](./SECURITY.md) for the full policy.
