# INTER_AGENT/handoff.md (RedactUs)

Live exchange between agents working on the RedactUs repo. Append, do not overwrite.

Conventions:

- **Q-NNN**, open question.
- **D-NNN**, decision logged.
- **A-NNN**, action assigned.

Read `AGENT_BRIEF.md` in the repo root first. This file is for active exchange only.

Last updated: 2026-06-12 by Perplexity Computer.

---

## Open questions

| ID | Question | Raised by | Status | Notes |
|---|---|---|---|---|
| Q-001 | README opens by referencing "OpenClaw" as an AI tool to use RedactUs against. Likely a copy mistake. Should it be "Perplexity" or something else? | Perplexity Computer (2026-06-12) | closed | Ben confirmed 2026-06-12: OpenClaw is the public OpenAI-owned tool. Reference is intentional, RedactUs is positioned as something you run before sending files to OpenClaw, ChatGPT, Claude, or Perplexity. No change needed. |
| Q-002 | Should the README be refreshed to reflect the wider Whater.org / LocalLayer / Rocketbot brand architecture locked on 2026-06-09 (with the anchor sentence in the footer)? | Perplexity Computer (2026-06-12) | open | Suggest separate `perplexity/v1.3-brand-refresh` branch, not bundled with engine work. |

---

## Decisions logged

| ID | Decision | Date | Decider | Notes |
|---|---|---|---|---|
| D-001 | Adopt two-step commit gate (Rule 9) for this repo on top of existing `CONTRIBUTING.md` workflow. | 2026-06-11 | Ben | Workspace → share → propose → "yes commit" → push. |
| D-002 | `AGENT_BRIEF.md` at repo root is the single orientation file for any AI entering this repo. | 2026-06-11 | Ben | No second orientation doc. |
| D-003 | Branch prefixes already locked in `CONTRIBUTING.md` (`perplexity/`, `emergent/`, `human/`). AGENT_BRIEF references, does not duplicate. | 2026-06-12 | Perplexity Computer | Confirmed against repo state. |

---

## Actions

| ID | Action | Owner | Status | Notes |
|---|---|---|---|---|
| A-001 | Land `AGENT_BRIEF.md` and `INTER_AGENT/handoff.md` in repo. | Perplexity Computer | proposed, awaiting "yes commit" | Workspace drafts shared 2026-06-12. Proposed branch `perplexity/v1.3-agent-brief`. |

---

## Lane reminder

Active agents on the wider system: Ben, Perplexity Computer, Emergent. Currently entering this repo: Perplexity Pro (RedactUs upgrade thread). Claude Code Opus is parked.

If you are a new agent reading this for the first time, introduce yourself in a new row under Actions and state what you intend to do.

---

*End of handoff. Keep it short. Long-form context lives in `AGENT_BRIEF.md` or in the doctorben.ai memory folder.*
