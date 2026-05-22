# Builder Score Log

Weekly tracking of the developer wallet's Builder Score on talent.app. Goal: ≥ 25 by week 6, ≥ 40 by week 8–10.

## Baseline
- **Wallet**: _to be recorded after Basename registration_
- **Basename**: _to be recorded_
- **talent.app profile**: _URL to be recorded_
- **Baseline date**: _to be recorded (target: week of 2026-05-25)_
- **Baseline score**: _to be recorded_

## Weekly entries

Template (copy + fill at end of each week):

```
### Week N — YYYY-MM-DD
- Score: <number> (Δ from last week: ±X)
- Top contributing signals: <bullet list>
- Activities this week:
  - [ ] Contract deploys: <count, addresses>
  - [ ] MiniApp usage events: <count>
  - [ ] GitHub commits in this repo: <count>
  - [ ] Ecosystem PRs opened/merged: <links>
  - [ ] Farcaster casts (build-in-public): <count>
- What moved the needle: <observation>
- Next week focus: <one or two priorities>
```

### Week 0 — 2026-05-22 (bootstrap + Phase 1 done same day)
- Score: not yet recorded
- Activities this week:
  - [x] Repo bootstrapped with CLAUDE.md, ROADMAP.md, docs/
  - [x] Environment validated (Node 22, Foundry, Redis)
  - [x] 10 Base skills installed
  - [x] Phase 1 (Next.js 16 shell + SIWB auth) closed locally
  - [x] Phase 2 (Portfolio token balances + VPS cache + Redis) closed locally
  - [ ] Basename registration — pending
  - [ ] talent.app profile creation — pending
  - [ ] Human Checkmark — pending
  - [ ] GitHub push + Vercel preview — pending
- Commits this week: `132942d`, `6cfc842`, `3b1f97a`, `7ba5a27`, `fc7727a`, `6d0c0fd`, `6bc1ce2`
- Next session focus: Phase 3 (gas tracker). Human work in parallel: identity setup + Alchemy/CDP keys + domain + GitHub push.

## Verification blockers (external)

### Human Checkmark — BLOCKED 2026-05-22
- **Status**: blocked-external (not our side, no action available now).
- **What was tried**:
  - Worldcoin / World ID — inviable (requires physical Orb, not accessible to user).
  - Second provider (NFC document scan, likely Self.xyz / Civic / Privado ID) — first method never reads document; second method rejects request across multiple retries with different documents.
- **Impact**: NOT a profile-creation gate. Builder Score still accrues from wallet activity, GitHub, and onchain signals. Human Checkmark is a booster (likely +10–25 pts), not a hard requirement for Builder Rewards leaderboard eligibility.
- **Retry cadence**: weekly, on Mondays. If still failing after 4 weeks (by 2026-06-22), evaluate:
  1. Alternative verifications accepted by talent.app (Gitcoin Passport, Coinbase Verifications, BrightID).
  2. Whether Talent+ "Verified Checkmark" ($4.90/mo) is functionally equivalent — only pay if confirmed.
- **Decision recorded for future me**: do NOT block any Phase work on this. Keep shipping code; verification is recoverable later, lost weeks of activity are not.
