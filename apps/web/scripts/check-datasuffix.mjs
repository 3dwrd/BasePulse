#!/usr/bin/env node
/**
 * Proves the ERC-8021 builder-code suffix actually reaches the wire, without spending gas.
 *
 * Stubs the transport and inspects the `data` field viem hands to eth_sendTransaction, for
 * both paths: with the suffix passed per-call (the fix) and without it (the old behaviour
 * that produced the unattributed snapshot 0x09cb992c…2c60).
 *
 * Run from apps/web:  node scripts/check-datasuffix.mjs
 */

import { createWalletClient, custom, parseAbiItem } from 'viem';
import { base } from 'viem/chains';
import { writeContract } from 'viem/actions';
import { Attribution } from 'ox/erc8021';

const CONTRACT = '0xd2240b90486F63858ED823a2620cb6DC6FcB6019';
const FAKE_SENDER = '0xd103ba1c69bc5a86ce13cf33dec5a1490b9752aa';
const SUFFIX = Attribution.toDataSuffix({ codes: ['bc_bo6g6vzn'] });

const ABI = [parseAbiItem('function record(bytes32 fingerprint, bytes8 builderCode) returns (uint256)')];
const FINGERPRINT = '0x' + 'ab'.repeat(32);
const TAG = '0x4241534550554c53';

let captured = null;

const transport = custom({
  async request({ method, params }) {
    switch (method) {
      case 'eth_chainId':
        return '0x2105';
      case 'eth_accounts':
        return [FAKE_SENDER];
      case 'eth_estimateGas':
        return '0x30000';
      case 'eth_gasPrice':
        return '0x5f5e100';
      case 'eth_maxPriorityFeePerGas':
        return '0x5f5e100';
      case 'eth_getTransactionCount':
        return '0x1';
      case 'eth_getBlockByNumber':
        return { baseFeePerGas: '0x5f5e100', number: '0x1', timestamp: '0x1' };
      case 'eth_sendTransaction':
        captured = params[0];
        return '0x' + '11'.repeat(32);
      default:
        throw new Error(`unstubbed RPC: ${method}`);
    }
  },
});

const client = createWalletClient({ account: FAKE_SENDER, chain: base, transport });

async function run(label, extra) {
  captured = null;
  await writeContract(client, {
    address: CONTRACT,
    abi: ABI,
    functionName: 'record',
    args: [FINGERPRINT, TAG],
    ...extra,
  });
  const data = captured.data.toLowerCase();
  const bytes = (data.length - 2) / 2;
  const ok = data.endsWith(SUFFIX.toLowerCase().replace(/^0x/, ''));
  console.log(`${label}`);
  console.log(`   calldata   : ${bytes} bytes`);
  console.log(`   cola       : …${data.slice(-58)}`);
  console.log(`   atribucion : ${ok ? 'PRESENTE ✓' : 'AUSENTE ✗'}\n`);
  return ok;
}

console.log('sufijo esperado:', SUFFIX, `(${(SUFFIX.length - 2) / 2} bytes)\n`);

const withoutSuffix = await run('SIN dataSuffix (comportamiento viejo)', {});
const withSuffix = await run('CON dataSuffix por llamada (el fix)', { dataSuffix: SUFFIX });

if (withSuffix && !withoutSuffix) {
  console.log('RESULTADO: el fix funciona — el sufijo llega al calldata solo al pasarlo por llamada.');
  process.exit(0);
}
console.log('RESULTADO: INESPERADO — revisar antes de desplegar.');
process.exit(1);
