import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env, USE_MOCK_DATA } from './env.js';
import { cacheGet, cacheSet, redis } from './redis.js';
import { fetchTokenBalances, isSupportedChain, type TokenBalance } from './alchemy.js';
import {
  SUPPORTED_GAS_CHAINS,
  classify,
  computeStats,
  fetchCurrentGasGwei,
  isSupportedGasChain,
  readSamples,
  startSampler,
  type GasCurrent,
  type GasHistory,
} from './gas.js';

const app = Fastify({ logger: { level: env.NODE_ENV === 'production' ? 'info' : 'debug' } });

await app.register(cors, { origin: false });

app.addHook('onRequest', async (req, reply) => {
  if (req.url.startsWith('/health')) return;
  const token = req.headers['x-internal-token'];
  if (token !== env.INTERNAL_API_TOKEN) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

app.get('/health', async () => ({
  ok: true,
  mock: USE_MOCK_DATA,
  redis: redis.status,
}));

interface TokensParams {
  chainId: string;
  address: string;
}

app.get<{ Params: TokensParams }>('/v1/tokens/:chainId/:address', async (req, reply) => {
  const chainId = Number(req.params.chainId);
  const address = req.params.address.toLowerCase() as `0x${string}`;

  if (!isSupportedChain(chainId)) {
    return reply.code(400).send({ error: 'Unsupported chain' });
  }
  if (!/^0x[a-f0-9]{40}$/.test(address)) {
    return reply.code(400).send({ error: 'Invalid address' });
  }

  const cacheKey = `tokens:${chainId}:${address}`;
  const cached = await cacheGet<{ tokens: TokenBalance[]; fetchedAt: number }>(cacheKey);
  if (cached) {
    reply.header('x-cache', 'HIT');
    return cached;
  }

  const tokens = await fetchTokenBalances(chainId, address);
  const payload = { tokens, fetchedAt: Date.now() };
  await cacheSet(cacheKey, payload, 300);
  reply.header('x-cache', 'MISS');
  return payload;
});

interface GasParams {
  chainId: string;
}

app.get<{ Params: GasParams }>('/v1/gas/:chainId/current', async (req, reply) => {
  const chainId = Number(req.params.chainId);
  if (!isSupportedGasChain(chainId)) {
    return reply.code(400).send({ error: 'Unsupported chain' });
  }

  const cacheKey = `gas:${chainId}:current`;
  const cached = await cacheGet<GasCurrent>(cacheKey);
  if (cached) {
    reply.header('x-cache', 'HIT');
    return cached;
  }

  const gwei = await fetchCurrentGasGwei(chainId);
  const samples = await readSamples(chainId);
  const stats = computeStats(samples);
  const payload: GasCurrent = {
    chainId,
    gwei,
    fetchedAt: Date.now(),
    recommendation: classify(gwei, stats),
    stats,
  };
  await cacheSet(cacheKey, payload, 15);
  reply.header('x-cache', 'MISS');
  return payload;
});

app.get<{ Params: GasParams }>('/v1/gas/:chainId/history', async (req, reply) => {
  const chainId = Number(req.params.chainId);
  if (!isSupportedGasChain(chainId)) {
    return reply.code(400).send({ error: 'Unsupported chain' });
  }

  const cacheKey = `gas:${chainId}:history`;
  const cached = await cacheGet<GasHistory>(cacheKey);
  if (cached) {
    reply.header('x-cache', 'HIT');
    return cached;
  }

  const samples = await readSamples(chainId);
  const stats = computeStats(samples);
  const payload: GasHistory = { chainId, samples, stats, fetchedAt: Date.now() };
  await cacheSet(cacheKey, payload, 60);
  reply.header('x-cache', 'MISS');
  return payload;
});

startSampler(SUPPORTED_GAS_CHAINS);

const port = env.PORT;
try {
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`[cache] ready on :${port} (mock=${USE_MOCK_DATA})`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
