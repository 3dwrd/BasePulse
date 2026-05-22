import 'server-only';
import { getRedis } from './redis';

const TTL_SECONDS = 5 * 60;
const PREFIX = 'siwb:nonce:';

export async function issueNonce(): Promise<string> {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  await getRedis().set(`${PREFIX}${nonce}`, '1', 'EX', TTL_SECONDS);
  return nonce;
}

export async function consumeNonce(nonce: string): Promise<boolean> {
  const deleted = await getRedis().del(`${PREFIX}${nonce}`);
  return deleted === 1;
}
