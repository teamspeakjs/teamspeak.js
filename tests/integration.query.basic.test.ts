import { describe, it, expect } from 'vitest';

import { makeQuery, readEnv, mutationsAllowed as allowMut } from './utils/live';

const env = readEnv();
const describeIf = env && allowMut() ? describe : describe.skip;

describeIf('Live Query basic actions', () => {
  it('connects, logs in, selects server, and runs whoami', { timeout: 30000 }, async () => {
    const q = await makeQuery(env!);
    const who = await q.commands.whoami();
    expect(who).toBeTruthy();
    expect(typeof who.client_login_name).toBe('string');
    await q.logout();
    q.destroy();
  });

  it('returns version information', { timeout: 30000 }, async () => {
    const q = await makeQuery(env!);
    const v = await q.commands.version();
    expect(v).toHaveProperty('version');
    expect(v).toHaveProperty('build');
    expect(v).toHaveProperty('platform');
    q.destroy();
  });

  it('returns hostinfo and channellist', { timeout: 30000 }, async () => {
    const q = await makeQuery(env!);
    const host = await q.commands.hostinfo();
    expect(host).toHaveProperty('instance_uptime');
    expect(host).toHaveProperty('virtualservers_running_total');

    const channels = await q.commands.channellist();
    expect(Array.isArray(channels)).toBe(true);
    if (Array.isArray(channels) && channels.length > 0) {
      expect(channels[0]).toHaveProperty('cid');
    }
    q.destroy();
  });

  it('change query nickname', { timeout: 30000 }, async () => {
    const q = await makeQuery(env!);
    const queryClient = q.client;
    expect(queryClient).toBeTruthy();
    expect(typeof queryClient.nickname).toBe('string');
    expect(typeof queryClient.nickname).toBe('string');
    const newNickname = `tjs.test-${Date.now()}`;
    await queryClient.setNickname(newNickname);
    expect(queryClient.nickname).toBe(newNickname);
    await q.logout();
    q.destroy();
  });
});
