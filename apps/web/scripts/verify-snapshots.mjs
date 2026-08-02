#!/usr/bin/env node
/**
 * Verifies real snapshot activity on the deployed PortfolioSnapshot contract.
 *
 * Answers what the counter alone cannot:
 *   1. How many snapshots exist and from which wallets.
 *   2. Whether each tx carried the ERC-8021 Builder Code suffix. That suffix is what Base
 *      attributes to the builder — a snapshot without it is a wasted transaction as far as
 *      Builder Score is concerned, even though the counter still moves.
 *   3. Whether the sender differs from the recorded user (smart wallet / relayer path).
 *
 * Run from apps/web:  node scripts/verify-snapshots.mjs [--from-block N]
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { base } from 'viem/chains';
import { Attribution } from 'ox/erc8021';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONTRACT = '0xd2240b90486F63858ED823a2620cb6DC6FcB6019';
const BUILDER_CODE = 'bc_bo6g6vzn';

// Two providers, because neither free tier does both jobs:
//   - Alchemy caps eth_getLogs at a **10 block** range (not 10k), so historical sweeps are
//     impossible there — but it is reliable for point reads.
//   - drpc allows 10,000-block getLogs ranges free, but times out on the follow-up
//     tx/receipt/block reads.
// publicnode wants a token for archive reads and mainnet.base.org 403s non-browser clients.
const LOGS_RPC = 'https://base.drpc.org';
const MAX_RANGE = 9_900n;
// MAX_RANGE - 1 so the default lookback is covered by exactly one request; otherwise the
// loop always leaves a trailing single-block query that the free tier tends to drop.
const DEFAULT_LOOKBACK = MAX_RANGE - 1n; // ~5.5h of Base at 2s blocks

function alchemyUrl() {
  const env = readFileSync(join(HERE, '..', '..', '..', 'services', 'cache', '.env'), 'utf8');
  const m = env.match(/^ALCHEMY_API_KEY=(.*)$/m);
  if (!m) throw new Error('ALCHEMY_API_KEY not found in services/cache/.env');
  return `https://base-mainnet.g.alchemy.com/v2/${m[1].trim().replace(/^["']|["']$/g, '')}`;
}

const EVENT = parseAbiItem(
  'event SnapshotRecorded(address indexed user, uint256 indexed index, bytes32 fingerprint, uint64 timestamp, bytes8 builderCode)',
);
const ABI = [parseAbiItem('function totalSnapshots() view returns (uint256)')];

const client = createPublicClient({ chain: base, transport: http(alchemyUrl()) });
const logsClient = createPublicClient({ chain: base, transport: http(LOGS_RPC) });

const expectedSuffix = Attribution.toDataSuffix({ codes: [BUILDER_CODE] })
  .toLowerCase()
  .replace(/^0x/, '');

const total = await client.readContract({
  address: CONTRACT,
  abi: ABI,
  functionName: 'totalSnapshots',
});

console.log('contrato        :', CONTRACT, '(Base mainnet)');
console.log('totalSnapshots  :', total.toString());
console.log('sufijo esperado : 0x' + expectedSuffix, `(builder code ${BUILDER_CODE})`);

if (total === 0n) {
  console.log('\n>>> Todavia CERO. Nadie ha ejecutado record() nunca.');
  process.exit(0);
}

const latest = await client.getBlockNumber();
const fromArg = process.argv.indexOf('--from-block');
const fromBlock =
  fromArg > -1
    ? BigInt(process.argv[fromArg + 1])
    : latest > DEFAULT_LOOKBACK
      ? latest - DEFAULT_LOOKBACK
      : 0n;

const logs = [];
let failedRanges = 0;
for (let b = fromBlock; b <= latest; b += MAX_RANGE) {
  const toBlock = b + MAX_RANGE - 1n > latest ? latest : b + MAX_RANGE - 1n;
  try {
    logs.push(
      ...(await logsClient.getLogs({ address: CONTRACT, event: EVENT, fromBlock: b, toBlock })),
    );
  } catch (e) {
    failedRanges += 1;
    console.error(`  aviso: rango ${b}-${toBlock} fallo: ${e.shortMessage || e.message}`);
  }
}

console.log(`rango escaneado : ${fromBlock} -> ${latest}`);
if (failedRanges) {
  console.log(`AVISO: ${failedRanges} rango(s) fallaron — el listado de abajo esta INCOMPLETO.`);
}

console.log(`\neventos SnapshotRecorded: ${logs.length}\n`);

const wallets = new Set();
let attributed = 0;

for (const log of logs) {
  // Serial, not Promise.all: free RPC tiers throttle concurrent point reads.
  const tx = await client.getTransaction({ hash: log.transactionHash });
  const receipt = await client.getTransactionReceipt({ hash: log.transactionHash });
  const block = await client.getBlock({ blockNumber: log.blockNumber });

  // A smart wallet (Base Account) never sends the call directly: a bundler submits
  // EntryPoint.handleOps, so our record() call — suffix and all — sits nested inside the
  // userOp. endsWith() alone reports those as unattributed, which is wrong.
  const input = tx.input.toLowerCase();
  const attribution = input.endsWith(expectedSuffix)
    ? 'direct'
    : input.includes(expectedSuffix)
      ? 'nested'
      : 'missing';
  const hasSuffix = attribution !== 'missing';
  if (hasSuffix) attributed += 1;
  wallets.add(log.args.user.toLowerCase());

  const when = new Date(Number(block.timestamp) * 1000).toISOString().replace('T', ' ').slice(0, 16);
  const relayed = tx.from.toLowerCase() !== log.args.user.toLowerCase();

  console.log(`  #${log.args.index}  ${when} UTC`);
  console.log(`     wallet     : ${log.args.user}`);
  console.log(`     tx         : https://basescan.org/tx/${log.transactionHash}`);
  console.log(`     estado     : ${receipt.status}   gas: ${receipt.gasUsed}`);
  const attributionLabel = {
    direct: 'OK - sufijo ERC-8021 al final del calldata',
    nested: 'OK - sufijo ERC-8021 dentro del userOp (smart wallet)',
    missing: 'FALTA - sin sufijo, no cuenta para Builder Score',
  }[attribution];
  console.log(`     ATRIBUCION : ${attributionLabel}`);
  console.log(`     enviada por: ${tx.from}${relayed ? '   (distinta del user -> smart wallet / relayer)' : ''}`);
  console.log('');
}

console.log(`wallets distintas : ${wallets.size}`);
console.log(`con atribucion    : ${attributed}/${logs.length}`);
