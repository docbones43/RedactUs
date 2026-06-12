# AGENT_BRIEF.md (RedactUs)

Orientation for any AI tool entering this repo. Read this first, every session. Companion to `CONTRIBUTING.md` (workflow) and `README.md` (product). This file covers the wider context that those two do not.

Last updated: 2026-06-12 by Perplexity Computer, on Ben's instruction.

---

## 1. Who you are working with

Dr Ben Bacon. Solo founder. Direct, plain, slightly British voice. Short declarative sentences. First-person. Honest about limitations. No marketing gloss. **No em-dashes.** Use commas, full stops, colons, parentheses, or new sentences.

KISS principle. Action over analysis-paralysis. Ben calls this Jarvis mode. Your job is to deliver, not deliberate. Zero ego on either side.

---

## 2. Where RedactUs sits in the wider system

**Anchor sentence (use verbatim where the wider system is referenced):**

> Built by Whater.org. Powered by LocalLayer. First products: RedactUS, Rocketbot, and AI Doctor Ben.

System map:

- **Whater.org**, mission home and consultancy front door. Foundation in formation. Corporates, governments, and grant programmes engage here to embed LocalLayer in their organisation.
- **LocalLayer**, the engine. A reflective local control layer for AI systems, described in the EveR paper (v2.3.1, September 2025). Lives at locallayer.net.
- **RedactUs**, this repo. The free, open-source wedge. Strips personal identifiers from text before any prompt leaves the device. Proves the architecture in public. Funnels into AI Doctor Ben and Whater.org partner work.
- **Rocketbot**, sibling tool in development at `github.com/docbones43/rocketbot`.
- **AI Doctor Ben**, the first paid implementation, at the.aidoctorben.com.
- **Lux Lucer**, internal-only multi-model, multi-perspective search tool at `github.com/docbones43/luxlucer`. Observation role only, not yet public.

If you are working in this repo, your job is to make RedactUs the cleanest possible demonstration of the wider thesis.

---

## 3. Legal entity rules (CRITICAL, non-negotiable)

- **Qudos Hub Ltd**, the only public legal entity. Companies House 16784632. ICO ZC121687. UK GDPR data controller.
- **Yu-Scan Ltd** owns the underlying IP and **MUST NEVER appear on any public surface.** Not in code comments, not in docs, not in commit messages, not in READMEs, not in licence files. If you see it anywhere public, flag it immediately.
- **Whater.org** is the mission brand. Qudos Hub Ltd is the operator. Both can appear publicly. Yu-Scan never can.
- The current root README credits "© Whater.org" and "Built by the AI Doctor Ben team." Both are fine. Do not add Qudos Hub Ltd to the product README unless you are also adding the equivalent legal-entity footer; that decision is open.
- **Public repo vs private repo.** Public repo (`docbones43/RedactUs`) = shipped artefacts only. Private repo (`docbones43/RedactUs-internal`) = thinking, drafts, IP-sensitive design notes, strategy, pricing internals, churn/retention plans. If a file describes the business model, internal architecture rationale, or anything Yu-Scan-adjacent, it belongs in the private repo. When in doubt, draft private, promote public.

---

## 4. Commit discipline (Rule 9, locked)

The repo already documents its workflow in `CONTRIBUTING.md`. Use it. Two additional gates on top:

1. **Two-step commit gate.** Write to workspace first. Share the file. Propose the exact commit (paths, message, branch). Wait for Ben to say "yes commit" before any `git push`.
2. **Show the commit message before push.** Every time.

Branch prefixes are already locked in CONTRIBUTING.md:

| Prefix | Owner |
|---|---|
| `perplexity/` | Perplexity Computer agent |
| `emergent/` | Emergent agent |
| `human/` | Hand-written by a human contributor |

Add your prefix to any new branch you open. Match it in the commit subject (`chore(pplx): ...`, `fix(emergent): ...`, `feat(human): ...`).

Other rules:

- Never delete branches. Only Ben deletes branches, after Emergent has seen the diff.
- `main` is always shippable. Never commit directly to it.
- Squash-merge to `main`. Squash subject keeps the same `prefix:` tag.
- Tag releases on `main` only.

---

## 5. Active agent set (locked 2026-06-11)

Currently active on the wider system:

- **Ben**, decision authority, owns all final calls.
- **Perplexity Computer**, system-wide orchestration, brand, hosting, docs, lane allocation.
- **Emergent**, primary code lane on AI Doctor Ben and connected products.
- **Whichever tool is reading this brief** (e.g. Perplexity Pro in the RedactUs thread).

Parked:

- **Claude Code Opus**, pending local Ollama plan. Route Claude-style tasks via Perplexity Pro or Perplexity Computer.

Cross-agent handoffs use the `INTER_AGENT/` folder convention. See `INTER_AGENT/handoff.md` in this repo. Wider system context lives in the private repo `docbones43/doctorben.ai` under `memory/` and `INTER_AGENT/`.

---

## 6. Voice rules (LOCKED)

- First-person where appropriate. Ben is "I". "We" only when describing the wider Whater.org system deliberately.
- Short declarative sentences. Honest about what does not yet work.
- No marketing gloss. No "revolutionary", "game-changing", "seamless".
- **No em-dashes.** Replace with commas, full stops, colons, parentheses, or split into two sentences.
- Slightly British spelling. "Organisation" not "organization". "Utilise" is not allowed, use "use".
- One claim per sentence. If you need two, use two sentences.
- Honest limitations stay honest. RedactUs's selling point is honesty about what it does and does not catch. Do not dilute that to ship faster (this rule is already in CONTRIBUTING.md, repeated here for visibility).

---

## 7. Session start checklist (run every new session in this repo)

1. Read this file.
2. Read `README.md`.
3. Read `CHANGELOG.md`. Note the latest `[Unreleased]` entries.
4. Read `CONTRIBUTING.md` if you have not already this week.
5. Read `INTER_AGENT/handoff.md` if it exists.
6. Read the latest `PREDEPLOY_SUMMARY_*.md` if any.
7. Check current open branches and PRs (`gh pr list`, `gh api repos/docbones43/RedactUs/branches`).
8. State the expertise lens you are adopting for this session.
9. State the proposed first action.
10. Wait for Ben to confirm before acting.

---

## 8. Session end checklist (before stopping)

1. Append a Checkpoint entry to `INTER_AGENT/handoff.md` (Done / Decided / Next / Carried-forward).
2. Add a `CHANGELOG.md [Unreleased]` entry if anything was committed.
3. If anything blocking emerged, add a row to `INTER_AGENT/handoff.md`.
4. If anything was learned that should outlast this session, surface it to Ben so it can be saved to system-wide memory.
5. State the next session's first action.

---

## 9. Standing authorisation

When Ben says "proceed with all tasks you suggest if I have not said so already", that authorisation **persists through the queue**. Do not stop after each locked decision and ask again. Work the queue. Surface decisions only when they are genuinely blocking or genuinely novel.

Default to action on reversible things (drafts, workspace files). Pause on irreversible things (commits, pushes, deletions, public sends).

---

## 10. Where the cross-product memory lives

Canonical source for system-wide context is the **private** repo:

> `github.com/docbones43/doctorben.ai`

Key folders inside it:

- `memory/`, brand architecture, PRD, decision log, session protocol, test protocol.
- `INTER_AGENT/`, live handoff between agents at system level.
- `CLAUDE_TASKS/`, decisions pending, queued for Ben.

This RedactUs repo stays focused on RedactUs code. When you need wider context (legal-entity rules, voice rules, system architecture, lane allocation between agents), look there. If you cannot access it, ask Ben for the relevant excerpt.

---

## 11. RedactUs-specific positioning

- **What it does:** strips personal identifiers (names, addresses, NHS numbers, SSNs, MRNs, etc.) from text before that text is sent to any AI model.
- **Where it runs:** entirely client-side, in the browser, zero server calls, zero dependencies, works offline. Single HTML file plus a small ES module.
- **Why it matters:** it makes "send to a cloud LLM" safe for sensitive contexts.
- **Strategic role:** RedactUs is the free wedge. Free standalone tool, paid Browser Extension and RedactUs Preview to follow. It proves the architecture in public, seeds the funnel for AI Doctor Ben and the Whater.org consultancy work.
- **What it is NOT:** a SaaS, a full DLP product, a replacement for proper data governance. RedactUs is one well-built tool that does one important thing.

### Engine surfaces (keep these synced)

Three places hold engine code:

1. `standalone/index.html`, embedded copy.
2. `standalone/redactus-engine.js`, importable module.
3. AI Doctor Ben in-app at `frontend/src/utils/redactionEngine.js` (out of this repo).

Any engine change must be reflected in all three, and in `standalone/SECURITY.md` if behaviour changes.

### Open product roadmap items (as of CHANGELOG `[Unreleased]`)

- `v1.3` engine branch, IBAN-with-letters regex fix is queued.
- `v1.4.0` will ship the one-click installers (curl-bash on Linux/Mac, `irm | iex` on Windows).
- Paid tiers (Browser Extension, Preview) live in the private `RedactUs-pro` repo.

---

## 12. Common mistakes to avoid

- Do not mention Yu-Scan Ltd anywhere public.
- Do not use em-dashes.
- Do not commit without "yes commit".
- Do not delete branches.
- Do not push to the private `RedactUs-pro` repo from work done here. They are deliberately separated. Free and paid tiers each have their own repo.
- Do not invent features that do not exist in the code.
- Do not write in "we, the team" voice as if there is a headcount. Use Whater.org as the mission, not as a team count.
- Do not add Google Analytics, tracking pixels, or third-party scripts to the standalone tool. Zero network calls is a feature, not an accident.

---

## 13. Known issues in the current repo (so any agent reading this can confirm or fix)

| Issue | Note |
|---|---|
| README references "OpenClaw" as an AI tool. | Looks like a copy mistake. Most likely should be "Perplexity" or another known tool. Flag with Ben before touching. |
| README does not yet reflect the wider Whater.org / LocalLayer / Rocketbot brand architecture locked on 2026-06-09. | Future PR, low priority, do not bundle with engine work. |
| `extension/` and `packages/` are stubs pointing to a private `RedactUs-pro` repo. | Confirmed intentional. |

---

*End of brief. If anything here conflicts with what Ben says in the current session, Ben wins. Flag the conflict so the brief can be updated.*
