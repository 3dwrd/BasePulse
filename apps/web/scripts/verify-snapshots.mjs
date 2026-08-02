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
const DEPLOY_BLOCK_HINT = 49_180_000n; // ~27-jul-2026, deploy day

function alchemyKey() {
  const env = readFileSync(join(HERE, '..', '..', '..', 'services', 'cache', '.env'), 'utf8');
  const m = env.match(/^ALCHEMY_API_KEY=(.*)$/m);
  if (!m) throw new Error('ALCHEMY_API_KEY not found in services/cache/.env');
  return m[1].trim().replace(/^["']|["']$/g, '');
}

const EVENT = parseAbiItem(
  'event SnapshotRecorded(address indexed user, uint256 indexed index, bytes32 fingerprint, uint64 timestamp, bytes8 builderCode)',
);
const ABI = [parseAbiItem('function totalSnapshots() view returns (uint256)')];

const client = createPublicClient({
  chain: base,
  transport: http(`https://base-mainnet.g.alchemy.com/v2/${alchemyKey()}`),
});

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
const fromBlock = fromArg > -1 ? BigInt(process.argv[fromArg + 1]) : DEPLOY_BLOCK_HINT;

const logs = [];
for (let b = fromBlock; b <= latest; b += 9000n) {
  const toBlock = b + 8999n > latest ? latest : b + 8999n;
  try {
    logs.push(...(await client.getLogs({ address: CONTRACT, event: EVENT, fromBlock: b, toBlock })));
  } catch (e) {
    console.error('  aviso: rango', b, '-', toBlock, 'fallo:', e.shortMessage || e.message);
  }
}

console.log(`\neventos SnapshotRecorded: ${logs.length}\n`);

const wallets = new Set();
let attributed = 0;

for (const log of logs) {
  const [tx, receipt, block] = await Promise.all([
    client.getTransaction({ hash: log.transactionHash }),
    client.getTransactionReceipt({ hash: log.transactionHash }),
    client.getBlock({ blockNumber: log.blockNumber }),
  ]);

  const hasSuffix = tx.input.toLowerCase().endsWith(expectedSuffix);
  if (hasSuffix) attributed += 1;
  wallets.add(log.args.user.toLowerCase());

  const when = new Date(Number(block.timestamp) * 1000).toISOString().replace('T', ' ').slice(0, 16);
  const relayed = tx.from.toLowerCase() !== log.args.user.toLowerCase();

  console.log(`  #${log.args.index}  ${when} UTC`);
  console.log(`     wallet     : ${log.args.user}`);
  console.log(`     tx         : https://basescan.org/tx/${log.transactionHash}`);
  console.log(`     estado     : ${receipt.status}   gas: ${receipt.gasUsed}`);
  console.log(
    `     ATRIBUCION : ${hasSuffix ? 'OK - sufijo ERC-8021 presente' : 'FALTA - sin sufijo, no cuenta para Builder Score'}`,
  );
  console.log(`     enviada por: ${tx.from}${relayed ? '   (distinta del user -> smart wallet / relayer)' : ''}`);
  console.log('');
}

console.log(`wallets distintas : ${wallets.size}`);
console.log(`con atribucion    : ${attributed}/${logs.length}`);
