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

## ⚠️ Strategy reality check (2026-06-17) — READ BEFORE INVESTING TIME
- **Builder Rewards (goal #1) is PAUSED/ENDED for Base** (talent.app: "Base Campaign Has
  Ended", last campaign 2026-01-31). NOT a current income source. Re-verify at
  talent.app/~/ecosystems/base before grinding for it.
- **Base airdrop**: no token, no snapshot (not too late), but repriced to ~2027. Lottery ticket.
- **Mode = "ship mínimo"**: make the work real (git ✅ + deploy + base.dev) for cheap
  optionality + portfolio. Do NOT build more features before anything is shipped onchain.
- Full analysis: SESSION_NOTES.md → "2026-06-17 — Recovery session".

## Per-phase status snapshot (as of commit `136a1c0`, 2026-06-17)

| Phase | Status | Commit |
|---|---|---|
| 0 — Bootstrap | ✅ Technical closed. Human steps (Basename, talent.app, domain, Vercel) pending. Human Checkmark blocked-external. | `132942d` |
| 1 — Shell + SIWB | ✅ Local closed. Real-wallet popup test pending (needs hosted deploy). | `3b1f97a` |
| 2 — Portfolio | ✅ Token balances closed. Subgraphs (Aerodrome, Morpho) deferred to Phase 2.5. | `fc7727a` |
| 3 — Gas | ✅ Local closed (7d history + percentile recommendation). | phase-3 |
| 4 — Score + share card | ✅ Local closed (score endpoint + /score + dynamic OG image). | phase-4 |
| 5a — Contract testnet | ✅ Deployed + verified on Sepolia 2026-07-27: `0xd2240b90486F63858ED823a2620cb6DC6FcB6019`. | `06c068e` |
| 5b — Paymaster + mainnet | ✅ Deployed + verified on mainnet 2026-07-27 (same address). Paymaster/gasless UX deferred. | `b0e5414` |
| 6 — Distribution | 🟡 Site live at own URL. `app_id` verification meta tag live. Builder Code registration still pending. | — |
| 7 — Iteration | ⏸ | — |

**Update 2026-07-27 (contract deploy)**: PortfolioSnapshot is live and verified on BOTH
Sepolia and mainnet at `0xd2240b90486F63858ED823a2620cb6DC6FcB6019` (same address on both
— CREATE address depends on deployer+nonce, not chain, and it was the deployer's first tx
on each). Deployer wallet: fresh `cast wallet new` keystore, funded with real ETH by the
owner via Base App. Hit and fixed the Etherscan V2 API migration (old BaseScan keys dead,
see `contracts/foundry.toml` + `ETHERSCAN_API_KEY`). `apps/web/.env.local` has both
`NEXT_PUBLIC_PORTFOLIO_SNAPSHOT_ADDRESS_SEPOLIA` and `..._MAINNET` wired; `SnapshotButton`
is fully live in production. See `contracts/deployments.md` for tx hashes/blocks.

**Update 2026-07-27 (frontend)**: Frontend is live — self-hosted on the owner's VPS at
`https://basepulse.botsniper.xyz` (pm2 + nginx + certbot), not Vercel. See
`docs/SESSION_NOTES.md` for the deploy session and a pre-existing `/score` SSR bug that
got fixed along the way (`WagmiProviderNotFoundError`). Scope was explicitly "website
only" — contract deploy below is still untouched.

**Critical path now (ship mínimo):** deploy PortfolioSnapshot to Sepolia → mainnet
(docs/DEPLOY.md, human-gated key) → base.dev registration with Builder Code.

## Environment on the NEW VPS (rebuilt 2026-06-17)
- Node 22.22.3 via nvm (`nvm use 22`). Foundry 1.7.1 (`export PATH="$PATH:$HOME/.foundry/bin"`).
- Redis: **dedicated container `basepulse-redis` on 127.0.0.1:6391** (NOT the host, NOT other
  projects' redis). `docker start basepulse-redis` if stopped. `REDIS_URL` in both .env files → 6391.
- Git: recovered, remote `https://github.com/3dwrd/BasePulse.git`, branch `phase-5a-contract-testnet`.

## What's running locally (after fresh boot)
Nothing but the `basepulse-redis` container. Start servers manually:
`pnpm --filter @basepulse/web start` (:3200) and `pnpm --filter @basepulse/cache dev` (:4000).

## Secrets that must exist locally (NOT in git)
- `apps/web/.env.local`:
  - `SIWE_SESSION_SECRET` (32+ chars, random)
  - `INTERNAL_API_TOKEN` (shared with cache service)
  - `CACHE_SERVICE_URL=http://localhost:4000`
  - `NEXT_PUBLIC_DEFAULT_CHAIN=base-sepolia`
- `services/cache/.env`:
  - `INTERNAL_API_TOKEN` (same value as above)
  - `CACHE_PORT=4000`
  - `REDIS_URL=redis://127.0.0.1:6391` (dedicated basepulse-redis container)
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
