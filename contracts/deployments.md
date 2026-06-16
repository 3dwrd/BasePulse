# Deployments — PortfolioSnapshot

Canonical record of every on-chain deployment. Addresses are public (safe to commit).
Fill each row right after `forge script ... --broadcast --verify` succeeds, then mirror the
address into `apps/web/.env.local` (`NEXT_PUBLIC_PORTFOLIO_SNAPSHOT_ADDRESS_*`).

Deploy procedure: see [`docs/DEPLOY.md`](../docs/DEPLOY.md). Testnet first, always.
Builder attribution tag baked into the contract calls: `BUILDER_CODE = 0x4241534550554c53`
("BASEPULS") — replace with the real Base Builder Code once registered (Phase 6).

| Network | Chain ID | Contract address | Deployer | Tx hash | Block | Verified | Date |
|---|---|---|---|---|---|---|---|
| Base Sepolia | 84532 | _pending_ | _pending_ | _pending_ | _pending_ | _pending_ | _pending_ |
| Base Mainnet | 8453 | _pending_ | _pending_ | _pending_ | _pending_ | _pending_ | _pending_ |

## Notes
- Estimated deploy cost (simulated 2026-06-17 on Sepolia): ~0.0000044 ETH (~399,865 gas @ 0.011 gwei). Mainnet is comparable — sub-cent.
- Verification links once deployed:
  - Sepolia: `https://sepolia.basescan.org/address/<address>`
  - Mainnet: `https://basescan.org/address/<address>`
