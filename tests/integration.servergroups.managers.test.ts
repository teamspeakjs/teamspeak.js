import { describe, it, expect } from 'vitest';

import type { ServerGroup } from '../src/structures/server-group';
import { makeQuery, readEnv, mutationsAllowed as allowMut } from './utils/live';
import { ServerGroupType } from '../src/typings/types';

const env = readEnv();
const describeIf = env && allowMut() ? describe : describe.skip;

describeIf('Live Server Group Manager CRUD', () => {
  it('creates, edits, fetches, searches, deletes a channel', { timeout: 60000 }, async () => {
    const q = await makeQuery(env!);

    // create
    const name = `test-${Date.now()}`;
    const created: ServerGroup = await q.serverGroups.create({
      name,
      type: ServerGroupType.Regular,
    });
    expect(created).toBeTruthy();
    expect(created.name).toBe(name);
    expect(created.type).toBe(ServerGroupType.Regular);
    const cid = created.id;

    expect(typeof created.id).toBe('number');

    expect(q.serverGroups.cache.has(cid)).toBe(true);

    // edit via structure
    const newName = `updated-${Date.now()}`;
    const newType = ServerGroupType.Regular;
    const updated = await created.rename(newName);
    expect(updated.name).toBe(newName);

    // fetch via manager (should come from cache unless forced)
    const fetchedAll = await q.serverGroups.fetch();

    expect(fetchedAll.has(cid)).toBe(true);
    const fetched = fetchedAll.get(cid)!;
    expect(fetched.name).toBe(newName);
    expect(fetched.type).toBe(newType);

    // delete via structure
    await created.delete(true);
    // Verify it no longer appears in search
    const foundAfter = await q.serverGroups.fetch();
    expect(foundAfter.has(cid)).toBe(false);

    expect(q.serverGroups.cache.has(cid)).toBe(false);

    await q.logout();
    q.destroy();
  });
});
