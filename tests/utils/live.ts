import 'dotenv/config';
import { Query } from '../../src';
import { hexString } from '../../src/utils/random';

export type QueryEnv = {
  host: string;
  queryPort: number;
  username: string;
  password: string;
  sid?: number;
  virtualServerPort?: number;
  nickname?: string;
};

export function readEnv(): QueryEnv | null {
  const host = process.env.TS_HOST;
  const username = process.env.TS_USERNAME;
  const password = process.env.TS_PASSWORD;
  const queryPortStr = process.env.TS_QUERY_PORT || process.env.TS_PORT;
  const sidStr = process.env.TS_VIRTUALSERVER_SID;
  const vsPortStr = process.env.TS_VIRTUALSERVER_PORT;

  const queryPort = queryPortStr ? Number(queryPortStr) : 10011;
  const sid = sidStr ? Number(sidStr) : undefined;
  const virtualServerPort = vsPortStr ? Number(vsPortStr) : undefined;

  if (!host || !username || !password || (!sid && !virtualServerPort)) return null;
  return { host, queryPort, username, password, sid, virtualServerPort };
}

export function waitForReady(q: Query, timeoutMs: number = 10_000): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const cleanup: (fn: () => void) => void = (fn) => {
      clearTimeout(timer);
      q.off('Ready', onReady);
      q.off('Error', onError);
      q.off('Close', onClose);
      fn();
    };

    const onReady: () => void = () => cleanup(resolve);
    const onError: (e: unknown) => void = (e) => cleanup(() => reject(e));
    const onClose: () => void = () =>
      cleanup(() => reject(new Error('connection closed before ready')));
    const timer = setTimeout(
      () => cleanup(() => reject(new Error('timeout waiting for ready'))),
      timeoutMs,
    );

    q.on('Ready', onReady);
    q.on('Error', onError);
    q.on('Close', onClose);
  });
}

export async function makeQuery(env: QueryEnv): Promise<Query> {
  const q = new Query({ host: env.host, port: env.queryPort });
  q.connect();
  await waitForReady(q, 15_000);
  await q.login(env.username, env.password);
  await q.virtualServers.use({
    id: env.sid,
    nickname: 'teamspeak.test - ' + hexString(8),
  });
  return q;
}

export function mutationsAllowed(): boolean {
  return process.env.TS_ALLOW_MUTATIONS === '1' || process.env.TS_ALLOW_MUTATIONS === 'true';
}
