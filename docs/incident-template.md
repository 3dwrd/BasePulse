# Incident Template

Used when a Phase verification step fails. Copy this file to `docs/incident-<phase>-<slug>.md` (e.g., `docs/incident-2-portfolio-rpc-quota.md`) and fill it out before deciding whether to retry, replan, or split the Phase.

---

## Incident: <short title>

**Phase**: <number + name>
**Date**: YYYY-MM-DD
**Branch**: <git branch where the failure occurred>
**Commit**: <SHA at the time of failure>
**Severity**: low / medium / high

### What was supposed to happen
<the verification criterion from ROADMAP.md, quoted verbatim>

### What actually happened
<observable behavior: error messages, logs, screenshots if relevant>

### Root cause
<the underlying reason — not just the symptom. If unknown, write "unknown" and list hypotheses>

### Immediate action taken
- [ ] Branch reverted / not merged
- [ ] Verification step rerun: pass / fail
- [ ] Roadmap updated: yes / no

### Decision
One of:
- **Retry** — same plan, fix the specific issue. Owner: <name>. ETA: <date>.
- **Replan** — Phase scope unchanged, approach changed. New approach: <summary>.
- **Split** — Phase too large; split into sub-phases <a> and <b>. Update ROADMAP.md.
- **Defer** — Phase blocked on external dependency <X>. Resume when <condition>.

### Lessons
<one or two bullets — what would have caught this earlier, what to add to CLAUDE.md or test coverage>
