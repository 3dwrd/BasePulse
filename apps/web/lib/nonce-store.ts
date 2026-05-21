const TTL_MS = 5 * 60 * 1000;

interface Entry {
  expires: number;
}

const store = new Map<string, Entry>();

function gc() {
  const now = Date.now();
  for (const [nonce, entry] of store) {
    if (entry.expires <= now) store.delete(nonce);
  }
}

export function issueNonce(): string {
  gc();
  const nonce = crypto.randomUUID().replace(/-/g, '');
  store.set(nonce, { expires: Date.now() + TTL_MS });
  return nonce;
}

export function consumeNonce(nonce: string): boolean {
  gc();
  const entry = store.get(nonce);
  if (!entry || entry.expires <= Date.now()) return false;
  store.delete(nonce);
  return true;
}
