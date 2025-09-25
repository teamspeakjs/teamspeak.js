import { describe, it, expect } from 'vitest';

import type { Channel } from '../src/structures/channel';
import { makeQuery, readEnv, mutationsAllowed as allowMut } from './utils/live';

const env = readEnv();
const describeIf = env && allowMut() ? describe : describe.skip;

describeIf('Live Channel Manager CRUD', () => {
  it('creates, edits, fetches, searches, deletes a channel', { timeout: 60000 }, async () => {
    const q = await makeQuery(env!);

    // create
    const name = `test-${Date.now()}`;
    const topic = `init-${Date.now()}`;
    const created: Channel = await q.channels.create({ name, topic, type: 'temporary' });
    expect(created).toBeTruthy();
    expect(created.name).toBe(name);
    expect(created.topic).toBe(topic);
    const cid = created.id;

    expect(typeof created.id).toBe('number');

    expect(q.channels.cache.has(cid)).toBe(true);

    // edit via structure
    const newTopic = `updated-${Date.now()}`;
    const newDescription = `desc-${Date.now()}`;
    const updated = await created.edit({ topic: newTopic, description: newDescription });
    expect(updated.topic).toBe(newTopic);
    expect(updated.description).toBe(newDescription);

    // fetch via manager (should come from cache unless forced)
    const fetched = await q.channels.fetch(cid);
    expect(fetched.id).toBe(cid);
    expect(fetched.topic).toBe(newTopic);
    expect(fetched.description).toBe(newDescription);

    // search via manager
    const found = await q.channels.search(name);
    expect(found.has(cid)).toBe(true);

    // delete via structure
    await created.delete(true);
    // Verify it no longer appears in search
    const foundAfter = await q.channels.search(name);
    expect(foundAfter.has(cid)).toBe(false);

    expect(q.channels.cache.has(cid)).toBe(false);

    await q.logout();
    q.destroy();
  });
});
