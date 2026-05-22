# Handoff — for the next Claude Code session

**Paste this prompt as your first message to a fresh Claude Code session inside `/root/Proyectos/BasePulse/`:**

---

```
Estoy retomando el proyecto BasePulse después de cerrar Phase 2. Antes de tocar
código, hacé esto en orden:

1. Leé estos archivos en este orden y resumime cada uno en una línea:
   - CLAUDE.md
   - ROADMAP.md (focalizate en "Phase 3 — Gas tracker")
   - docs/SESSION_NOTES.md (en particular la sección "Next session bootstrap"
     al inicio, y la entrada más reciente de Phase 2 al final)
   - docs/decisions.md (ADRs vigentes)

2. Corré el environment quick-check que está en SESSION_NOTES.md → "Next session
   bootstrap" → "Environment quick-check". Reportame el output.

3. Listame las skills disponibles en .agents/skills/ (nombre + 1 línea). Identificá
   cuáles aplican a Phase 3.

4. Basado en la sección "Phase 3 — Gas tracker: starting plan" en SESSION_NOTES.md,
   proponeme un plan refinado de Phase 3 con:
   - Sub-fases ordenadas (3.1, 3.2, 3.3, 3.4)
   - Decisiones abiertas (Q1, Q2, Q3 ya listadas) — pedime mi OK explícito
   - Criterio de verificación al final de Phase 3

NO generes código todavía. Esperá mi "OK Phase 3" antes de tocar archivos.

Reglas del loop (recordatorio):
- Plan → mi OK → ejecutás → verificás → commit con resumen en el body.
- Después de cada Phase: actualizar SESSION_NOTES.md, ROADMAP.md, builder-score-log.md.
- Si una verificación falla, NO mergear; abrir docs/incident-<phase>.md y parar.
- Type-safe end to end, no `any`. Versiones exactas, no rangos `^`.
- Port 3200 web, 4000 cache. Foundry PATH ya en ~/.bashrc.
```

---

## Per-phase status snapshot (as of commit `6d0c0fd`, 2026-05-22)

| Phase | Status | Commit |
|---|---|---|
| 0 — Bootstrap | ✅ Technical closed. Human steps (Basename, talent.app, Human Checkmark, domain, GitHub push, Vercel) pending. | `132942d`, `6cfc842` |
| 1 — Shell + SIWB | ✅ Local closed. Real-wallet popup test pending (needs Vercel preview). | `3b1f97a` |
| 2 — Portfolio | ✅ Token balances closed. Subgraphs (Aerodrome, Morpho) deferred to Phase 2.5. | `fc7727a` |
| 3 — Gas | ⏸ Next up. | — |
| 4 — Score + share card | ⏸ | — |
| 5a — Contract testnet | ⏸ | — |
| 5b — Paymaster + mainnet | ⏸ | — |
| 6 — Distribution | ⏸ | — |
| 7 — Iteration | ⏸ | — |

## What's running locally (after fresh boot)
Nothing. Both servers (`pnpm --filter @basepulse/web start` on :3200 and `pnpm --filter @basepulse/cache dev` on :4000) were stopped at end of session. Restart manually when working on Phase 3.

## Secrets that must exist locally (NOT in git)
- `apps/web/.env.local`:
  - `SIWE_SESSION_SECRET` (32+ chars, random)
  - `INTERNAL_API_TOKEN` (shared with cache service)
  - `CACHE_SERVICE_URL=http://localhost:4000`
  - `NEXT_PUBLIC_DEFAULT_CHAIN=base-sepolia`
- `services/cache/.env`:
  - `INTERNAL_API_TOKEN` (same value as above)
  - `CACHE_PORT=4000`
  - `REDIS_URL=redis://localhost:6379`
  - `ALCHEMY_API_KEY` (optional — empty = mock mode)

If these files don't exist anymore (VPS reboot, accidental delete), regenerate with:
```bash
SECRET=$(openssl rand -hex 32)
TOKEN=$(openssl rand -hex 24)
cat > apps/web/.env.local <<EOF
SIWE_SESSION_SECRET=$SECRET
INTERNAL_API_TOKEN=$TOKEN
CACHE_SERVICE_URL=http://localhost:4000
NEXT_PUBLIC_DEFAULT_CHAIN=base-sepolia
EOF
cat > services/cache/.env <<EOF
INTERNAL_API_TOKEN=$TOKEN
CACHE_PORT=4000
REDIS_URL=redis://localhost:6379
EOF
```
